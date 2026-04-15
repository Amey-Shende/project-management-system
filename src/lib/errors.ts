import { NextResponse } from "next/server";
import { ServiceError } from "./ServiceError";

export function handleControllerError(error: unknown, action: string) {
    if (error instanceof SyntaxError) {
        return NextResponse.json(
            { message: "Invalid request body" },
            { status: 400 },
        );
    }

    if (error instanceof ServiceError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.statusCode },
        );
    }

    console.error(`${action} failed:`, error);

    return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 },
    );
}
