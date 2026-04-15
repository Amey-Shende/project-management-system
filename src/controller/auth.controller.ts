
import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordService, loginService, registerService, resetPasswordService } from "@/services/auth.service";
import { handleControllerError } from "@/lib/errors";
import { TOKEN_MAX_AGE_MINUTES } from "@/lib/constant";
import { getUserRoleFromHeader } from "@/lib/utils";

export const loginController = async (req: Request) => {
    try {
        const body = await req.json();
        const { token, user } = await loginService(body);

        const response = NextResponse.json({
            message: "Login successful",
            user,
        }, { status: 200 },
        );

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: TOKEN_MAX_AGE_MINUTES * 60,
        });

        return response;
    } catch (error) {
        return handleControllerError(error, "Login");
    }
};

export const registerController = async (req: Request) => {
    try {
        const body = await req.json();
        const { user } = await registerService(body);

        return NextResponse.json({
            message: "Registration successful",
            user,
        }, { status: 201 },
        );
    } catch (error) {
        return handleControllerError(error, "Registration");
    }
};


export async function logoutController() {
    try {
        const res = NextResponse.json(
            { message: "Logout successful" },
            { status: 200 }
        );

        res.cookies.delete("token");
        return res;
    }
    catch (error) {
        return handleControllerError(error, "Failed to logout");
    }
};

export async function forgotPasswordController(request: Request) {
    try {
        const body = await request.json();
        const role = getUserRoleFromHeader(request);
        const result = await forgotPasswordService(body, role);
        return NextResponse.json(result, { status: 200 });
    }
    catch (error) {
        return handleControllerError(error, "Failed to process forgot password request");
    }
};

export async function resetPasswordController(request: Request) {
    try {
        const body = await request.json();
        const result = await resetPasswordService(body);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Failed to reset password");
    }
}


