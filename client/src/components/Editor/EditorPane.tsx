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
  Code,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

export function EditorPane() {
  const { activePage, createPage, updatePage, saveStatus, settings } =
    useWorkspace();
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activePage) return;
    setTitle(activePage.title);
    const nextHtml = readHtml(activePage.content);
    setHtml(nextHtml);
    if (editorRef.current && editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [activePage?._id]);

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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

  if (!activePage) {
    return (
      <main className="editor-empty">
        <div>
          <h1>Welcome</h1>
          <p>Select a page from the sidebar or create a new page.</p>
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
        <span className="save-status">{saveStatus}</span>
      </div>
      <article className="writing-surface">
        <input
          className="title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Page title"
        />
        <div
          ref={editorRef}
          className="editor-content"
          contentEditable
          role="textbox"
          aria-label="Page content"
          data-placeholder="Write, plan, think..."
          suppressContentEditableWarning
          onInput={(event) => setHtml(event.currentTarget.innerHTML)}
          onKeyDown={handleMarkdownShortcut}
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
  const url = window.prompt("URL");
  if (url) runCommand("createLink", url);
}

function insertChecklistItem() {
  runCommand(
    "insertHTML",
    '<p><label><input type="checkbox" />&nbsp;Checklist item</label></p>',
  );
}

function insertTable() {
  runCommand(
    "insertHTML",
    "<table><thead><tr><th>Column</th><th>Column</th></tr></thead><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table><p></p>",
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
}
