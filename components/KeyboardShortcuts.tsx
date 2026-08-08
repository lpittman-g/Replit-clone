"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function KeyboardShortcuts() {
  const runProject = useWorkspaceStore((s) => s.runProject);
  const stopProject = useWorkspaceStore((s) => s.stopProject);
  const isRunning = useWorkspaceStore((s) => s.isRunning);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const toggleBottomPanel = useWorkspaceStore((s) => s.toggleBottomPanel);
  const saveActiveFile = useWorkspaceStore((s) => s.saveActiveFile);
  const setActiveRightPane = useWorkspaceStore((s) => s.setActiveRightPane);
  const setActiveBottomPane = useWorkspaceStore((s) => s.setActiveBottomPane);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;

      const key = event.key.toLowerCase();

      if (key === "enter") {
        event.preventDefault();
        if (isRunning) stopProject();
        else runProject();
        return;
      }

      if (key === "b") {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (key === "j") {
        event.preventDefault();
        toggleBottomPanel();
        return;
      }

      if (key === "s") {
        event.preventDefault();
        saveActiveFile();
        return;
      }

      if (key === "1") {
        event.preventDefault();
        setActiveBottomPane("terminal");
        return;
      }

      if (key === "2") {
        event.preventDefault();
        setActiveBottomPane("console");
        return;
      }

      if (key === "3") {
        event.preventDefault();
        setActiveRightPane("preview");
        return;
      }

      if (key === "4") {
        event.preventDefault();
        setActiveRightPane("agent");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isRunning,
    runProject,
    stopProject,
    toggleSidebar,
    toggleBottomPanel,
    saveActiveFile,
    setActiveRightPane,
    setActiveBottomPane,
  ]);

  return null;
}
