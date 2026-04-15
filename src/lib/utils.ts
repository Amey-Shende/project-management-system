import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import api from "./axios";
import { toast } from "sonner";
import { ServiceError } from "./ServiceError";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleLogout = async (router?: any) => {
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  try {
    await api.get("/auth/logout")
    toast.success("Logged out successfully")
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to logout")
  } finally {
    if (router) {
      router.replace("/login");
    } else {
      window.location.replace("/login"); // Fallback if no router is provided
    }
  }
};


export function getUserIdFromHeader(request: Request): number {
  const raw = request.headers.get("x-user-id");
  const userId = Number(raw);

  if (!raw || !Number.isInteger(userId) || userId <= 0) {
    throw new ServiceError("Unauthorized", 401);
  }

  return userId;
}

export function getUserRoleFromHeader(request: Request): string {
  const role = request.headers.get("x-user-role");
  if (!role) {
    throw new ServiceError("Unauthorized", 401);
  }
  return role;
}