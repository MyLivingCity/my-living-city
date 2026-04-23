import { initContract } from "@ts-rest/core";
import { userApiContracts } from "./users";
import { ideaApiContracts } from "./ideas";
import { segmentApiContracts } from "./segments";
import { subgroupApiContracts } from "./subgroups";

const c = initContract();

export const allApiContracts = c.router({
  users: userApiContracts,
  ideas: ideaApiContracts,
  segments: segmentApiContracts,
  subgroups: subgroupApiContracts,
});
