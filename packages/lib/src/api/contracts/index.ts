import { initContract } from "@ts-rest/core";
import { userApiContracts } from "./users";
import { ideaApiContracts } from "./ideas";
import { segmentApiContracts } from "./segments";
import { moderationApiContracts } from "./moderation/moderation";
import { subgroupApiContracts } from "./subgroups";
import { userSegmentsApiContracts } from "./userSegments";

const c = initContract();

export const allApiContracts = c.router({
  users: userApiContracts,
  ideas: ideaApiContracts,
  moderation: moderationApiContracts,
  segments: segmentApiContracts,
  subgroups: subgroupApiContracts,
  userSegments: userSegmentsApiContracts,
});
