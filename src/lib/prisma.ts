import { PrismaClient } from "@prisma/client/wasm";
import { PrismaNeon } from "@prisma/adapter-neon";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

// Cloudflare isolates are reused, but I/O state may not cross request boundaries.
// Resolve each Prisma delegate from a client created in the active request.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = createPrismaClient();
    const value = client[property as keyof PrismaClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
