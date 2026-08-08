import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedProject, requireUser } from "@/lib/projects/access";
import {
  flattenFileTree,
  type FlatFileInput,
} from "@/lib/projects/fileTree";
import type { FileNode } from "@/store/useWorkspaceStore";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const existing = await getOwnedProject(projectId, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    fileTree?: FileNode[];
    files?: FlatFileInput[];
  };

  const files =
    body.files ??
    (body.fileTree ? flattenFileTree(body.fileTree) : null);

  if (!files) {
    return NextResponse.json(
      { error: "fileTree or files is required" },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.file.deleteMany({ where: { projectId } }),
    prisma.file.createMany({
      data: files.map((file) => ({
        projectId,
        path: file.path,
        name: file.name,
        type: file.type,
        content: file.type === "file" ? (file.content ?? "") : null,
      })),
    }),
    prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    fileCount: files.length,
    savedAt: new Date().toISOString(),
  });
}
