"use client";

import { signIn } from "next-auth/react";
import { GitBranch } from "lucide-react";

type Props = {
  githubEnabled: boolean;
  googleEnabled: boolean;
  callbackUrl: string;
};

export function AuthButtons({
  githubEnabled,
  googleEnabled,
  callbackUrl,
}: Props) {
  if (!githubEnabled && !googleEnabled) {
    return (
      <p className="rounded-md border border-dashed border-[#2a3344] bg-[#0b0e13] px-3 py-2 text-xs text-[#8b93a0]">
        GitHub/Google OAuth is optional. Set `AUTH_GITHUB_*` / `AUTH_GOOGLE_*`
        in `.env` to enable social login.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {githubEnabled ? (
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl })}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[#2a3344] bg-[#0b0e13] px-3 py-2 text-sm text-[#e8eaed] hover:bg-[#171c26]"
        >
          <GitBranch className="h-4 w-4" />
          Continue with GitHub
        </button>
      ) : null}
      {googleEnabled ? (
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[#2a3344] bg-[#0b0e13] px-3 py-2 text-sm text-[#e8eaed] hover:bg-[#171c26]"
        >
          Continue with Google
        </button>
      ) : null}
    </div>
  );
}
