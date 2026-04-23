import { getUsersService } from '@/services/user.service'
import ProjectManagerList from './ProjectManagerList'

async function page() {
    const initialData = await getUsersService({ role: "PM" });
    return (
        <div>
            <ProjectManagerList initialData={initialData} />
        </div>
    )
}

export default page
