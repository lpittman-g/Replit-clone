import type { File as DbFile } from "@prisma/client";
import type { FileNode } from "@/store/useWorkspaceStore";

export type FlatFileInput = {
  path: string;
  name: string;
  type: "file" | "folder";
  content?: string | null;
};

export function flattenFileTree(
  nodes: FileNode[],
  parentPath = "",
): FlatFileInput[] {
  const result: FlatFileInput[] = [];

  for (const node of nodes) {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    result.push({
      path,
      name: node.name,
      type: node.type,
      content: node.type === "file" ? (node.content ?? "") : null,
    });
    if (node.type === "folder" && node.children?.length) {
      result.push(...flattenFileTree(node.children, path));
    }
  }

  return result;
}

export function buildFileTree(files: FlatFileInput[]): FileNode[] {
  type MutableNode = FileNode & { children?: MutableNode[] };
  const root: MutableNode[] = [];
  const folders = new Map<string, MutableNode>();

  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sorted) {
    const parts = file.path.split("/").filter(Boolean);
    let currentPath = "";
    let siblings = root;

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = index === parts.length - 1;

      if (isLeaf) {
        const node: MutableNode = {
          id: currentPath,
          name: file.name,
          type: file.type,
          content: file.type === "file" ? (file.content ?? "") : undefined,
          children: file.type === "folder" ? [] : undefined,
        };
        siblings.push(node);
        if (file.type === "folder") {
          folders.set(currentPath, node);
        }
        return;
      }

      let folder = folders.get(currentPath);
      if (!folder) {
        folder = {
          id: currentPath,
          name: part,
          type: "folder",
          children: [],
        };
        siblings.push(folder);
        folders.set(currentPath, folder);
      }
      siblings = folder.children ?? [];
      folder.children = siblings;
    });
  }

  return root;
}

export function dbFilesToTree(files: DbFile[]): FileNode[] {
  return buildFileTree(
    files.map((file) => ({
      path: file.path,
      name: file.name,
      type: file.type === "folder" ? "folder" : "file",
      content: file.content,
    })),
  );
}

export const DEFAULT_PROJECT_FILES: FlatFileInput[] = [
  {
    path: "src",
    name: "src",
    type: "folder",
    content: null,
  },
  {
    path: "src/index.html",
    name: "index.html",
    type: "file",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Repl</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="app">
      <h1>Hello from your Repl</h1>
      <button id="run">Run demo</button>
    </main>
    <script src="main.js"></script>
  </body>
</html>
`,
  },
  {
    path: "src/styles.css",
    name: "styles.css",
    type: "file",
    content: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0e1117;
  color: #e8eaed;
}

.app {
  padding: 2rem;
  border: 1px solid #2b3240;
  border-radius: 16px;
}

button {
  margin-top: 1rem;
  border: 0;
  border-radius: 999px;
  padding: 0.7rem 1.2rem;
  background: #1c4b39;
  color: white;
  cursor: pointer;
}
`,
  },
  {
    path: "src/main.js",
    name: "main.js",
    type: "file",
    content: `const button = document.getElementById("run");
button?.addEventListener("click", () => {
  console.log("Demo button clicked");
});
console.log("Repl ready");
`,
  },
  {
    path: "README.md",
    name: "README.md",
    type: "file",
    content: `# My Repl

Edit files and press Run to execute JavaScript or Python.
`,
  },
];
