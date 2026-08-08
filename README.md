# Replit Clone

A Replit-inspired IDE workspace built with Next.js (App Router), TypeScript, Tailwind CSS, Monaco Editor, xterm.js, and Zustand.

## Features

- Header with Run/Deploy/Secrets/Invite controls
- Left tool rail: Files, Packages, Secrets, Git, Database, Settings
- Tabbed Monaco editor with dirty indicators
- Bottom Shell/Console + right Webview/Agent panes
- Status bar with branch, indentation, and mock CPU/RAM gauges
- Backend execution engine at `POST /api/execute` (Node/Python child processes with timeout + output limits), streamed into Xterm

## Getting started

```bash
npm install
cp .env.example .env
# set DATABASE_URL, AUTH_SECRET, and optional OAuth keys
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Auth & persistence

- Auth.js with optional GitHub/Google OAuth + demo credentials login
- Prisma + PostgreSQL models: `User`, `Project`, `File` (+ Auth.js tables)
- `/login` → `/dashboard` lists saved Repls
- `/workspace/[projectId]` loads a Repl and autosaves file tree edits

Demo account (after seed): `demo@replit-clone.local` / `demo1234`

### Run button

- Open a `.js` or `.py` file and press **Run** (or `⌘/Ctrl+Enter`) to execute it via `/api/execute`.
- Output streams into the Shell (Xterm) and Console panes in real time.
- Open `.html` / `.css` and press **Run** to refresh the Webview preview.
- Press **Stop** or `Ctrl+C` in the Shell to abort a running process.
