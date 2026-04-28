import { moderationApiContracts } from "@mlc/lib/api";
import { Handlers } from "src/server";

import { reputationRouter } from "./reputation/handler";
//import { flagRouter } from "./flags/handler";
//import { banRouter } from "./bans/handler";

export default {
  schema: moderationApiContracts,
  router: {
    reputation: reputationRouter,
    //flags: flagRouter,
    //bans: banRouter,
  },
} as unknown as Handlers;
