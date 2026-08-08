import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { DeleteProjectButton } from "@/components/dashboard/DeleteProjectButton";
import { FolderKanban, LogOut } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { files: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#15261f_0%,#0e1117_50%)] text-[#e8eaed]">
      <header className="flex items-center justify-between border-b border-[#1e2430] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1C4B39] text-xs font-bold">
            R
          </div>
          <div>
            <p className="text-sm font-semibold">Replit Clone</p>
            <p className="text-xs text-[#8b93a0]">
              {session.user.email || session.user.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-xs text-[#8b93a0] hover:bg-[#171c26] hover:text-white"
          >
            Local demo
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#2a3344] px-3 py-1.5 text-xs text-[#c5cbd5] hover:bg-[#171c26]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your Repls
            </h1>
            <p className="mt-1 text-sm text-[#8b93a0]">
              Open a project to jump back into the IDE. File edits autosave.
            </p>
          </div>
          <CreateProjectForm />
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2a3344] bg-[#121722]/60 px-6 py-16 text-center">
            <FolderKanban className="mx-auto mb-3 h-8 w-8 text-[#1C4B39]" />
            <p className="text-sm text-[#c5cbd5]">No Repls yet</p>
            <p className="mt-1 text-xs text-[#6b7380]">
              Create your first project to start building.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-2xl border border-[#243041] bg-[#121722]/80 p-5 transition hover:border-[#1C4B39]"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-medium text-white">
                      {project.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#8b93a0]">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <DeleteProjectButton projectId={project.id} />
                </div>
                <div className="mb-4 flex items-center gap-3 text-[11px] text-[#6b7380]">
                  <span>{project._count.files} files</span>
                  <span>
                    Updated {new Date(project.updatedAt).toLocaleString()}
                  </span>
                </div>
                <Link
                  href={`/workspace/${project.id}`}
                  className="inline-flex rounded-md bg-[#1C4B39] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#246348]"
                >
                  Open workspace
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
