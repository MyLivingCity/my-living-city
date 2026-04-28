import { moderationApiContracts } from "@mlc/lib/api";
import { Handlers } from "src/server";

import { reputationRouter } from "./reputation/handler";
import { flagsRouter } from "./flags/handler";
import { bansRouter } from "./bans/handler";

export default {
  schema: moderationApiContracts,
  router: {
    reputation: reputationRouter,
    flags: flagsRouter,
    bans: bansRouter,
  },
} as unknown as Handlers;
