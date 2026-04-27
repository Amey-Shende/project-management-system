import { NextResponse } from "next/server";
import { handleControllerError } from "@/lib/errors";
import { changePasswordService, createUserService, deleteUserService, getUsersService, updateUserService } from "@/services/user.service";
import { getUserIdFromHeader, parseRole, parseUserId } from "@/lib/utils";

type UserRouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function getUserController(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = getUserIdFromHeader(request);
        const role = searchParams.get("role") ? parseRole(searchParams.get("role")) : undefined;
        const users = await getUsersService({ id, role });

        return NextResponse.json({
            message: "Users fetched successfully",
            data: users,
        },
            { status: 200 },
        );
    } catch (error) {
        return handleControllerError(error, "Fetch users");
    }
}

export async function createUserController(request: Request) {
    try {
        const body = await request.json();
        const user = await createUserService(body);

        return NextResponse.json({
            message: "User created successfully",
            data: user,
        },
            { status: 201 },
        );
    } catch (error) {
        return handleControllerError(error, "Create user");
    }
}

export async function updateUserByIdController(request: Request, context: UserRouteContext) {
    try {
        const body = await request.json();
        const { id: rawId } = await context.params;
        const id = parseUserId(rawId);

        if (id === undefined || Number.isNaN(id)) {
            return NextResponse.json(
                { message: "Valid user id is required" },
                { status: 400 },
            );
        }
        const user = await updateUserService(body, id);
        return NextResponse.json({
            message: "User updated successfully",
            data: user,
        },
            { status: 200 },
        );
    } catch (error) {
        return handleControllerError(error, "Update user");
    }
}

export async function deleteUserByIdController(_request: Request, context: UserRouteContext) {
    try {
        const { id: rawId } = await context.params;
        const id = parseUserId(rawId);
        if (id === undefined || Number.isNaN(id)) {
            return NextResponse.json(
                { message: "Valid user id is required" },
                { status: 400 },
            );
        }

        const result = await deleteUserService({ id });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Delete user");
    }
}

export async function changePasswordController(request: Request) {
    try {
        const body = await request.json();
        const userId = getUserIdFromHeader(request);

        if (userId === undefined || Number.isNaN(userId)) {
            return NextResponse.json(
                { message: "User not authenticated" },
                { status: 401 },
            );
        }

        const result = await changePasswordService(body, userId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Change password");
    }
}
