import { getUsersService } from "@/services/user.service";
import TeamMemberList from "./TeamMemberList";

export default async function page() {
  const initialData = await getUsersService({ role: "TM" });
  return <TeamMemberList initialData={initialData} />;
}
