import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth/AuthButtons";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;
  if (session?.user) {
    redirect(params.callbackUrl || "/dashboard");
  }

  const githubEnabled = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1c4b39_0%,#0e1117_55%)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#243041] bg-[#121722]/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C4B39] text-sm font-bold text-white">
            R
          </div>
          <h1 className="text-2xl font-semibold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-[#8b93a0]">
            Save Repls, sync files, and open your workspace anywhere.
          </p>
        </div>

        <AuthButtons
          githubEnabled={githubEnabled}
          googleEnabled={googleEnabled}
          callbackUrl={params.callbackUrl || "/dashboard"}
        />

        <form
          className="mt-6 space-y-3"
          action={async (formData) => {
            "use server";
            await signIn("credentials", {
              email: String(formData.get("email") || ""),
              password: String(formData.get("password") || ""),
              redirectTo: params.callbackUrl || "/dashboard",
            });
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7380]">
            Demo credentials
          </p>
          <input
            name="email"
            type="email"
            defaultValue="demo@replit-clone.local"
            required
            className="w-full rounded-md border border-[#2a3344] bg-[#0b0e13] px-3 py-2 text-sm text-[#e8eaed] outline-none focus:border-[#1C4B39]"
          />
          <input
            name="password"
            type="password"
            defaultValue="demo1234"
            required
            className="w-full rounded-md border border-[#2a3344] bg-[#0b0e13] px-3 py-2 text-sm text-[#e8eaed] outline-none focus:border-[#1C4B39]"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-[#1C4B39] px-3 py-2 text-sm font-semibold text-white hover:bg-[#246348]"
          >
            Continue with demo account
          </button>
        </form>
      </div>
    </div>
  );
}
