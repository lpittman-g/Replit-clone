import Workspace from "@/components/Workspace";
import LoadProject from "@/components/workspace/LoadProject";
import ProjectAutosave from "@/components/workspace/ProjectAutosave";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectWorkspacePage({ params }: Props) {
  const { projectId } = await params;

  return (
    <LoadProject projectId={projectId}>
      <div className="relative h-screen">
        <ProjectAutosave projectId={projectId} />
        <Workspace />
      </div>
    </LoadProject>
  );
}
