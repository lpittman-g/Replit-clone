"use client";

import Editor from "@monaco-editor/react";
import {
  getLanguageFromFilename,
  selectFileById,
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

export default function CodeEditor() {
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const settings = useWorkspaceStore((s) => s.settings);
  const updateFileContent = useWorkspaceStore((s) => s.updateFileContent);

  const activeFile = activeFileId
    ? selectFileById(fileTree, activeFileId)
    : null;

  if (!activeFile || activeFile.type !== "file") {
    return (
      <div className="flex h-full items-center justify-center bg-[#0e1117] text-sm text-[#6b7380]">
        Select a file from the explorer to start editing
      </div>
    );
  }

  const language = getLanguageFromFilename(activeFile.name);

  return (
    <div className="h-full min-h-0 bg-[#0e1117]">
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        path={activeFile.id}
        value={activeFile.content ?? ""}
        onChange={(value) =>
          updateFileContent(activeFile.id, value ?? "")
        }
        options={{
          fontSize: settings.fontSize,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: settings.indentSize,
          insertSpaces: settings.indentType === "spaces",
          padding: { top: 12 },
          renderLineHighlight: "line",
          smoothScrolling: true,
          cursorBlinking: "smooth",
        }}
        loading={
          <div className="flex h-full items-center justify-center text-xs text-[#6b7380]">
            Loading editor…
          </div>
        }
      />
    </div>
  );
}
