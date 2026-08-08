import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function getOwnedProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      files: {
        orderBy: { path: "asc" },
      },
    },
  });
}
