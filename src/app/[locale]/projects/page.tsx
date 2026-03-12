import { getProjectsAction } from '@/lib/actions';
import { ProjectsListClient } from '@/components/site/projects-list-client';

export default async function ProjectsPage() {
  const projects = await getProjectsAction();

  return <ProjectsListClient projects={projects} />;
}
