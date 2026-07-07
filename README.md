# 📁 Workspace

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![pnpm](https://img.shields.io/badge/pnpm-Workspace-orange?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

**Workspace** is a professional, developer-first personal knowledge management application. It is designed to combine the clean structure of code editors with the fluid utility of rich text editors. It features a VS Code-style folder tree, a fully extensible rich-text editor powered by TipTap, real-time metadata tracking, dynamic layouts with persistent layouts state, and a robust local-first feel backed by an Express/MongoDB backend.

---

## 🌟 Key Features

- **VS Code-Style Explorer**: Navigable hierarchy with nested folders, folders expansion, dynamic document routing, and clean, clutter-free sidebar navigation.
- **Rich Text Editor**: Seamless editor built with [TipTap](https://tiptap.dev/), featuring custom formatting extensions, inline lists, heading styles, and a local-first autosave engine.
- **Page Metadata**: Rich attributes for each page including dynamic titles, creation and modification timestamps, and extensible schema support.
- **Dynamic Resizable Panels**: Fully adjustable sidebar and right panels using fluid layout components that persist user layout choices across sessions.
- **Offline-Ready UX**: Instant UI feedback on file/folder actions with REST-based synchronization to guarantee zero data loss.
- **API Security & Validation**: Robust server-side validation powered by **Zod**, request protection via **Helmet**, and fine-grained CORS settings.

---

## 🛠️ Tech Stack

### Frontend (Client)

- **React 18**: Modern UI rendering with Hooks and Context API.
- **Vite**: Next-generation frontend tooling for ultra-fast Hot Module Replacement (HMR).
- **TypeScript**: Full compile-time safety and type validation.
- **Lucide React**: Crisp, modern SVG iconography.
- **TipTap**: Extensible headless editor framework.

### Backend (Server)

- **Node.js & Express**: High-performance HTTP routing engine.
- **Mongoose (MongoDB ODM)**: Elegant object modeling for schemas and relations.
- **TypeScript & tsx**: Dynamic watch execution for Express in dev mode.
- **Helmet & CORS**: Essential HTTP security header protection and origin access control.
- **Morgan**: Standardized HTTP request logging.
- **Zod**: Runtime schema definition and request validation.

---

## 📁 Repository Layout

The repository is configured as a monorepo workspace for seamless frontend and backend integration:

```text
├── client/                     # Frontend Application (Vite + React + TS)
│   ├── src/
│   │   ├── components/        # Reusable UI components (Sidebar, Editor, etc.)
│   │   ├── context/           # Global React Contexts (Workspace, UI status)
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── layouts/           # Page and panel splitting structure
│   │   ├── services/          # API communication layer (fetch wrappers)
│   │   ├── styles/            # Styling system, tokens, and CSS configuration
│   │   ├── types.ts           # Global TypeScript interface definitions
│   │   └── main.tsx           # Client entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend API & DB layer (Express + TS)
│   ├── src/
│   │   ├── config/            # Env and MongoDB setup files
│   │   ├── controllers/       # Route request & response handlers
│   │   ├── middleware/        # Express error handler, security, CORS
│   │   ├── models/            # Mongoose schemas (Folder, Page)
│   │   ├── routes/            # Route routers (folderRoutes, pageRoutes)
│   │   ├── utils/             # Helper utilities
│   │   ├── app.ts             # Server application initialization
│   │   └── index.ts           # Server runner and port listener
│   └── package.json
│
├── package.json                # Monorepo root configuration
├── pnpm-workspace.yaml         # Monorepo workspace configuration
└── LICENSE                     # MIT License
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [pnpm](https://pnpm.io/) or `npm` / `yarn`
- [MongoDB](https://www.mongodb.com/try/download/community) (either running locally or a MongoDB Atlas cloud URI)

### Local Installation

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/ijahangirabbas/workspace.git
    cd workspace
    ```

2.  **Install Monorepo Dependencies**:
    Run the following command at the repository root:

    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in the `server` directory. You can copy the example file:

    ```bash
    cp server/.env.example server/.env
    # For Windows PowerShell:
    copy server\.env.example server\.env
    ```

    Configure the variables inside `server/.env`:

    ```env
    PORT=4000
    MONGODB_URI=mongodb://127.0.0.1:27017/workspace
    CLIENT_ORIGIN=http://localhost:5173
    ```

4.  **Run MongoDB (Optional - Docker)**:
    If you do not have MongoDB running locally, you can spin up a local instance using Docker:
    ```bash
    docker run -p 27017:27017 -d --name mongo mongo:6
    ```

### Running the Application

To start both the client and server concurrently in development mode, run:

```bash
npm run dev
```

This starts:

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend Server**: [http://localhost:4000](http://localhost:4000)

---

## 🔌 API Endpoints Reference

The backend server exposes the following REST API endpoints:

### Folder Endpoints

| Method   | Endpoint       | Description                            | Payload Example                                 |
| :------- | :------------- | :------------------------------------- | :---------------------------------------------- |
| `GET`    | `/folders`     | Retrieves all folders in the workspace | N/A                                             |
| `POST`   | `/folders`     | Creates a new folder                   | `{"name": "Documents", "parentFolderId": null}` |
| `PATCH`  | `/folders/:id` | Updates a folder (e.g., rename, move)  | `{"name": "New Name"}`                          |
| `DELETE` | `/folders/:id` | Deletes a folder and its children      | N/A                                             |

### Page Endpoints

| Method   | Endpoint     | Description                          | Payload Example                                |
| :------- | :----------- | :----------------------------------- | :--------------------------------------------- |
| `GET`    | `/pages`     | Retrieves all pages in the workspace | N/A                                            |
| `POST`   | `/pages`     | Creates a new page                   | `{"title": "Untitled Page", "folderId": "id"}` |
| `PATCH`  | `/pages/:id` | Updates page content and metadata    | `{"title": "Updated", "content": "..."}`       |
| `DELETE` | `/pages/:id` | Deletes a specific page              | N/A                                            |

---

## 🤝 Contributing Guidelines

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Workflow

1.  **Fork the Project** on GitHub.
2.  **Create your Feature Branch**:
    ```bash
    git checkout -b feat/amazing-feature
    ```
    _Use descriptive branch prefixes:_
    - `feat/` for new features
    - `fix/` for bug fixes
    - `docs/` for documentation updates
    - `refactor/` for code refactoring
3.  **Commit your Changes**:
    Use semantic commit messages (e.g., `feat: add support for markdown shortcuts`).
    ```bash
    git commit -m "feat: add amazing feature"
    ```
4.  **Push to the Branch**:
    ```bash
    git push origin feat/amazing-feature
    ```
5.  **Open a Pull Request** pointing to the `main` branch.

### Coding Standards

- **TypeScript**: Explicit type definitions should be used where inference is not obvious. Avoid using `any`.
- **Linting**: Ensure all code passes ESLint checks:
  ```bash
  npm run lint
  ```
- **Formatting**: Format all changes using Prettier prior to committing:
  ```bash
  npm run format
  ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
Copyright © 2026 Jahangir Abbas. All rights reserved.
