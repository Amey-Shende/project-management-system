import { getUsersService } from "@/services/user.service";
import TeamLeadList from "./TeamLeadList";

// Mock initial data - replace with actual API call
// const initialData = [
//   { id: 1, name: "John Doe", email: "john@example.com", role: "TL" as const },
//   { id: 2, name: "Jane Smith", email: "jane@example.com", role: "TL" as const },
// ];

export default async function page() {
  const initialData = await getUsersService({ role: "TL" });
  return <TeamLeadList initialData={initialData} />;
}
