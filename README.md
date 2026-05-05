## Project Managment systement POC
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Let me examine your project structure to understand the overall flow.



# Project Management System - General Flow

## 1. **Authentication Flow**
```
User Access → Login/Register Page (/login, /register)
           → Auth Controller (loginService, registerService)
           → Validate Credentials
           → Set Token Cookie
           → Redirect to Dashboard
```

## 2. **Role-Based Dashboard Access**
```
After Login → Check User Role (CEO/PM/TL/TM)
           → Dashboard Layout (Sidebar + Navbar)
           → Role-Specific Menu Options:
              - CEO: Full access to all sections
              - PM: Project Manager section
              - TL: Team Lead section
              - TM: Team Member section
```

## 3. **Dashboard Overview**
```
Dashboard Home (/dashboard)
→ KPI Cards (Total Projects, Active, Completed, Total Team)
→ Project Status Distribution Chart
→ Project Growth Over Time
→ Organization Hierarchy (commented out)
```

## 4. **Project Management Flow**
```
Create Project → PM creates project
              → Assign PM, TL, TMs
              → Set project details (name, description, techstack, priority, dates)
              → Save to database

View Projects → Filter by status, PM, TL, search
              → List view with project cards
              → View project details

Update Project → Edit project details
               → Reassign team members
               → Update progress/status

Delete Project → Remove project (with confirmation)
```

## 5. **User Management Flow**
```
User Registration → Admin/CEO creates user accounts
                  → Assign role (PM/TL/TM)
                  → Set user details (name, email, department, designation)

User Profile → View/edit profile
             → Update personal information
             → Change password
```

## 6. **Team Assignment Flow**
```
PM Assigns Team → Select project
                → Add TLs to project
                → Add TMs to project
                → Set roles/notes for each member

TL Views Team → See assigned TMs
              → Monitor project progress
              → Manage team tasks

TM Views Projects → See assigned projects
                   → View project details
                   → Track progress
```

## 7. **API Architecture**
```
Client → API Route → Controller → Service → Database
       (Next.js)   (auth, project, user)  (business logic)  (Prisma/MySQL)
```

## Key Files Structure
- `src/app/(auth)/` - Authentication pages
- [src/app/dashboard/](cci:9://file:///d:/Git/web-app-pmp/project-management-system/src/app/dashboard:0:0-0:0) - Protected dashboard routes
- [src/app/api/](cci:9://file:///d:/Git/web-app-pmp/project-management-system/src/app/api:0:0-0:0) - API endpoints
- `src/controller/` - Request handlers
- `src/services/` - Business logic
- [prisma/schema.prisma](cci:7://file:///d:/Git/web-app-pmp/project-management-system/prisma/schema.prisma:0:0-0:0) - Database schema

## Hierarchy Structure
```
CEO
 └── PM (Project Manager)
     └── TL (Team Lead)
         └── TM (Team Member)
```

**Where to start development:**
1. Set up database with Prisma schema
2. Implement authentication (login/register)
3. Build dashboard layout with role-based routing
4. Create project CRUD operations
5. Implement user-project assignment logic
6. Build role-specific dashboards (PM/TL/TM views)