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

export function addEndpoints<T extends AppRouter = AppRouter>(
  app: Router,
  handlers: Handlers<T>,
) {
  createExpressEndpoints<T>(
    handlers.schema,
    handlers.router as RouterImplementation<T>,
    app,
    handlers.options,
  );
}
