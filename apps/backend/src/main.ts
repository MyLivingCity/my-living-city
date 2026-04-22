import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userApiHandlers from "./server/features/users/handler";
import { addEndpoints } from "./server";
import { initStrategies } from "./lib/auth/strategy";

const app = express();

const passport = initStrategies();

app.use(passport.initialize());

app.use(
  cors({
    origin: /http(s|):\/\/localhost:(3000|4000)/, // TODO - Implement env
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

addEndpoints(app, userApiHandlers);

const port = process.env["port"] || 3001;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
