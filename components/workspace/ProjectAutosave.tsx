"use client";

import { useEffect, useRef, useState } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

type Props = {
  projectId: string;
};

export default function ProjectAutosave({ projectId }: Props) {
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const projectName = useWorkspaceStore((s) => s.projectName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const hydrated = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip the first emit after load so we don't rewrite identical data immediately.
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }

    if (timer.current) clearTimeout(timer.current);
    setStatus("saving");

    timer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/files`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileTree }),
        });
        if (!response.ok) throw new Error("Save failed");
        const data = (await response.json()) as { savedAt?: string };
        setStatus("saved");
        setLastSavedAt(data.savedAt ?? new Date().toISOString());
      } catch {
        setStatus("error");
      }
    }, 800);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [fileTree, projectId]);

  useEffect(() => {
    if (!hydrated.current) return;
    const handle = setTimeout(async () => {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName }),
      }).catch(() => undefined);
    }, 1000);
    return () => clearTimeout(handle);
  }, [projectName, projectId]);

  return (
    <div className="pointer-events-none absolute right-3 top-14 z-20 rounded-md border border-[#1e2430] bg-[#121722]/95 px-2.5 py-1 text-[11px] text-[#8b93a0]">
      {status === "saving" && "Saving…"}
      {status === "saved" &&
        `Saved${lastSavedAt ? ` ${new Date(lastSavedAt).toLocaleTimeString()}` : ""}`}
      {status === "error" && "Save failed"}
      {status === "idle" && "Autosave on"}
    </div>
  );
}
