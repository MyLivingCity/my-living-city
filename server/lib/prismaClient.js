const { PrismaClient } = require('@prisma/client');

/**
 * Global istantiated Prisma client that can be used in all routes. 
 * https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client
 * Prisma docs above state that prisma client should only be instantiated once in application.
 * This allows for cacheing and prevents memory leaks
 */
const prisma = new PrismaClient({
  log: ['query'],
  errorFormat: 'pretty',
});

prisma.$on('query', (event) => {
  console.log(`Query Execution Time: ${event.duration}ms\n`);
});

module.exports = prisma;