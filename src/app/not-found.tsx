import type { Metadata } from "next";
import "./globals.css";
import NotFoundPage from "@/components/NotFoundPage";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
}

export default async function NotFound() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Check if user is authenticated
    const decoded = token ? verifyToken(token) : null;
    const navigateLink = decoded ? "/dashboard" : "/login";

    return (
        <NotFoundPage navigateLink={navigateLink} />
    );
}