"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        if (!window.confirm("Delete this Repl?")) return;
        await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
        router.refresh();
      }}
      className="rounded p-1.5 text-[#6b7380] hover:bg-[#1a2030] hover:text-red-400"
      aria-label="Delete project"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
