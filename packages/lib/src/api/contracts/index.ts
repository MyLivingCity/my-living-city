import { initContract } from "@ts-rest/core";
import { adminApiContracts } from "./admin";
import { userApiContracts } from "./users";
import { ideaApiContracts } from "./ideas";
import { segmentApiContracts } from "./segments";
import { moderationApiContracts } from "./moderation";
import { subgroupApiContracts } from "./subgroups";
import { userSegmentsApiContracts } from "./userSegments";
import { communityApiContracts } from "./community";
import { ratingApiContracts } from "./ratings";
import { proposalApiContracts } from "./proposals";
import { publicProfileApiContracts } from "./publicProfile";

const c = initContract();

export const allApiContracts = c.router({
  admin: adminApiContracts,
  users: userApiContracts,
  ideas: ideaApiContracts,
  moderation: moderationApiContracts,
  segments: segmentApiContracts,
  subgroups: subgroupApiContracts,
  userSegments: userSegmentsApiContracts,
  community: communityApiContracts,
  ratings: ratingApiContracts,
  proposals: proposalApiContracts,
  publicProfile: publicProfileApiContracts,
});
