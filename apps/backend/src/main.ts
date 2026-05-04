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
import detailsApiHandlers from "./server/features/details/handler";
import ratingApiHandlers from "./server/features/ratings/handler";
import proposalApiHandlers from "./server/features/proposals/handler";
import publicProfileApiHandlers from "./server/features/publicProfile/handler";
import extraProposalPricingApiHandlers from "./server/features/extraProposalPricing/handler";
import feedbackRatingApiHandlers from "./server/features/feedbackRating/handler";
import googleMapApiHandlers from "./server/features/googleMap/handler";
import accountPricingApiHandlers from "./server/features/accountPricing/handler";
import sendEmailResetApiHandlers from "./server/features/sendEmailReset/handler";
import userReachApiHandlers from "./server/features/userReach/handler";
import userSegmentRequestApiHandlers from "./server/features/userSegmentRequest/handler";
import stripeAccountApiHandlers from "./server/features/stripeAccount/handler";
import { addEndpoints } from "./server";
import { initStrategies } from "./lib/auth/strategy";
import { pinoHttp } from "pino-http";
import { configDefaultHttpLogger } from "./logger";

const app = express();

app.use(pinoHttp(configDefaultHttpLogger));

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
addEndpoints(app, detailsApiHandlers);
addEndpoints(app, ratingApiHandlers);
addEndpoints(app, proposalApiHandlers);
addEndpoints(app, publicProfileApiHandlers);
addEndpoints(app, extraProposalPricingApiHandlers);
addEndpoints(app, feedbackRatingApiHandlers);
addEndpoints(app, googleMapApiHandlers);
addEndpoints(app, accountPricingApiHandlers);
addEndpoints(app, sendEmailResetApiHandlers);
addEndpoints(app, userReachApiHandlers);
addEndpoints(app, userSegmentRequestApiHandlers);
addEndpoints(app, stripeAccountApiHandlers);

const port = process.env["port"] || 3001;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
