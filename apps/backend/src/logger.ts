import { randomUUID } from "node:crypto";
import pino from "pino";
import type { Options } from "pino-http";

export const log = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const configDefaultHttpLogger: Options = {
  // Reuse an existing logger instance
  logger: log,

  // Define a custom request id function
  genReqId: function (req, res) {
    const existingID = req.id ?? req.headers["x-request-id"];
    if (existingID) return existingID;
    const id = randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },

  // Define custom serializers
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Set to `false` to prevent standard serializers from being wrapped.
  wrapSerializers: true,

  autoLogging: {
    ignore: function (req) {
      return req.method === "OPTIONS";
    },
  },

  // Define a custom logger level
  customLogLevel: function (_, res, err: unknown) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn";
    } else if (res.statusCode >= 500 || err) {
      return "error";
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return "silent";
    }
    return "info";
  },

  // Define a custom success message
  customSuccessMessage: function (req, res) {
    if (res.statusCode >= 400 && res.statusCode <= 499) {
      return `${res.statusCode} ${res.statusMessage}`;
    }
    return `${req.method} completed`;
  },

  // Define a custom receive message
  customReceivedMessage: function (req) {
    return `${req.method} received`;
  },

  // Define a custom error message
  customErrorMessage: function (_, res) {
    return `${res.statusCode} ${res.statusMessage}`;
  },

  // Override attribute keys for the log object
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "timeTakenMsec",
  },
};
