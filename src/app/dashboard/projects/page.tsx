import { getProjectsService } from "@/services/project.service";
import ProjectList from "./ProjectList";

export default async function ProjectsPage() {
  const initialData = await getProjectsService();
  return <ProjectList initialData={initialData} />;
}