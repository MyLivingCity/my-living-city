import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userApiHandlers from "./server/features/users/handler";
import ideaApiHandlers from "./server/features/ideas/handler";
import segmentApiHandlers from "./server/features/segments/handler";
import userSegmentApiHandlers from "./server/features/userSegments/handler";
import moderationApiHandlers from "./server/features/moderation/index";
import subgroupApiHandlers from "./server/features/subgroups/handler";
import communityApiHandlers from "./server/features/community/handler";
import adminApiHandlers from "./server/features/admin/handler";
import extraProposalPricingApiHandlers from "./server/features/extraProposalPricing/handler";
import feedbackRatingApiHandlers from "./server/features/feedbackRating/handler";
import googleMapApiHandlers from "./server/features/googleMap/handler";
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
addEndpoints(app, ideaApiHandlers);
addEndpoints(app, segmentApiHandlers);
addEndpoints(app, userSegmentApiHandlers);
addEndpoints(app, moderationApiHandlers);
addEndpoints(app, subgroupApiHandlers);
addEndpoints(app, communityApiHandlers);
addEndpoints(app, adminApiHandlers);
addEndpoints(app, extraProposalPricingApiHandlers);
addEndpoints(app, feedbackRatingApiHandlers);
addEndpoints(app, googleMapApiHandlers);

const port = process.env["port"] || 3001;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
