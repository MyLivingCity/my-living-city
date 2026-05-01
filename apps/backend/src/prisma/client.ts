import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "#prisma/client";
import { env } from "src/lib/env";
import { log } from "src/logger";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

/**
 * Global istantiated Prisma client that can be used in all routes.
 * https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client
 * Prisma docs above state that prisma client should only be instantiated once in application.
 * This allows for cacheing and prevents memory leaks
 */
export const prisma = new PrismaClient({
  adapter,
  log: [{ emit: "event", level: "query" }],
  errorFormat: "pretty",
});

prisma.$on("query", (event) => {
  log.info(`Query: ${event.query}
    Params: ${event.params}
    Execution time: ${event.duration}ms
`);
});
