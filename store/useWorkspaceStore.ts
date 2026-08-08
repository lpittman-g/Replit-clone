import { create } from "zustand";

export type ToolId =
  | "files"
  | "packages"
  | "secrets"
  | "git"
  | "database"
  | "settings";

export type PaneId = "terminal" | "console" | "preview" | "agent";

export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
};

export type OpenTab = {
  id: string;
  dirty: boolean;
};

export type SecretEntry = {
  id: string;
  key: string;
  value: string;
};

export type ConsoleLog = {
  id: string;
  level: "stdout" | "stderr" | "info";
  message: string;
  timestamp: number;
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type WorkspaceSettings = {
  theme: "dark" | "light";
  fontSize: number;
  indentSize: number;
  indentType: "spaces" | "tabs";
};

type WorkspaceState = {
  projectName: string;
  branch: string;
  fileTree: FileNode[];
  activeTool: ToolId;
  sidebarOpen: boolean;
  openTabs: OpenTab[];
  activeFileId: string | null;
  openPanes: PaneId[];
  activePane: PaneId;
  secrets: SecretEntry[];
  packages: string[];
  consoleLogs: ConsoleLog[];
  terminalOutput: string[];
  agentMessages: AgentMessage[];
  settings: WorkspaceSettings;
  isRunning: boolean;
  cpuUsage: number;
  ramUsage: number;
  previewUrl: string;
  previewKey: number;

  setActiveTool: (tool: ToolId) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openFile: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  createFile: (parentId: string | null, name: string) => void;
  createFolder: (parentId: string | null, name: string) => void;
  deleteNode: (nodeId: string) => void;
  setActivePane: (pane: PaneId) => void;
  togglePane: (pane: PaneId) => void;
  addSecret: (key: string, value: string) => void;
  removeSecret: (id: string) => void;
  addPackage: (name: string) => void;
  removePackage: (name: string) => void;
  appendConsoleLog: (level: ConsoleLog["level"], message: string) => void;
  clearConsole: () => void;
  appendTerminalOutput: (line: string) => void;
  sendAgentMessage: (content: string) => void;
  updateSettings: (partial: Partial<WorkspaceSettings>) => void;
  runProject: () => void;
  stopProject: () => void;
  refreshPreview: () => void;
};

function findNode(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateNodeContent(
  nodes: FileNode[],
  id: string,
  content: string,
): FileNode[] {
  return nodes.map((node) => {
    if (node.id === id && node.type === "file") {
      return { ...node, content };
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeContent(node.children, id, content),
      };
    }
    return node;
  });
}

function insertChild(
  nodes: FileNode[],
  parentId: string | null,
  child: FileNode,
): FileNode[] {
  if (parentId === null) return [...nodes, child];
  return nodes.map((node) => {
    if (node.id === parentId && node.type === "folder") {
      return { ...node, children: [...(node.children ?? []), child] };
    }
    if (node.children) {
      return {
        ...node,
        children: insertChild(node.children, parentId, child),
      };
    }
    return node;
  });
}

function removeNode(nodes: FileNode[], id: string): FileNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children
        ? { ...node, children: removeNode(node.children, id) }
        : node,
    );
}

function collectFileIds(nodes: FileNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === "file") ids.push(node.id);
    if (node.children) ids.push(...collectFileIds(node.children));
  }
  return ids;
}

let idCounter = 100;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const initialFileTree: FileNode[] = [
  {
    id: "folder-src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "file-index-html",
        name: "index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Replit Clone</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="app">
      <h1>Hello from Replit Clone</h1>
      <p>Edit files on the left and watch the preview update.</p>
      <button id="run">Run demo</button>
    </main>
    <script src="main.js"></script>
  </body>
</html>
`,
      },
      {
        id: "file-styles-css",
        name: "styles.css",
        type: "file",
        content: `:root {
  color-scheme: dark;
  font-family: Inter, system-ui, sans-serif;
}

body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at top, #1c4b39, #0e1117 55%);
  color: #e8eaed;
  display: grid;
  place-items: center;
}

.app {
  width: min(520px, 90vw);
  padding: 2rem;
  border: 1px solid #2b3240;
  border-radius: 16px;
  background: rgba(14, 17, 23, 0.75);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

button {
  margin-top: 1rem;
  border: 0;
  border-radius: 999px;
  padding: 0.7rem 1.2rem;
  background: #1c4b39;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
`,
      },
      {
        id: "file-main-js",
        name: "main.js",
        type: "file",
        content: `const button = document.getElementById("run");

button?.addEventListener("click", () => {
  console.log("Demo button clicked");
  button.textContent = "Running…";
  setTimeout(() => {
    button.textContent = "Run demo";
  }, 800);
});

console.log("Workspace ready");
`,
      },
    ],
  },
  {
    id: "folder-server",
    name: "server",
    type: "folder",
    children: [
      {
        id: "file-app-py",
        name: "app.py",
        type: "file",
        content: `from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "replit-clone"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
`,
      },
    ],
  },
  {
    id: "file-package-json",
    name: "package.json",
    type: "file",
    content: `{
  "name": "replit-clone-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node src/main.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}
`,
  },
  {
    id: "file-readme",
    name: "README.md",
    type: "file",
    content: `# Replit Clone Demo

Open \`src/index.html\` and press Run to see the workspace in action.
`,
  },
];

export function getLanguageFromFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
}

export function selectFileById(fileTree: FileNode[], id: string) {
  return findNode(fileTree, id);
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  projectName: "replit-clone",
  branch: "main",
  fileTree: initialFileTree,
  activeTool: "files",
  sidebarOpen: true,
  openTabs: [{ id: "file-index-html", dirty: false }],
  activeFileId: "file-index-html",
  openPanes: ["terminal", "console", "preview", "agent"],
  activePane: "preview",
  secrets: [
    {
      id: "secret-1",
      key: "DATABASE_URL",
      value: "postgresql://user:pass@localhost:5432/app",
    },
    { id: "secret-2", key: "API_KEY", value: "sk-demo-••••••••" },
  ],
  packages: ["express", "react", "flask"],
  consoleLogs: [
    {
      id: "log-1",
      level: "info",
      message: "Workspace initialized",
      timestamp: Date.now() - 5000,
    },
  ],
  terminalOutput: ["Welcome to Replit Clone Terminal", "$ ready"],
  agentMessages: [
    {
      id: "agent-1",
      role: "assistant",
      content:
        "I can help you edit files, debug errors, or scaffold features. What should we build?",
    },
  ],
  settings: {
    theme: "dark",
    fontSize: 14,
    indentSize: 2,
    indentType: "spaces",
  },
  isRunning: false,
  cpuUsage: 12,
  ramUsage: 34,
  previewUrl: "/preview.html",
  previewKey: 0,

  setActiveTool: (tool) =>
    set((state) => ({
      activeTool: tool,
      sidebarOpen: state.activeTool === tool ? !state.sidebarOpen : true,
    })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openFile: (fileId) => {
    const node = findNode(get().fileTree, fileId);
    if (!node || node.type !== "file") return;
    set((state) => {
      const exists = state.openTabs.some((tab) => tab.id === fileId);
      return {
        openTabs: exists
          ? state.openTabs
          : [...state.openTabs, { id: fileId, dirty: false }],
        activeFileId: fileId,
      };
    });
  },

  closeTab: (fileId) =>
    set((state) => {
      const openTabs = state.openTabs.filter((tab) => tab.id !== fileId);
      const activeFileId =
        state.activeFileId === fileId
          ? (openTabs.at(-1)?.id ?? null)
          : state.activeFileId;
      return { openTabs, activeFileId };
    }),

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  updateFileContent: (fileId, content) =>
    set((state) => ({
      fileTree: updateNodeContent(state.fileTree, fileId, content),
      openTabs: state.openTabs.map((tab) =>
        tab.id === fileId ? { ...tab, dirty: true } : tab,
      ),
    })),

  createFile: (parentId, name) => {
    const id = nextId("file");
    const child: FileNode = { id, name, type: "file", content: "" };
    set((state) => ({
      fileTree: insertChild(state.fileTree, parentId, child),
      openTabs: [...state.openTabs, { id, dirty: false }],
      activeFileId: id,
      activeTool: "files",
      sidebarOpen: true,
    }));
  },

  createFolder: (parentId, name) => {
    const child: FileNode = {
      id: nextId("folder"),
      name,
      type: "folder",
      children: [],
    };
    set((state) => ({
      fileTree: insertChild(state.fileTree, parentId, child),
      activeTool: "files",
      sidebarOpen: true,
    }));
  },

  deleteNode: (nodeId) =>
    set((state) => {
      const node = findNode(state.fileTree, nodeId);
      const removedIds = new Set(node ? collectFileIds([node]) : []);
      if (node?.type === "file") removedIds.add(nodeId);

      const openTabs = state.openTabs.filter((tab) => !removedIds.has(tab.id));
      const activeFileId =
        state.activeFileId && removedIds.has(state.activeFileId)
          ? (openTabs.at(-1)?.id ?? null)
          : state.activeFileId;

      return {
        fileTree: removeNode(state.fileTree, nodeId),
        openTabs,
        activeFileId,
      };
    }),

  setActivePane: (pane) =>
    set((state) => ({
      activePane: pane,
      openPanes: state.openPanes.includes(pane)
        ? state.openPanes
        : [...state.openPanes, pane],
    })),

  togglePane: (pane) =>
    set((state) => {
      const isOpen = state.openPanes.includes(pane);
      if (isOpen && state.openPanes.length === 1) return state;
      const openPanes = isOpen
        ? state.openPanes.filter((p) => p !== pane)
        : [...state.openPanes, pane];
      const activePane =
        state.activePane === pane && isOpen
          ? (openPanes[0] ?? state.activePane)
          : isOpen
            ? state.activePane
            : pane;
      return { openPanes, activePane };
    }),

  addSecret: (key, value) =>
    set((state) => ({
      secrets: [...state.secrets, { id: nextId("secret"), key, value }],
    })),

  removeSecret: (id) =>
    set((state) => ({
      secrets: state.secrets.filter((secret) => secret.id !== id),
    })),

  addPackage: (name) =>
    set((state) =>
      state.packages.includes(name)
        ? state
        : { packages: [...state.packages, name] },
    ),

  removePackage: (name) =>
    set((state) => ({
      packages: state.packages.filter((pkg) => pkg !== name),
    })),

  appendConsoleLog: (level, message) =>
    set((state) => ({
      consoleLogs: [
        ...state.consoleLogs,
        {
          id: nextId("log"),
          level,
          message,
          timestamp: Date.now(),
        },
      ],
    })),

  clearConsole: () => set({ consoleLogs: [] }),

  appendTerminalOutput: (line) =>
    set((state) => ({
      terminalOutput: [...state.terminalOutput, line],
    })),

  sendAgentMessage: (content) => {
    const userMessage: AgentMessage = {
      id: nextId("agent"),
      role: "user",
      content,
    };
    const reply: AgentMessage = {
      id: nextId("agent"),
      role: "assistant",
      content: `Got it — I'll help with: "${content}". Open a file or describe the change you want next.`,
    };
    set((state) => ({
      agentMessages: [...state.agentMessages, userMessage, reply],
      activePane: "agent",
      openPanes: state.openPanes.includes("agent")
        ? state.openPanes
        : [...state.openPanes, "agent"],
    }));
  },

  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  runProject: () => {
    set({
      isRunning: true,
      activePane: "console",
      cpuUsage: 48,
      ramUsage: 61,
    });
    get().appendTerminalOutput("$ npm run start");
    get().appendTerminalOutput("> Starting development server…");
    get().appendConsoleLog(
      "stdout",
      "Server listening on http://localhost:3000",
    );
    get().appendConsoleLog("info", "Preview refreshed");
    set((state) => ({ previewKey: state.previewKey + 1 }));
    setTimeout(() => {
      set({ isRunning: false, cpuUsage: 18, ramUsage: 42 });
      get().appendTerminalOutput("✓ Run completed");
    }, 1600);
  },

  stopProject: () => {
    set({ isRunning: false, cpuUsage: 8, ramUsage: 28 });
    get().appendConsoleLog("stderr", "Process stopped by user");
    get().appendTerminalOutput("^C");
  },

  refreshPreview: () =>
    set((state) => ({ previewKey: state.previewKey + 1 })),
}));
