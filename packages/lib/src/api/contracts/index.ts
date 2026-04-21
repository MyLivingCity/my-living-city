import { initContract } from "@ts-rest/core";
import { userApiContracts } from "./users";
import { ideaApiContracts } from "./ideas";

const c = initContract();

export const allApiContracts = c.router({
  users: userApiContracts,
  ideas: ideaApiContracts,
});
