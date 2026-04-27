import { allApiContracts } from "@mlc/lib/api";
import { initClient } from "@ts-rest/core";

export const mlcApiClient = initClient(allApiContracts, {
  baseUrl: "http://localhost:3001", // TODO: Implement env
  credentials: "include",
});
