"use client";

import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import {
  selectFileById,
  selectFileByName,
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

export default function PreviewPane() {
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const previewKey = useWorkspaceStore((s) => s.previewKey);
  const refreshPreview = useWorkspaceStore((s) => s.refreshPreview);

  const html =
    selectFileById(fileTree, "file-index-html")?.content ??
    selectFileByName(fileTree, "index.html")?.content ??
    "";
  const css =
    selectFileById(fileTree, "file-styles-css")?.content ??
    selectFileByName(fileTree, "styles.css")?.content ??
    "";
  const js =
    selectFileById(fileTree, "file-main-js")?.content ??
    selectFileByName(fileTree, "main.js")?.content ??
    "";

  const srcDoc = useMemo(() => {
    const withCss = html.includes("</head>")
      ? html.replace("</head>", `<style>${css}</style></head>`)
      : `${html}<style>${css}</style>`;
    const withJs = withCss.includes("</body>")
      ? withCss.replace("</body>", `<script>${js}</script></body>`)
      : `${withCss}<script>${js}</script>`;
    return withJs;
  }, [html, css, js]);

  return (
    <div className="flex h-full flex-col bg-[#0b0e13]">
      <div className="flex items-center gap-2 border-b border-[#1e2430] px-2 py-1.5">
        <button
          type="button"
          onClick={refreshPreview}
          className="rounded p-1 text-[#8b93a0] hover:bg-[#171c26] hover:text-white"
          aria-label="Refresh preview"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 truncate rounded-md border border-[#2a3344] bg-[#121722] px-2.5 py-1 text-[11px] text-[#8b93a0]">
          https://replit-clone.local/preview
        </div>
      </div>
      <iframe
        key={previewKey}
        title="Web preview"
        className="h-full w-full border-0 bg-white"
        sandbox="allow-scripts"
        srcDoc={srcDoc}
      />
    </div>
  );
}
