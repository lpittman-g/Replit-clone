"use client";

import TabBar from "./TabBar";
import CodeEditor from "./CodeEditor";

export default function EditorWorkspace() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0e1117]">
      <TabBar />
      <div className="min-h-0 flex-1">
        <CodeEditor />
      </div>
    </div>
  );
}
