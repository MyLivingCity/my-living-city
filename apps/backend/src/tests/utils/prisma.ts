import { PrismaClient } from "#prisma/client";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";

import { prisma } from "src/prisma/client";

vitest.mock("src/prisma/client", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

export default prisma as unknown as DeepMockProxy<PrismaClient>;
