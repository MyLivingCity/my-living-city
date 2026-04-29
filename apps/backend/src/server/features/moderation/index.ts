import { moderationApiContracts } from "@mlc/lib/api";

import { reputationRouter } from "./reputation/handler";
import { flagsRouter } from "./flags/handler";
import { bansRouter } from "./bans/handler";
import { createHandlers } from "src/server";

export default createHandlers({
  schema: moderationApiContracts,
  router: {
    reputation: reputationRouter,
    flags: flagsRouter,
    bans: bansRouter,
  },
});
