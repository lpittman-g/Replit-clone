import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/projects/access";
import { DEFAULT_PROJECT_FILES } from "@/lib/projects/fileTree";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { files: true } },
    },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; description?: string } = {};
  try {
    body = (await request.json()) as { name?: string; description?: string };
  } catch {
    body = {};
  }

  const name = body.name?.trim() || "Untitled Repl";
  const description = body.description?.trim() || null;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      userId: user.id,
      files: {
        create: DEFAULT_PROJECT_FILES.map((file) => ({
          path: file.path,
          name: file.name,
          type: file.type,
          content: file.content,
        })),
      },
    },
    include: {
      files: true,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
