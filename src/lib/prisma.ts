import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

function getDatabaseUrl() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set");
    }

    const parsedUrl = new URL(databaseUrl);
    const isLocalDatabase =
        parsedUrl.protocol === "mysql:" &&
        ["localhost", "127.0.0.1"].includes(parsedUrl.hostname);
    const hasExplicitKeyConfig =
        parsedUrl.searchParams.has("allowPublicKeyRetrieval") ||
        parsedUrl.searchParams.has("rsaPublicKey") ||
        parsedUrl.searchParams.has("cachingRsaPublicKey");

    // MySQL 8 may require fetching the server RSA key during local password auth.
    if (isLocalDatabase && !hasExplicitKeyConfig) {
        parsedUrl.searchParams.set("allowPublicKeyRetrieval", "true");
    }

    return parsedUrl.toString();
}

const adapter = new PrismaMariaDb(getDatabaseUrl());

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
