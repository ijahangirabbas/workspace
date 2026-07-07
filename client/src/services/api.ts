import type { Folder, Page } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(payload.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getFolders: () => request<Folder[]>("/folders"),
  createFolder: (data: Partial<Folder>) => request<Folder>("/folders", body("POST", data)),
  updateFolder: (id: string, data: Partial<Folder>) => request<Folder>(`/folders/${id}`, body("PATCH", data)),
  deleteFolder: (id: string) => request<void>(`/folders/${id}`, { method: "DELETE" }),
  getPages: () => request<Page[]>("/pages"),
  createPage: (data: Partial<Page>) => request<Page>("/pages", body("POST", data)),
  updatePage: (id: string, data: Partial<Page>) => request<Page>(`/pages/${id}`, body("PATCH", data)),
  deletePage: (id: string) => request<void>(`/pages/${id}`, { method: "DELETE" })
};

function body(method: string, data: unknown): RequestInit {
  return { method, body: JSON.stringify(data) };
}
