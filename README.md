# Workspace

Workspace is a production-oriented full-stack personal knowledge workspace. It uses a VS Code-like folder explorer, a rich text page editor, autosave, page metadata, settings, and a clean dark interface.

## Stack

- React, TypeScript, Vite
- TipTap rich text editor
- Node.js, Express, TypeScript
- MongoDB with Mongoose

## Getting Started

```bash
npm install
cp server/.env.example server/.env
npm run dev
```

The client runs on `http://localhost:5173` and the API runs on `http://localhost:4000`.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Environment

Set `MONGODB_URI` in `server/.env`. A local MongoDB URI is included in the example file.

## Deployment

- Frontend: Vercel, using `client` as the project root.
- Backend: Render or Railway, using `server` as the project root.
- Database: MongoDB Atlas.
