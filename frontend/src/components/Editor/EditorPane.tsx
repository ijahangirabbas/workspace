import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  Bold,
  CheckSquare,
  Clock,
  Code,
  Heading1,
  Heading2,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  SpellCheck,
  Star,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

export function EditorPane() {
  const {
    activePage,
    createPage,
    updatePage,
    togglePinPage,
    saveStatus,
    settings,
  } = useWorkspace();

  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);

  // References to keep track of current page state to flush saves before switching
  const currentPageIdRef = useRef<string | null>(null);
  const currentTitleRef = useRef<string>("");
  const currentHtmlRef = useRef<string>("");

  currentTitleRef.current = title;
  currentHtmlRef.current = html;

  // Flush save on activePage switch or unmount
  useEffect(() => {
    const prevPageId = currentPageIdRef.current;

    // If there was a previous page with unsaved content, flush save
    if (prevPageId && prevPageId !== activePage?._id) {
      void updatePage(prevPageId, {
        title: currentTitleRef.current.trim() || "Untitled Page",
        content: { type: "html", html: currentHtmlRef.current },
      });
    }

    currentPageIdRef.current = activePage?._id ?? null;

    if (!activePage) {
      setTitle("");
      setHtml("");
      return;
    }

    setTitle(activePage.title);
    const nextHtml = readHtml(activePage.content);
    setHtml(nextHtml);
    if (editorRef.current && editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [activePage?._id, updatePage]);

  // Debounced autosave
  useEffect(() => {
    if (!activePage) return;
    const timer = window.setTimeout(() => {
      void updatePage(activePage._id, {
        title: title.trim() || "Untitled Page",
        content: { type: "html", html },
      });
    }, settings.autosaveInterval);
    return () => window.clearTimeout(timer);
  }, [activePage, html, settings.autosaveInterval, title, updatePage]);

  // Keyboard shortcut for manual save (Ctrl+S)
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!activePage) return;

      if (event.ctrlKey && event.key.toLowerCase() === "/") {
        event.preventDefault();
        runCommand("insertUnorderedList");
      }

      if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void updatePage(activePage._id, {
          title: title.trim() || "Untitled Page",
          content: { type: "html", html },
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePage, html, title, updatePage]);

  const actions = useMemo(
    () => [
      {
        label: "Heading 1",
        icon: Heading1,
        run: () => runCommand("formatBlock", "h1"),
      },
      {
        label: "Heading 2",
        icon: Heading2,
        run: () => runCommand("formatBlock", "h2"),
      },
      { label: "Bold", icon: Bold, run: () => runCommand("bold") },
      { label: "Italic", icon: Italic, run: () => runCommand("italic") },
      {
        label: "Underline",
        icon: UnderlineIcon,
        run: () => runCommand("underline"),
      },
      {
        label: "Strike",
        icon: Strikethrough,
        run: () => runCommand("strikeThrough"),
      },
      {
        label: "Bullet List",
        icon: List,
        run: () => runCommand("insertUnorderedList"),
      },
      {
        label: "Number List",
        icon: ListOrdered,
        run: () => runCommand("insertOrderedList"),
      },
      { label: "Checklist", icon: CheckSquare, run: insertChecklistItem },
      {
        label: "Quote",
        icon: Quote,
        run: () => runCommand("formatBlock", "blockquote"),
      },
      {
        label: "Callout / Note",
        icon: Info,
        run: insertCalloutBlock,
      },
      {
        label: "Code",
        icon: Code,
        run: () => runCommand("formatBlock", "pre"),
      },
      {
        label: "Rule",
        icon: Minus,
        run: () => runCommand("insertHorizontalRule"),
      },
      { label: "Link", icon: Link2, run: insertLink },
      { label: "Table", icon: Table2, run: insertTable },
    ],
    [],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // 1. Run markdown shortcuts handler
    handleMarkdownShortcut(event);

    // 2. Handle Enter key for inline timestamps
    if (event.key === "Enter" && activePage?.showTimestamps) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        const textNode = selection.anchorNode;
        const text = textNode?.textContent?.trim() || "";

        let blockNode = selection.anchorNode;
        while (blockNode && blockNode !== editorRef.current) {
          if (blockNode.nodeType === Node.ELEMENT_NODE) {
            break;
          }
          blockNode = blockNode.parentNode;
        }

        const parentElement =
          blockNode && blockNode !== editorRef.current
            ? (blockNode as HTMLElement)
            : editorRef.current;

        if (text && parentElement && !parentElement.querySelector(".time-badge")) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const dateStr = now.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
          const timestamp = `${timeStr} · ${dateStr}`;

          const badge = document.createElement("span");
          badge.className = "time-badge";
          badge.setAttribute("contenteditable", "false");
          badge.textContent = timestamp;

          range.insertNode(badge);
          range.setStartAfter(badge);
          range.setEndAfter(badge);
          selection.removeAllRanges();
          selection.addRange(range);

          setTimeout(() => {
            if (editorRef.current) {
              setHtml(editorRef.current.innerHTML);
            }
          }, 10);
        }
      }
    }
  };

  if (!activePage) {
    return (
      <main className="editor-empty">
        <div>
          <h1>Welcome</h1>
          <p>Select a page from the sidebar or create a new page to start writing.</p>
          <button className="primary-button" onClick={() => void createPage()}>
            Create Page
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="editor-pane"
      style={
        {
          "--editor-width": `${settings.editorWidth}px`,
          "--editor-font-size": `${settings.fontSize}px`,
        } as CSSProperties
      }
    >
      <div className="editor-toolbar" aria-label="Formatting toolbar">
        {actions.map((action) => (
          <button
            key={action.label}
            className="icon-button"
            aria-label={action.label}
            title={action.label}
            onClick={action.run}
          >
            <action.icon size={17} />
          </button>
        ))}

        <div className="toolbar-separator" />

        <button
          className={`icon-button ${activePage.isPinned ? "active" : ""}`}
          aria-label={activePage.isPinned ? "Unfavorite Page" : "Favorite Page"}
          title={activePage.isPinned ? "Unfavorite Page" : "Favorite Page"}
          onClick={() => void togglePinPage(activePage._id)}
        >
          <Star
            size={17}
            className={`star-icon ${activePage.isPinned ? "filled" : ""}`}
          />
        </button>

        <button
          className={`icon-button timestamp-toggle-btn ${activePage.showTimestamps ? "active" : ""}`}
          aria-label="Toggle Timestamps"
          title="Toggle Timestamps"
          onClick={() => {
            void updatePage(activePage._id, {
              showTimestamps: !activePage.showTimestamps,
            });
          }}
        >
          <Clock size={17} />
        </button>
        <button
          className={`icon-button spellcheck-toggle-btn ${activePage.disableSpellcheck ? "active" : ""}`}
          aria-label="Toggle Spellcheck"
          title="Toggle Spellcheck"
          onClick={() => {
            void updatePage(activePage._id, {
              disableSpellcheck: !activePage.disableSpellcheck,
            });
          }}
        >
          <SpellCheck size={17} />
        </button>
        <span className="save-status">{saveStatus}</span>
      </div>
      <article
        className={`writing-surface ${activePage.showTimestamps ? "show-timestamps" : "hide-timestamps"}`}
      >
        <input
          className="title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Page title"
          placeholder="Untitled Page"
        />
        <div
          ref={editorRef}
          className="editor-content"
          contentEditable
          spellCheck={!activePage.disableSpellcheck}
          role="textbox"
          aria-label="Page content"
          data-placeholder="Write, plan, think... (use # for Heading, - for list, or format toolbar above)"
          suppressContentEditableWarning
          onInput={(event) => setHtml(event.currentTarget.innerHTML)}
          onKeyDown={handleKeyDown}
        />
      </article>
    </main>
  );
}

function readHtml(content: unknown): string {
  if (content && typeof content === "object" && "html" in content) {
    return String((content as { html?: unknown }).html ?? "");
  }

  return "";
}

function runCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function insertLink() {
  const url = window.prompt("Enter URL");
  if (url) runCommand("createLink", url);
}

function insertChecklistItem() {
  runCommand(
    "insertHTML",
    '<p><label><input type="checkbox" />&nbsp;Checklist item</label></p>',
  );
}

function insertCalloutBlock() {
  runCommand(
    "insertHTML",
    '<blockquote class="callout-block">💡 <strong>Note:</strong> Add important context, notes, or tips here...</blockquote><p></p>',
  );
}

function insertTable() {
  runCommand(
    "insertHTML",
    "<table><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead><tbody><tr><td>Data 1</td><td>Data 2</td></tr><tr><td>Data 3</td><td>Data 4</td></tr></tbody></table><p></p>",
  );
}

function handleMarkdownShortcut(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== " ") return;

  const selection = window.getSelection();
  const text = selection?.anchorNode?.textContent ?? "";
  const shortcut = text.trim();

  if (shortcut === "#") {
    event.preventDefault();
    if (selection?.anchorNode) {
      selection.anchorNode.textContent = "";
    }
    runCommand("formatBlock", "h1");
  }

  if (shortcut === "##") {
    event.preventDefault();
    if (selection?.anchorNode) {
      selection.anchorNode.textContent = "";
    }
    runCommand("formatBlock", "h2");
  }

  if (shortcut === "-") {
    event.preventDefault();
    if (selection?.anchorNode) {
      selection.anchorNode.textContent = "";
    }
    runCommand("insertUnorderedList");
  }

  if (shortcut === ">") {
    event.preventDefault();
    if (selection?.anchorNode) {
      selection.anchorNode.textContent = "";
    }
    runCommand("formatBlock", "blockquote");
  }
}

