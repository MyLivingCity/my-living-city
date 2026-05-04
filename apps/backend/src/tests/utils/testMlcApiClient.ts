import { initClient } from "@ts-rest/core";
import request from "supertest";
import { allApiContracts } from "@mlc/lib/api";
import { app } from "src/main";

export const testApiClient = initClient(allApiContracts, {
  baseUrl: "",
  baseHeaders: {},
  api: async ({ path, method, headers, body }) => {
    const response = await request(app)
    [method.toLowerCase() as "get"](path)
      .set(headers)
      .send(body);

    return {
      status: response.status,
      body: response.body,
      headers: response.headers,
    };
  },
});
