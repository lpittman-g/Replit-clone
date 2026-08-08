"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Untitled Repl",
        }),
      });
      if (!response.ok) throw new Error("Create failed");
      const data = (await response.json()) as { project: { id: string } };
      router.push(`/workspace/${data.project.id}`);
      router.refresh();
    } catch {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New Repl name"
        className="w-48 rounded-md border border-[#2a3344] bg-[#0b0e13] px-3 py-2 text-sm text-[#e8eaed] outline-none focus:border-[#1C4B39]"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#1C4B39] px-3 py-2 text-sm font-semibold text-white hover:bg-[#246348] disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {pending ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
