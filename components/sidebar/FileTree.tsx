"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Trash2,
} from "lucide-react";
import {
  FileNode,
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

function TreeNode({
  node,
  depth,
}: {
  node: FileNode;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const openFile = useWorkspaceStore((s) => s.openFile);
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);

  const isActive = activeFileId === node.id;
  const paddingLeft = 8 + depth * 12;

  if (node.type === "folder") {
    return (
      <div>
        <div
          className="group flex items-center gap-1 rounded px-1 py-0.5 text-[12px] text-[#c5cbd5] hover:bg-[#171c26]"
          style={{ paddingLeft }}
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-1 text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-[#6b7380]" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-[#6b7380]" />
            )}
            {expanded ? (
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#7dd3a7]" />
            ) : (
              <Folder className="h-3.5 w-3.5 shrink-0 text-[#7dd3a7]" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          <button
            type="button"
            onClick={() => deleteNode(node.id)}
            className="rounded p-0.5 text-[#6b7380] opacity-0 transition hover:text-red-400 group-hover:opacity-100"
            aria-label={`Delete ${node.name}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        {expanded &&
          node.children?.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-1 rounded px-1 py-0.5 text-[12px] ${
        isActive
          ? "bg-[#1C4B39]/40 text-white"
          : "text-[#c5cbd5] hover:bg-[#171c26]"
      }`}
      style={{ paddingLeft }}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-1 text-left"
        onClick={() => openFile(node.id)}
      >
        <File className="h-3.5 w-3.5 shrink-0 text-[#8b93a0]" />
        <span className="truncate">{node.name}</span>
      </button>
      <button
        type="button"
        onClick={() => deleteNode(node.id)}
        className="rounded p-0.5 text-[#6b7380] opacity-0 transition hover:text-red-400 group-hover:opacity-100"
        aria-label={`Delete ${node.name}`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function FileTree() {
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const createFile = useWorkspaceStore((s) => s.createFile);
  const createFolder = useWorkspaceStore((s) => s.createFolder);

  const handleCreateFile = () => {
    const name = window.prompt("New file name", "untitled.js");
    if (!name?.trim()) return;
    createFile(null, name.trim());
  };

  const handleCreateFolder = () => {
    const name = window.prompt("New folder name", "new-folder");
    if (!name?.trim()) return;
    createFolder(null, name.trim());
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1e2430] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a0]">
          Files
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCreateFile}
            className="rounded p-1 text-[#8b93a0] hover:bg-[#1a2030] hover:text-white"
            aria-label="New file"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCreateFolder}
            className="rounded p-1 text-[#8b93a0] hover:bg-[#1a2030] hover:text-white"
            aria-label="New folder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {fileTree.map((node) => (
          <TreeNode key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}
