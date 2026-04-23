import {
    createUserController,
    getUserController,
} from "@/controller/user.controller";

export const GET = getUserController;
export const POST = createUserController;
