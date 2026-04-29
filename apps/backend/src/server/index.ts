import { AppRouter } from "@ts-rest/core";
import { createExpressEndpoints } from "@ts-rest/express";
import {
  RouterImplementation,
  TsRestExpressOptions,
} from "@ts-rest/express/src/lib/types";
import { Router } from "express";

export type Handlers<T extends AppRouter = AppRouter> = {
  schema: T;
  router: RouterImplementation<T>;
  options?: TsRestExpressOptions<T>;
};

export function createHandlers<T extends AppRouter>(
  handlersObj: Handlers<T>,
): Handlers<T> {
  return handlersObj;
}

export function addEndpoints(app: Router, handlers: Handlers) {
  createExpressEndpoints(
    handlers.schema,
    handlers.router as RouterImplementation<AppRouter>,
    app,
    handlers.options,
  );
}
