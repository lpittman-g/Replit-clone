"use client";

import { useEffect, useState } from "react";
import type { FileNode } from "@/store/useWorkspaceStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

type Props = {
  projectId: string;
  children: React.ReactNode;
};

function findFirstFileId(nodes: FileNode[]): string | null {
  for (const node of nodes) {
    if (node.type === "file") return node.id;
    if (node.children) {
      const nested = findFirstFileId(node.children);
      if (nested) return nested;
    }
  }
  return null;
}

export default function LoadProject({ projectId, children }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setReady(false);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Unable to load project");
        }
        const data = (await response.json()) as {
          project: {
            name: string;
            fileTree: FileNode[];
          };
        };
        if (cancelled) return;

        const firstFileId = findFirstFileId(data.project.fileTree);
        useWorkspaceStore.setState({
          projectName: data.project.name,
          fileTree: data.project.fileTree,
          openTabs: firstFileId ? [{ id: firstFileId, dirty: false }] : [],
          activeFileId: firstFileId,
        });
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Load failed");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0e1117] text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0e1117] text-sm text-[#8b93a0]">
        Loading workspace…
      </div>
    );
  }

  return children;
}
