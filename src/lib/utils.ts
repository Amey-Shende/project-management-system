import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import api from "./axios";
import { toast } from "sonner";
import { ServiceError } from "./ServiceError";
import z from "zod";
import { Role } from "generated/prisma/enums";

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

export function formatValidationMessage(error: z.ZodError, fallback: string) {
  const flattenedErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>;

  return (
    flattenedErrors.id?.[0] ??
    flattenedErrors.name?.[0] ??
    flattenedErrors.email?.[0] ??
    flattenedErrors.password?.[0] ??
    flattenedErrors.role?.[0] ??
    flattenedErrors.managerId?.[0] ??
    fallback
  );
}

export function normalizeUser<T extends { id: number }>(user: T) {
  return {
    ...user,
    id: String(user.id),
  };
}

export function parseUserId(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const id = Number(value);
  return Number.isInteger(id) ? id : Number.NaN;
}

export function parseRole(value: string | null) {
  if (!value) {
    return undefined;
  }
  return Object.values(Role).includes(value as Role) ? (value as Role) : undefined;
}

export function parseProjectId(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const id = Number(value);
  return Number.isInteger(id) ? id : Number.NaN;
}


// Helper to generate a hex color from a string
// export const generateColor = (name: string) => {
//   let hash = 0;
//   for (let i = 0; i < name.length; i++) {
//     hash = name.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   let color = '#';
//   for (let i = 0; i < 3; i++) {
//     const value = (hash >> (i * 8)) & 0xFF;
//     color += ('00' + value.toString(16)).substr(-2);
//   }
//   return color;
// };


// export const generateColor = (name: string) => {
//   let hash = 0;
//   for (let i = 0; i < name.length; i++) {
//     hash = name.charCodeAt(i) + ((hash << 5) - hash);
//   }

//   const hue = Math.abs(hash) % 360;
//   return `hsl(${hue}, 55%, 70%)`;
// };

export const generateColor = (name: string, id?: number): string => {
  // Combine name and id to make hash more stable per user
  const input = id ? `${name}_${id}` : name;

  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 65%)`;
};