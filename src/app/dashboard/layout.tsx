"use client";
import { AppSidebar } from "@/components/app-sidebat";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(user ? JSON.parse(user) : null);
  }, [router]);

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex h-screen w-screen flex-col bg-muted/30">
        <Suspense fallback={<div className="h-15 w-full" />}>
          <Navbar user={user} />
          <Separator />
        </Suspense>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-4 pt-2">
          <Suspense fallback={<Loader />}>{children}</Suspense>
        </div>
      </main>
    </SidebarProvider>
  );
}
