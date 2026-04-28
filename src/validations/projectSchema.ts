import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must not exceed 100 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
  pmId: z.number().optional(),
  tlId: z.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  teamMembers: z.array(z.number()).optional(),
  techstack: z.array(z.string()).optional(),
});

export const updateProjectSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
  pmId: z.number().optional(),
  tlId: z.number().optional().nullable(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  teamMembers: z.array(z.number()).optional(),
  techstack: z.array(z.string()).optional(),
});

export const getProjectsSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
  pmId: z.number().optional(),
  tlId: z.number().optional(),
});

export const deleteProjectSchema = z.object({
  id: z.number(),
});

export type CreateProjectPayload = z.infer<typeof createProjectSchema>;
export type UpdateProjectPayload = z.infer<typeof updateProjectSchema>;
export type GetProjectsPayload = z.infer<typeof getProjectsSchema>;
