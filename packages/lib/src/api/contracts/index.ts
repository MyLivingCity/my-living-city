import { initContract } from "@ts-rest/core";
import { adminApiContracts } from "./admin";
import { userApiContracts } from "./users";
import { ideaApiContracts } from "./ideas";
import { segmentApiContracts } from "./segments";
import { moderationApiContracts } from "./moderation";
import { subgroupApiContracts } from "./subgroups";
import { userSegmentsApiContracts } from "./userSegments";
import { communityApiContracts } from "./community";
import { ratingApiContracts } from "./ratings";
import { proposalApiContracts } from "./proposals";
import { publicProfileApiContracts } from "./publicProfile";
import { extraProposalPricingApiContracts } from "./extraProposalPricing";
import { feedbackRatingApiContracts } from "./feedbackRating";
import { googleMapApiContracts } from "./googleMap";
import { accountPricingApiContracts } from "./accountPricing";
import { sendEmailResetApiContracts } from "./sendEmailReset";
import { userReachApiContracts } from "./userReach";
import { userSegmentRequestApiContracts } from "./userSegmentRequest";
import { stripeAccountApiContracts } from "./stripeAccount";

const c = initContract();

export const allApiContracts = c.router({
  admin: adminApiContracts,
  users: userApiContracts,
  ideas: ideaApiContracts,
  moderation: moderationApiContracts,
  segments: segmentApiContracts,
  subgroups: subgroupApiContracts,
  userSegments: userSegmentsApiContracts,
  community: communityApiContracts,
  ratings: ratingApiContracts,
  proposals: proposalApiContracts,
  publicProfile: publicProfileApiContracts,
  extraProposalPricing: extraProposalPricingApiContracts,
  feedbackRating: feedbackRatingApiContracts,
  googleMap: googleMapApiContracts,
  accountPricing: accountPricingApiContracts,
  sendEmailReset: sendEmailResetApiContracts,
  userReach: userReachApiContracts,
  userSegmentRequest: userSegmentRequestApiContracts,
  stripeAccount: stripeAccountApiContracts,
});
