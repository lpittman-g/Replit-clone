"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
      Loading editor...
    </div>
  ),
});

type MockFile = {
  id: string;
  path: string;
  content: string;
};

type TreeNode = {
  id: string;
  name: string;
  path: string;
  type: "folder" | "file";
  children?: TreeNode[];
};

const initialFiles: MockFile[] = [
  {
    id: "index-html",
    path: "project/index.html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Replit Clone Preview</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="app-shell">
      <p class="eyebrow">Browser IDE Mock</p>
      <h1>Build in the editor, preview on the right.</h1>
      <button id="run-button">Run mock script</button>
      <pre id="output"></pre>
    </main>
  </body>
</html>`,
  },
  {
    id: "styles-css",
    path: "project/styles.css",
    content: `:root {
  color-scheme: dark;
  font-family: Inter, system-ui, sans-serif;
  background: #09090b;
  color: #f4f4f5;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at top, rgba(59, 130, 246, 0.35), transparent 40%),
    #09090b;
}

.app-shell {
  width: min(480px, calc(100vw - 32px));
  padding: 32px;
  border-radius: 24px;
  background: rgba(24, 24, 27, 0.9);
  border: 1px solid rgba(244, 244, 245, 0.1);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.eyebrow {
  margin: 0 0 12px;
  color: #93c5fd;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.75rem;
}

button {
  margin-top: 24px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  padding: 12px 18px;
  font-weight: 600;
  cursor: pointer;
}

#output {
  margin: 16px 0 0;
  padding: 16px;
  border-radius: 16px;
  background: rgba(9, 9, 11, 0.8);
  color: #86efac;
}`,
  },
  {
    id: "main-js",
    path: "project/main.js",
    content: `const output = document.getElementById("output");
const button = document.getElementById("run-button");

button?.addEventListener("click", () => {
  const time = new Date().toLocaleTimeString();
  if (output) {
    output.textContent = \"Mock build completed at \" + time;
  }
});`,
  },
  {
    id: "readme-md",
    path: "notes/README.md",
    content: `# Mock workspace

- Create files in the explorer
- Switch between tabs in the editor
- Use the terminal actions to append mocked stdout`,
  },
];

const initialTerminalLines = [
  "$ npm install",
  "added 42 packages in 1.2s",
  "$ npm run dev",
  "ready - mock development server started on http://localhost:3000",
];

function insertNode(nodes: TreeNode[], parts: string[], fileId: string, currentPath = "") {
  const [part, ...rest] = parts;
  if (!part) {
    return;
  }

  const nextPath = currentPath ? `${currentPath}/${part}` : part;
  const isFile = rest.length === 0;
  let node = nodes.find((item) => item.name === part && item.path === nextPath);

  if (!node) {
    node = {
      id: isFile ? fileId : nextPath,
      name: part,
      path: nextPath,
      type: isFile ? "file" : "folder",
      children: isFile ? undefined : [],
    };
    nodes.push(node);
  }

  if (!isFile) {
    insertNode(node.children ?? (node.children = []), rest, fileId, nextPath);
  }
}

function buildTree(files: MockFile[]): TreeNode[] {
  const nodes: TreeNode[] = [];

  files.forEach((file) => insertNode(nodes, file.path.split("/").filter(Boolean), file.id));

  const sortNodes = (items: TreeNode[]): TreeNode[] =>
    items
      .map((item) => ({
        ...item,
        children: item.children ? sortNodes(item.children) : undefined,
      }))
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

  return sortNodes(nodes);
}

function getFileName(path: string) {
  return path.split("/").pop() ?? path;
}

function getDefaultContent(path: string) {
  if (path.endsWith(".html")) {
    return "<main>\n  <h1>New HTML file</h1>\n</main>";
  }

  if (path.endsWith(".css")) {
    return ".new-file {\n  display: block;\n}";
  }

  if (path.endsWith(".js") || path.endsWith(".ts")) {
    return "console.log('New file ready');";
  }

  if (path.endsWith(".json")) {
    return '{\n  "name": "new-file"\n}';
  }

  if (path.endsWith(".md")) {
    return "# New file\n";
  }

  return "";
}

function getLanguage(path: string) {
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  return "plaintext";
}

function createPreviewDocument(files: MockFile[]) {
  const htmlFile = files.find((file) => file.path.endsWith(".html"));
  const css = files
    .filter((file) => file.path.endsWith(".css"))
    .map((file) => file.content)
    .join("\n\n");
  const js = files
    .filter((file) => file.path.endsWith(".js"))
    .map((file) => file.content)
    .join("\n\n");

  const baseHtml = htmlFile?.content ?? "<main><h1>Preview ready</h1></main>";

  const htmlWithStyles = baseHtml.includes("</head>")
    ? baseHtml.replace("</head>", `<style>${css}</style></head>`)
    : `<style>${css}</style>${baseHtml}`;

  return htmlWithStyles.includes("</body>")
    ? htmlWithStyles.replace("</body>", `<script>${js}<\/script></body>`)
    : `${htmlWithStyles}<script>${js}<\/script>`;
}

function ResizeHandle() {
  return (
    <Separator className="relative w-2 bg-zinc-950/90 transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-zinc-800 hover:bg-zinc-900 data-[resize-handle-state=drag]:bg-blue-500/30" />
  );
}

function FileTree({
  nodes,
  activeFileId,
  onOpenFile,
  onDeleteFile,
}: {
  nodes: TreeNode[];
  activeFileId: string | null;
  onOpenFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
}) {
  return (
    <ul className="space-y-1 text-sm text-zinc-300">
      {nodes.map((node) => (
        <li key={node.id}>
          {node.type === "folder" ? (
            <div>
              <div className="rounded-md px-2 py-1 font-medium text-zinc-500">📁 {node.name}</div>
              {node.children?.length ? (
                <div className="ml-3 border-l border-zinc-800 pl-3">
                  <FileTree
                    nodes={node.children}
                    activeFileId={activeFileId}
                    onOpenFile={onOpenFile}
                    onDeleteFile={onDeleteFile}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenFile(node.id)}
                className={`flex-1 rounded-md px-2 py-1 text-left transition ${
                  activeFileId === node.id
                    ? "bg-blue-500/15 text-blue-200"
                    : "hover:bg-zinc-900"
                }`}
              >
                📄 {node.name}
              </button>
              <button
                type="button"
                aria-label={`Delete ${node.name}`}
                onClick={() => onDeleteFile(node.id)}
                className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-900 hover:text-rose-300"
              >
                ×
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export function IdeWorkspace() {
  const [files, setFiles] = useState<MockFile[]>(initialFiles);
  const [openFileIds, setOpenFileIds] = useState<string[]>([initialFiles[0].id, initialFiles[1].id]);
  const [activeFileId, setActiveFileId] = useState<string>(initialFiles[0].id);
  const [newFilePath, setNewFilePath] = useState("project/components/new-file.ts");
  const [terminalLines, setTerminalLines] = useState<string[]>(initialTerminalLines);
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const tree = useMemo(() => buildTree(files), [files]);
  const activeFile = files.find((file) => file.id === activeFileId) ?? null;
  const openFiles = openFileIds
    .map((id) => files.find((file) => file.id === id) ?? null)
    .filter((file): file is MockFile => file !== null);
  const previewDocument = useMemo(() => createPreviewDocument(files), [files]);

  useEffect(() => {
    if (!terminalContainerRef.current || terminalRef.current) {
      return;
    }

    const terminal = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily: "var(--font-geist-mono), monospace",
      fontSize: 13,
      theme: {
        background: "#09090b",
        foreground: "#e4e4e7",
        green: "#86efac",
        blue: "#93c5fd",
      },
    });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(terminalContainerRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    resizeObserver.observe(terminalContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    terminalRef.current.reset();
    terminalLines.forEach((line) => terminalRef.current?.writeln(line));
    fitAddonRef.current?.fit();
  }, [terminalLines]);

  const openFile = (fileId: string) => {
    setOpenFileIds((current) => (current.includes(fileId) ? current : [...current, fileId]));
    setActiveFileId(fileId);
  };

  const updateFileContent = (value: string | undefined) => {
    if (!activeFile) {
      return;
    }

    setFiles((current) =>
      current.map((file) =>
        file.id === activeFile.id ? { ...file, content: value ?? "" } : file,
      ),
    );
  };

  const closeTab = (fileId: string) => {
    const remainingOpenIds = openFileIds.filter((id) => id !== fileId);
    setOpenFileIds(remainingOpenIds);
    if (activeFileId === fileId) {
      setActiveFileId(remainingOpenIds[remainingOpenIds.length - 1] ?? "");
    }
  };

  const deleteFile = (fileId: string) => {
    const remainingFiles = files.filter((file) => file.id !== fileId);
    const remainingOpenIds = openFileIds.filter((id) => id !== fileId);
    setFiles(remainingFiles);
    setOpenFileIds(remainingOpenIds);

    if (activeFileId === fileId) {
      setActiveFileId(remainingOpenIds[remainingOpenIds.length - 1] ?? remainingFiles[0]?.id ?? "");
    }

    setTerminalLines((current) => [
      ...current,
      `$ rm ${files.find((file) => file.id === fileId)?.path ?? fileId}`,
    ]);
  };

  const createFile = () => {
    const normalizedPath = newFilePath.trim().replace(/^\/+/, "");
    if (!normalizedPath) {
      return;
    }

    const existingFile = files.find((file) => file.path === normalizedPath);
    if (existingFile) {
      openFile(existingFile.id);
      return;
    }

    const nextFile: MockFile = {
      id: `${normalizedPath}-${Date.now()}`,
      path: normalizedPath,
      content: getDefaultContent(normalizedPath),
    };

    setFiles((current) => [...current, nextFile]);
    setOpenFileIds((current) => [...current, nextFile.id]);
    setActiveFileId(nextFile.id);
    setTerminalLines((current) => [...current, `$ touch ${normalizedPath}`]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Replit Clone</p>
          <h1 className="text-lg font-semibold">Browser IDE Workspace</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="rounded-full border border-zinc-700 px-2 py-1">App Router</span>
          <span className="rounded-full border border-zinc-700 px-2 py-1">Monaco</span>
          <span className="rounded-full border border-zinc-700 px-2 py-1">Xterm.js</span>
        </div>
      </header>

      <Group orientation="horizontal" className="flex-1">
        <Panel defaultSize={20} minSize={16} className="min-w-0">
          <aside className="flex h-full flex-col border-r border-zinc-800 bg-zinc-950/80">
            <div className="border-b border-zinc-800 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Explorer</p>
            </div>
            <div className="space-y-4 px-4 py-4">
              <label className="block text-xs font-medium text-zinc-400" htmlFor="new-file-path">
                New mock file path
              </label>
              <div className="flex gap-2">
                <input
                  id="new-file-path"
                  value={newFilePath}
                  onChange={(event) => setNewFilePath(event.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-blue-400"
                  placeholder="project/components/button.tsx"
                />
                <button
                  type="button"
                  onClick={createFile}
                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
                >
                  Create
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <FileTree
                nodes={tree}
                activeFileId={activeFileId}
                onOpenFile={openFile}
                onDeleteFile={deleteFile}
              />
            </div>
          </aside>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize={45} minSize={30} className="min-w-0">
          <section className="flex h-full min-w-0 flex-col border-r border-zinc-800 bg-zinc-900/70">
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-3 py-2">
              {openFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-2 rounded-t-md border px-3 py-2 text-sm ${
                    file.id === activeFileId
                      ? "border-zinc-700 bg-zinc-950 text-zinc-50"
                      : "border-transparent bg-zinc-900 text-zinc-400"
                  }`}
                >
                  <button type="button" onClick={() => setActiveFileId(file.id)}>
                    {getFileName(file.path)}
                  </button>
                  <button
                    type="button"
                    aria-label={`Close ${getFileName(file.path)}`}
                    onClick={() => closeTab(file.id)}
                    className="text-zinc-500 transition hover:text-zinc-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="min-h-0 flex-1">
              {activeFile ? (
                <MonacoEditor
                  height="100%"
                  language={getLanguage(activeFile.path)}
                  theme="vs-dark"
                  path={activeFile.path}
                  value={activeFile.content}
                  onChange={updateFileContent}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  No file selected.
                </div>
              )}
            </div>
          </section>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize={35} minSize={24} className="min-w-0">
          <Group orientation="vertical">
            <Panel defaultSize={45} minSize={30} className="min-h-0">
              <section className="flex h-full flex-col border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Terminal</p>
                    <p className="text-xs text-zinc-400">Mock stdout stream</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setTerminalLines((current) => [
                          ...current,
                          "$ pnpm lint",
                          "✔ No ESLint warnings or errors",
                        ])
                      }
                      className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200 transition hover:border-zinc-500"
                    >
                      Run mock command
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerminalLines(["$ clear", "terminal reset"])}
                      className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200 transition hover:border-zinc-500"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 px-2 py-2">
                  <div ref={terminalContainerRef} className="h-full w-full rounded-md border border-zinc-800" />
                </div>
              </section>
            </Panel>

            <Separator className="relative h-2 bg-zinc-950/90 transition-colors after:absolute after:inset-x-0 after:top-1/2 after:h-px after:-translate-y-1/2 after:bg-zinc-800 hover:bg-zinc-900 data-[resize-handle-state=drag]:bg-blue-500/30" />

            <Panel defaultSize={55} minSize={30} className="min-h-0">
              <section className="flex h-full flex-col bg-white">
                <div className="border-b border-zinc-200 px-4 py-3 text-zinc-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Live Preview</p>
                  <p className="text-xs text-zinc-500">Sandboxed iframe sourced from your mock HTML/CSS/JS files</p>
                </div>
                <iframe
                  title="Live preview"
                  sandbox="allow-scripts"
                  srcDoc={previewDocument}
                  className="min-h-0 flex-1 bg-white"
                />
              </section>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  );
}
