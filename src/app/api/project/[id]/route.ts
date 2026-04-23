import {
  deleteProjectByIdController,
  updateProjectByIdController,
  getProjectByIdController,
} from "@/controller/project.controller";

export const GET = getProjectByIdController;
export const PATCH = updateProjectByIdController;
export const DELETE = deleteProjectByIdController;
