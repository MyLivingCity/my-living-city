import z from "zod";
import { UserTypeSchema } from "./users";
import { DecimalLikeSchema } from "../common";
import { initContract } from "@ts-rest/core";

const c = initContract();

const AnySchema = z.any();
const DateLikeSchema = z.union([z.string(), z.date()]);
const UnknownRecordSchema = z.record(z.string(), z.unknown());
const ErrorDetailsSchema = z.object({
  errorMessage: z.string(),
  errorStack: z.string(),
});
const ErrorResponseSchema = z
  .object({
    message: z.string(),
    details: ErrorDetailsSchema.optional(),
  })
  .passthrough();
const ErrorResponseWithRequestBodySchema = z
  .object({
    message: z.string(),
    details: ErrorDetailsSchema.optional(),
    reqBody: UnknownRecordSchema.optional(),
  })
  .passthrough();
const MessageResponseSchema = z.object({ message: z.string() }).passthrough();
const RouteResponseSchema = z.object({ route: z.string() });
const CommentAuthorSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    fname: z.string().nullable().optional(),
    lname: z.string().nullable().optional(),
    organizationName: z.string().nullable().optional(),
    userType: UserTypeSchema.optional(),
    userSegment: z.object({ id: z.number() }).optional(),
    address: z
      .object({
        streetAddress: z.string().nullable().optional(),
        postalCode: z.string().nullable().optional(),
      })
      .optional(),
  })
  .passthrough();
const IdeaSegmentSchema = z
  .object({
    segId: z.number(),
    name: z.string(),
    segmentType: z.string().nullable().optional(),
  })
  .passthrough();
const CommentIdeaSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    description: z.string().nullable().optional(),
    segmentId: z.number().nullable().optional(),
    subSegmentId: z.number().nullable().optional(),
    segments: z.array(IdeaSegmentSchema).optional(),
  })
  .passthrough();
const CommentSchema = z
  .object({
    id: z.number(),
    content: z.string(),
    authorId: z.string(),
    ideaId: z.number(),
    createdAt: DateLikeSchema,
    updatedAt: DateLikeSchema,
    reviewed: z.boolean().nullable().optional(),
    active: z.boolean().nullable().optional(),
    bannedComment: z.boolean().nullable().optional(),
    notification_dismissed: z.boolean().nullable().optional(),
    quarantined_at: DateLikeSchema.nullable().optional(),
    tone: z.string().nullable().optional(),
    attitude: z.string().nullable().optional(),
    keywords: z.unknown().optional(),
    author: CommentAuthorSchema.optional(),
    idea: CommentIdeaSchema.optional(),
    likes: z.array(UnknownRecordSchema).optional(),
    dislikes: z.array(UnknownRecordSchema).optional(),
    _count: z
      .object({
        likes: z.number(),
        dislikes: z.number(),
      })
      .optional(),
  })
  .passthrough();
const SimilarCommentsResponseSchema = z.object({
  message: z.string(),
  similarComments: z.array(CommentSchema),
});
const LikeDislikeSchema = z
  .object({
    id: z.number(),
    authorId: z.string().nullable(),
    ideaCommentId: z.number().nullable(),
  })
  .passthrough();
const ProposalMembershipSchema = z
  .object({
    id: z.number(),
    proposalId: z.number(),
    authorId: z.string(),
    contactInfo: z.string().nullable().optional(),
  })
  .passthrough();
const CategorySchema = z
  .object({
    id: z.number(),
  })
  .passthrough();
const AdvertisementSchema = z
  .object({
    id: z.number(),
    ownerId: z.string(),
    ownerEmail: z.string().nullable(),
    adTitle: z.string(),
    adType: z.string(),
    adPosition: z.string(),
    imagePath: z.string().nullable(),
    externalLink: z.string(),
    published: z.boolean(),
    duration: DateLikeSchema.nullable().optional(),
    createAt: DateLikeSchema.optional(),
    updateAt: DateLikeSchema.nullable().optional(),
  })
  .passthrough();
const AdvertisementDeleteResponseSchema = z.object({
  message: z.string(),
  deletedAd: AdvertisementSchema,
});
const AdPriceSchema = z
  .object({
    id: z.number(),
    lengthWeeks: z.number(),
    priceCadDollars: DecimalLikeSchema,
  })
  .passthrough();
const SegmentPricingSchema = z.object({
  name: z.string(),
  segId: z.number().nullable(),
  count: z.number(),
});
const SegmentPriceSchema = z.object({
  id: z.number().nullable(),
  segmentId: z.number(),
  segmentName: z.string(),
  weeklyPrice: z.string().nullable(),
});

export const communityApiContracts = c.router({
  commentRoot: {
    method: "GET",
    path: "/comment/",
    responses: { 200: RouteResponseSchema, 400: ErrorResponseSchema },
  },
  commentGetAll: {
    method: "GET",
    path: "/comment/getall",
    responses: { 200: z.array(CommentSchema), 400: ErrorResponseSchema },
  },
  commentGetAllByIdeaId: {
    method: "GET",
    path: "/comment/getall/:ideaId",
    pathParams: z.object({ ideaId: z.string() }),
    responses: { 200: z.array(CommentSchema), 400: ErrorResponseSchema },
  },
  commentCreate: {
    method: "POST",
    path: "/comment/create/:ideaId",
    pathParams: z.object({ ideaId: z.string() }),
    body: AnySchema,
    responses: {
      200: CommentSchema,
      400: ErrorResponseSchema,
      403: MessageResponseSchema,
    },
  },
  commentSimilarComments: {
    method: "POST",
    path: "/comment/similarcomments/:ideaId",
    pathParams: z.object({ ideaId: z.string() }),
    body: AnySchema,
    responses: { 200: SimilarCommentsResponseSchema, 400: ErrorResponseSchema },
  },
  commentUpdateState: {
    method: "PUT",
    path: "/comment/updateState/:commentId",
    pathParams: z.object({ commentId: z.string() }),
    body: AnySchema,
    responses: {
      200: z.object({ message: z.string(), idea: CommentSchema }),
      400: ErrorResponseSchema,
    },
  },
  commentUpdateNotificationState: {
    method: "PUT",
    path: "/comment/updateNotificationState/:commentId",
    pathParams: z.object({ commentId: z.string() }),
    body: AnySchema,
    responses: {
      200: z.object({ message: z.string(), idea: CommentSchema }),
      400: ErrorResponseSchema,
    },
  },
  commentUpdate: {
    method: "PUT",
    path: "/comment/update/:commentId",
    pathParams: z.object({ commentId: z.string() }),
    body: AnySchema,
    responses: {
      200: z.object({ message: z.string(), comment: CommentSchema }),
      400: ErrorResponseSchema,
      401: MessageResponseSchema,
    },
  },
  commentDelete: {
    method: "DELETE",
    path: "/comment/delete/:commentId",
    pathParams: z.object({ commentId: z.string() }),
    body: AnySchema,
    responses: {
      200: z.object({ message: z.string(), deletedComment: CommentSchema }),
      400: ErrorResponseSchema,
      401: MessageResponseSchema,
    },
  },
  commentAggregate: {
    method: "GET",
    path: "/comment/aggregate/:ideaId",
    pathParams: z.object({ ideaId: z.string() }),
    responses: {
      200: z.object({ count: z.number() }),
      400: ErrorResponseSchema,
    },
  },
  commentByUser: {
    method: "GET",
    path: "/comment/user/:userId",
    pathParams: z.object({ userId: z.string() }),
    responses: { 200: z.array(CommentSchema), 400: ErrorResponseSchema },
  },
  commentInteractTest: {
    method: "GET",
    path: "/interact/comment/test",
    responses: { 200: z.string(), 400: ErrorResponseSchema },
  },
  commentInteractLikeGetAll: {
    method: "GET",
    path: "/interact/comment/like/getall",
    responses: { 200: z.array(LikeDislikeSchema), 400: ErrorResponseSchema },
  },
  commentInteractDislikeGetAll: {
    method: "GET",
    path: "/interact/comment/dislike/getall",
    responses: { 200: z.array(LikeDislikeSchema), 400: ErrorResponseSchema },
  },
  commentInteractLike: {
    method: "POST",
    path: "/interact/comment/like/:commentId",
    pathParams: z.object({ commentId: z.string() }),
    body: AnySchema,
    responses: { 201: LikeDislikeSchema.nullable(), 400: ErrorResponseSchema },
  },
  commentInteractDislike: {
    method: "POST",
    path: "/interact/comment/dislike/:commentId",
    pathParams: z.object({ commentId: z.string() }),
    body: AnySchema,
    responses: { 201: LikeDislikeSchema.nullable(), 400: ErrorResponseSchema },
  },
  communityCreateCollaborator: {
    method: "POST",
    path: "/community/create/collaborator",
    body: AnySchema,
    responses: { 200: ProposalMembershipSchema, 400: ErrorResponseSchema },
  },
  communityGetCollaborators: {
    method: "GET",
    path: "/community/collaborators/getAll/:proposalId",
    pathParams: z.object({ proposalId: z.string() }),
    responses: {
      200: z.array(ProposalMembershipSchema),
      400: ErrorResponseSchema,
    },
  },
  communityCreateVolunteer: {
    method: "POST",
    path: "/community/create/volunteer",
    body: AnySchema,
    responses: { 200: ProposalMembershipSchema, 400: ErrorResponseSchema },
  },
  communityGetVolunteers: {
    method: "GET",
    path: "/community/volunteers/getAll/:proposalId",
    pathParams: z.object({ proposalId: z.string() }),
    responses: {
      200: z.array(ProposalMembershipSchema),
      400: ErrorResponseSchema,
    },
  },
  communityCreateDonor: {
    method: "POST",
    path: "/community/create/donor",
    body: AnySchema,
    responses: { 200: ProposalMembershipSchema, 400: ErrorResponseSchema },
  },
  communityGetDonors: {
    method: "GET",
    path: "/community/donors/getAll/:proposalId",
    pathParams: z.object({ proposalId: z.string() }),
    responses: {
      200: z.array(ProposalMembershipSchema),
      400: ErrorResponseSchema,
    },
  },
  blogRoot: {
    method: "GET",
    path: "/blog/",
    responses: { 200: RouteResponseSchema, 400: ErrorResponseSchema },
  },
  categoryRoot: {
    method: "GET",
    path: "/category/",
    responses: { 200: RouteResponseSchema, 400: ErrorResponseSchema },
  },
  categoryGetAll: {
    method: "GET",
    path: "/category/getall",
    responses: { 200: z.array(CategorySchema), 400: ErrorResponseSchema },
  },
  categoryGetById: {
    method: "GET",
    path: "/category/get/:categoryId",
    pathParams: z.object({ categoryId: z.string() }),
    responses: { 200: CategorySchema, 400: ErrorResponseSchema },
  },
  advertisementCreate: {
    method: "POST",
    path: "/advertisement/create",
    contentType: "multipart/form-data",
    body: AnySchema,
    responses: {
      200: AdvertisementSchema,
      400: ErrorResponseSchema,
      403: ErrorResponseSchema,
    },
  },
  advertisementGetAll: {
    method: "GET",
    path: "/advertisement/getAll",
    responses: {
      200: z.array(AdvertisementSchema),
      400: ErrorResponseSchema,
      404: z.string(),
    },
  },
  advertisementGetAllPublished: {
    method: "GET",
    path: "/advertisement/getAllPublished",
    responses: {
      200: z.array(AdvertisementSchema),
      400: ErrorResponseSchema,
      404: z.string(),
    },
  },
  advertisementGetAllUser: {
    method: "GET",
    path: "/advertisement/getAllUser/:userId",
    pathParams: z.object({ userId: z.string() }),
    responses: {
      200: z.array(AdvertisementSchema),
      204: z.string(),
      400: ErrorResponseSchema,
    },
  },
  advertisementGetById: {
    method: "GET",
    path: "/advertisement/get/:adsId",
    pathParams: z.object({ adsId: z.string() }),
    responses: {
      200: AdvertisementSchema,
      204: z.string(),
      400: ErrorResponseSchema,
    },
  },
  advertisementGetAdsByOwner: {
    method: "GET",
    path: "/advertisement/getAdsByOwner/:ownerId",
    pathParams: z.object({ ownerId: z.string() }),
    responses: {
      200: z.array(AdvertisementSchema),
      400: ErrorResponseSchema,
    },
  },
  advertisementUpdate: {
    method: "PUT",
    path: "/advertisement/update/:advertisementId",
    pathParams: z.object({ advertisementId: z.string() }),
    contentType: "multipart/form-data",
    body: AnySchema,
    responses: {
      200: AdvertisementSchema,
      400: ErrorResponseWithRequestBodySchema,
      401: MessageResponseSchema,
      403: ErrorResponseSchema,
    },
  },
  advertisementDelete: {
    method: "DELETE",
    path: "/advertisement/delete/:advertisementId",
    pathParams: z.object({ advertisementId: z.string() }),
    body: AnySchema,
    responses: {
      200: AdvertisementDeleteResponseSchema,
      400: ErrorResponseSchema,
      401: MessageResponseSchema,
      403: ErrorResponseSchema,
      404: z.string(),
    },
  },
  advertisementGetPrices: {
    method: "GET",
    path: "/advertisement/getPrices",
    responses: { 200: z.array(AdPriceSchema), 400: ErrorResponseSchema },
  },
  advertisementAddPrice: {
    method: "POST",
    path: "/advertisement/addPrice",
    body: AnySchema,
    responses: {
      201: AdPriceSchema,
      400: z.object({
        message: z.string(),
        details: z.string().optional(),
      }),
    },
  },
  advertisementUpdatePrice: {
    method: "PUT",
    path: "/advertisement/updatePrice/:id",
    pathParams: z.object({ id: z.string() }),
    body: AnySchema,
    responses: {
      200: AdPriceSchema,
      400: z.object({
        message: z.string(),
        details: z.string().optional(),
      }),
    },
  },
  advertisementDeletePrice: {
    method: "DELETE",
    path: "/advertisement/deletePrice/:id",
    pathParams: z.object({ id: z.string() }),
    body: AnySchema,
    responses: {
      204: z.undefined(),
      400: z.object({
        message: z.string(),
        details: z.string().optional(),
      }),
    },
  },
  advertisementPricing: {
    method: "GET",
    path: "/advertisement/pricing",
    responses: {
      200: z.array(SegmentPricingSchema),
      400: MessageResponseSchema,
    },
  },
  advertisementGetSegmentPrices: {
    method: "GET",
    path: "/advertisement/getSegmentPrices",
    responses: {
      200: z.array(SegmentPriceSchema),
      400: ErrorResponseSchema,
    },
  },
  advertisementUpdateSegmentPrice: {
    method: "PUT",
    path: "/advertisement/updateSegmentPrice/:segmentId",
    pathParams: z.object({ segmentId: z.string() }),
    body: AnySchema,
    responses: {
      200: SegmentPriceSchema,
      400: ErrorResponseSchema,
      403: MessageResponseSchema,
    },
  },
  advertisementDeleteSegmentPrice: {
    method: "DELETE",
    path: "/advertisement/deleteSegmentPrice/:segmentId",
    pathParams: z.object({ segmentId: z.string() }),
    body: AnySchema,
    responses: {
      200: MessageResponseSchema,
      400: ErrorResponseSchema,
      403: MessageResponseSchema,
    },
  },
});
