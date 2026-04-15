import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/jwt";
import { loginSchema, registerSchema } from "@/validations/authscehma";
import { z } from "zod";
import { ServiceError } from "@/lib/ServiceError";

type LoginPayload = z.infer<typeof loginSchema>;
type RegisterPayload = z.infer<typeof registerSchema>;

type RegisterPayloadWithRole = Omit<RegisterPayload, "role"> & { role: Role };

export async function loginService(payload: LoginPayload) {
    const parsedPayload = loginSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const message =
            parsedPayload.error.flatten().fieldErrors.email?.[0] ??
            parsedPayload.error.flatten().fieldErrors.password?.[0] ??
            "Invalid login data";

        throw new ServiceError(message, 400);
    }

    const { email, password } = parsedPayload.data;

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
        },
    });

    if (user && user.role === Role.TM) {
        throw new ServiceError("Team members cannot log in", 403);
    }

    if (!user?.password) {
        throw new ServiceError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ServiceError("Invalid email or password", 401);
    }

    const safeUser = {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const token = generateToken({
        userId: safeUser.id,
        role: safeUser.role,
        name: safeUser.name,
    });

    return {
        token,
        user: safeUser,
    };
}

export async function registerService(payload: RegisterPayloadWithRole) {
    const parsedPayload = registerSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const errors = parsedPayload.error.flatten().fieldErrors;
        const message =
            errors.name?.[0] ??
            errors.email?.[0] ??
            errors.password?.[0] ??
            errors.confirmPassword?.[0] ??
            "Invalid registration data";

        throw new ServiceError(message, 400);
    }

    const { name, email, password } = parsedPayload.data;
    const role = payload.role

    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingUser) {
        throw new ServiceError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    return {
        user: {
            ...user,
            id: String(user.id),
        },
    };
}


export async function forgotPasswordService(body: unknown, role: string) {
    const payload = body as { email: string }
    const email = typeof payload?.email === "string" ? payload.email.trim() : "";

    if (role === Role.TM) {
        throw new ServiceError("Team members cannot use forgot password feature", 403);
    }

    if (!email) {
        throw new ServiceError("Email is required", 400)
    }

    const user = await prisma.user.findUnique({
        where: { email, isActive: true }
    });

    if (!user) {
        throw new ServiceError("User with this email does not exist", 404)
    }

    // const resetToken = forgotPasswordLink();
    // const hashresetToken = await bcrypt.hash(resetToken, 10);
    // const updatedUser = await prisma.user.update({
    //     where: { email },
    //     data: {
    //         resetToken: hashresetToken,
    //         resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
    //     },
    // });

    // if (!updatedUser) {
    //     throw new ServiceError("Failed to generate reset token", 500)
    // }
    // const passwordResetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

    // await sendEmail({
    //     template: "passwordReset",
    //     to: user.email,
    //     subject: "Password Reset Request",
    //     resetUrl: passwordResetLink
    // });
    return { message: "Password reset link sent to email." }
};

export async function resetPasswordService(body: unknown) {
    const payload = body as { email: string; token: string; password: string; confirmPassword: string }
    const email = typeof payload?.email === "string" ? payload.email.trim() : "";
    const token = typeof payload?.token === "string" ? payload.token.trim() : "";
    const newPassword = typeof payload?.password === "string" ? payload.password.trim() : "";
    const confirmNewPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword.trim() : "";

    if (!email || !token || !newPassword || !confirmNewPassword) {
        throw new ServiceError("Email, token, new password and confirm new password are required", 400)
    }
    if (newPassword !== confirmNewPassword) {
        throw new ServiceError("Password and confirm passwords don't match", 400)
    }

    // const user = await prisma.user.findUnique({
    //     where: { email }
    // });

    // if (!user || !user.resetToken || !user.resetTokenExpiry) {
    //     throw new ServiceError("Invalid or expired reset token", 400)
    // }

    // const isTokenValid = await bcrypt.compare(token, user.resetToken);

    // if (!isTokenValid || user.resetTokenExpiry < new Date()) {
    //     throw new ServiceError("Invalid or expired reset token", 400)
    // }

    // const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // await prisma.user.update({
    //     where: { email },
    //     data: {
    //         password: hashedNewPassword,
    //         resetToken: null,
    //         resetTokenExpiry: null,
    //     },
    // });
    return { message: "Password has been reset successfully." }
}

