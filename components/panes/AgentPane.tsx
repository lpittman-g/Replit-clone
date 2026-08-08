"use client";

import { FormEvent, useState } from "react";
import { Bot, Send } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function AgentPane() {
  const agentMessages = useWorkspaceStore((s) => s.agentMessages);
  const sendAgentMessage = useWorkspaceStore((s) => s.sendAgentMessage);
  const [draft, setDraft] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    sendAgentMessage(content);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0e13]">
      <div className="flex items-center gap-2 border-b border-[#1e2430] px-3 py-2 text-xs text-[#c5cbd5]">
        <Bot className="h-4 w-4 text-[#7dd3a7]" />
        Replit Agent
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-3">
        {agentMessages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
              message.role === "assistant"
                ? "bg-[#121722] text-[#d7dce5]"
                : "ml-auto bg-[#1C4B39] text-white"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-[#1e2430] p-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask the agent…"
          className="min-w-0 flex-1 rounded-md border border-[#2a3344] bg-[#121722] px-2.5 py-1.5 text-xs text-[#e8eaed] outline-none placeholder:text-[#5c6573] focus:border-[#1C4B39]"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-[#1C4B39] p-2 text-white hover:bg-[#246348]"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
