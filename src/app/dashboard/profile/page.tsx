import { ProfileInfo } from "@/app/dashboard/profile/ProfileInfo";
import { getUserByIdService } from "@/services/user.service";
import { headers } from "next/headers";

export default async function ProfilePage() {
  const header = await headers();
  const userId = header.get("x-user-id");
  const user = await getUserByIdService(parseInt(userId!));

  return (
    <div>
      <ProfileInfo user={user} />
    </div>
  );
}
