# Handler Refactor Report

Maps each `features/*/handler.ts` to the legacy controller files it consolidates.

| Feature | Source controllers |
|---|---|
| `features/auth/handler.ts` | `oauth.js`, `emailVerification.js`, `sendEmailReset.js`, `auth/auth.js` |
| `features/ideas/handler.ts` | `idea.js`, `rating.js`, `flag.js`, `champion.js`, `image.js`, `feedbackRating.js` |
| `features/users/handler.ts` | `user.js`, `role.js`, `publicProfile.js`, `avatar.js`, `userReach.js`, `schoolDetails.js`, `workDetails.js`, `enhancedMember.js` |
| `features/moderation/handler.ts` | `banUser.js`, `banPost.js`, `banComment.js`, `badPostingBehavior.js`, `falseFlaggingBehavior.js`*, `report.js`, `commentFlag.js` |
| `features/proposals/handler.ts` | `proposal.js`, `extraProposalPricing/extraProposalPricing.js`, `pricingAndLimit/accountPricing.js` |
| `features/segments/handler.ts` | `segments/segment.js`, `segments/subSegment.js`, `segments/superSegment.js`, `userSegment.js`, `userSegmentRequest.js`, `googleMap.js` |
| `features/subgroups/handler.ts` | `subgroups.js`, `subgroup/subgroup.js`, `subgroupRequest.js`, `publicSubgroup.js` |
| `features/admin/handler.ts` | `dashboard.js`, `threshhold.js` |
| `features/community/handler.ts` | `community.js`, `comment.js`, `commentInteract.js`, `commentFunnel.js`**, `blog.js`, `category.js`, `advertisement.js` |

\* `falseFlaggingBehavior.js` — verify whether any routes are actually implemented before migrating.  
\*\* `commentFunnel.js` — not mounted in `server.js`; audit before migrating.
