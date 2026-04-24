import { initContract } from "@ts-rest/core";
import { bansContract } from "./bans";
import { flagsContract } from "./flags";
import { reputationContract } from "./reputation";

const c = initContract();

export const moderationApiContracts = c.router({
  bans: bansContract,
  flags: flagsContract,
  reputation: reputationContract,
});
