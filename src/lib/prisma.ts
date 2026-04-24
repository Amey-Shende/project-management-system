// import "dotenv/config";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// import { PrismaClient } from "../../generated/prisma/client";

// const globalForPrisma = globalThis as unknown as {
//     prisma?: PrismaClient;
// };

// function getDatabaseUrl() {
//     const databaseUrl = process.env.DATABASE_URL;

//     if (!databaseUrl) {
//         throw new Error("DATABASE_URL is not set");
//     }

//     const parsedUrl = new URL(databaseUrl);
//     const isLocalDatabase =
//         parsedUrl.protocol === "mysql:" &&
//         ["localhost", "127.0.0.1"].includes(parsedUrl.hostname);
//     const hasExplicitKeyConfig =
//         parsedUrl.searchParams.has("allowPublicKeyRetrieval") ||
//         parsedUrl.searchParams.has("rsaPublicKey") ||
//         parsedUrl.searchParams.has("cachingRsaPublicKey");

//     // MySQL 8 may require fetching the server RSA key during local password auth.
//     if (isLocalDatabase && !hasExplicitKeyConfig) {
//         parsedUrl.searchParams.set("allowPublicKeyRetrieval", "true");
//     }

//     return parsedUrl.toString();
// }

// const adapter = new PrismaMariaDb(getDatabaseUrl());

// export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// if (process.env.NODE_ENV !== "production") {
//     globalForPrisma.prisma = prisma;
// }


import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  adapter?: PrismaMariaDb;
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

  if (isLocalDatabase && !hasExplicitKeyConfig) {
    parsedUrl.searchParams.set("allowPublicKeyRetrieval", "true");
  }

  // Add connection pool configuration to prevent memory issues
  if (!parsedUrl.searchParams.has("connection_limit")) {
    parsedUrl.searchParams.set("connection_limit", "10");
  }
  if (!parsedUrl.searchParams.has("pool_timeout")) {
    parsedUrl.searchParams.set("pool_timeout", "20");
  }

  return parsedUrl.toString();
}

// ✅ cache adapter
const adapter =
  globalForPrisma.adapter ??
  new PrismaMariaDb(getDatabaseUrl());

// ✅ cache prisma with connection pooling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.adapter = adapter;
}