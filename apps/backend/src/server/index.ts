import { AppRouter } from "@ts-rest/core";
import { createExpressEndpoints } from "@ts-rest/express";
import {
  RouterImplementation,
  TsRestExpressOptions,
} from "@ts-rest/express/src/lib/types";
import { Router } from "express";

export type Handlers = {
  schema: AppRouter;
  router: RouterImplementation<AppRouter>;
  options?: TsRestExpressOptions<AppRouter>;
};

export function addEndpoints(app: Router, handlers: Handlers) {
  createExpressEndpoints(
    handlers.schema,
    handlers.router,
    app,
    handlers.options,
  );
}
