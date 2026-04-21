import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userApiHandlers from "./server/features/users/handler";
import { addEndpoints } from "./server";
import { strategyJwt } from "./lib/auth/strategy";
import passport from "passport";

const app = express();

passport.use(strategyJwt);

app.use(cors());
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

addEndpoints(app, userApiHandlers);

const port = process.env["port"] || 3001;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
