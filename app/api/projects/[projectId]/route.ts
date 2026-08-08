import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedProject, requireUser } from "@/lib/projects/access";
import { dbFilesToTree } from "@/lib/projects/fileTree";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await getOwnedProject(projectId, user.id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      updatedAt: project.updatedAt,
      fileTree: dbFilesToTree(project.files),
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
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
    name?: string;
    description?: string | null;
  };

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: body.name?.trim() || existing.name,
      description:
        body.description === undefined
          ? existing.description
          : body.description,
    },
  });

  return NextResponse.json({ project });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const existing = await getOwnedProject(projectId, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ ok: true });
}
