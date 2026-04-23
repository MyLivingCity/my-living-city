import { initContract } from "@ts-rest/core";
import { userApiContracts } from "./users";
import { ideaApiContracts } from "./ideas";
import { segmentApiContracts } from "./segments";
<<<<<<< HEAD
import { subgroupApiContracts } from "./subgroups";
=======
import { moderationApiContracts } from "./moderation";
>>>>>>> 7e9b0323 (feat(backend): WIP.)

const c = initContract();

export const allApiContracts = c.router({
  users: userApiContracts,
  ideas: ideaApiContracts,
  moderation: moderationApiContracts,
  segments: segmentApiContracts,
  subgroups: subgroupApiContracts,
});
