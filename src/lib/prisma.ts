import { PrismaClient } from "@prisma/client/wasm";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

// Neon uses HTTP in Workers, so the client does not retain a request-scoped
// TCP socket that Cloudflare can cancel when the isolate handles another request.
const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({ adapter });
