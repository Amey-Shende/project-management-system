import {
    deleteUserByIdController,
    updateUserByIdController,
} from "@/controller/user.controller";

export const PATCH = updateUserByIdController;
export const DELETE = deleteUserByIdController;
