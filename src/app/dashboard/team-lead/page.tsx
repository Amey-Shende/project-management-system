import { getUsersService } from "@/services/user.service";
import TeamLeadList from "./TeamLeadList";

export default async function page() {
  const initialData = await getUsersService({ role: "TL" });
  return <TeamLeadList initialData={initialData} />;
}
