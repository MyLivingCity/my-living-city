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

export const commentApiContracts = c.router(
  {
    get: {
      method: "GET",
      path: "/",
      responses: { 200: RouteResponseSchema, 400: ErrorResponseSchema },
    },
    getAll: {
      method: "GET",
      path: "/getall",
      responses: { 200: z.array(CommentSchema), 400: ErrorResponseSchema },
    },
    getAllByIdeaId: {
      method: "GET",
      path: "/getall/:ideaId",
      pathParams: z.object({ ideaId: z.string() }),
      responses: { 200: z.array(CommentSchema), 400: ErrorResponseSchema },
    },
    create: {
      method: "POST",
      path: "/create/:ideaId",
      pathParams: z.object({ ideaId: z.string() }),
      body: AnySchema,
      responses: {
        200: CommentSchema,
        400: ErrorResponseSchema,
        403: MessageResponseSchema,
      },
    },
    similarComments: {
      method: "POST",
      path: "/similarcomments/:ideaId",
      pathParams: z.object({ ideaId: z.string() }),
      body: AnySchema,
      responses: {
        200: SimilarCommentsResponseSchema,
        400: ErrorResponseSchema,
      },
    },
    updateState: {
      method: "PUT",
      path: "/updateState/:commentId",
      pathParams: z.object({ commentId: z.string() }),
      body: AnySchema,
      responses: {
        200: z.object({ message: z.string(), idea: CommentSchema }),
        400: ErrorResponseSchema,
      },
    },
    updateNotificationState: {
      method: "PUT",
      path: "/updateNotificationState/:commentId",
      pathParams: z.object({ commentId: z.string() }),
      body: AnySchema,
      responses: {
        200: z.object({ message: z.string(), idea: CommentSchema }),
        400: ErrorResponseSchema,
      },
    },
    update: {
      method: "PUT",
      path: "/update/:commentId",
      pathParams: z.object({ commentId: z.string() }),
      body: AnySchema,
      responses: {
        200: z.object({ message: z.string(), comment: CommentSchema }),
        400: ErrorResponseSchema,
        401: MessageResponseSchema,
      },
    },
    delete: {
      method: "DELETE",
      path: "/delete/:commentId",
      pathParams: z.object({ commentId: z.string() }),
      body: AnySchema,
      responses: {
        200: z.object({ message: z.string(), deletedComment: CommentSchema }),
        400: ErrorResponseSchema,
        401: MessageResponseSchema,
      },
    },
    getAggregate: {
      method: "GET",
      path: "/aggregate/:ideaId",
      pathParams: z.object({ ideaId: z.string() }),
      responses: {
        200: z.object({ count: z.number() }),
        400: ErrorResponseSchema,
      },
    },
    getByUser: {
      method: "GET",
      path: "/user/:userId",
      pathParams: z.object({ userId: z.string() }),
      responses: { 200: z.array(CommentSchema), 400: ErrorResponseSchema },
    },
  },
  {
    pathPrefix: "/comment",
  },
);

export const commentInteractionApiContracts = c.router(
  {
    commentTest: {
      method: "GET",
      path: "/comment/test",
      responses: { 200: z.string(), 400: ErrorResponseSchema },
    },
    commentLikeGetAll: {
      method: "GET",
      path: "/comment/like/getall",
      responses: {
        200: z.array(LikeDislikeSchema),
        400: ErrorResponseSchema,
      },
    },
    commentDislikeGetAll: {
      method: "GET",
      path: "/comment/dislike/getall",
      responses: {
        200: z.array(LikeDislikeSchema),
        400: ErrorResponseSchema,
      },
    },
    commentLike: {
      method: "POST",
      path: "/comment/like/:commentId",
      pathParams: z.object({ commentId: z.string() }),
      body: AnySchema,
      responses: {
        201: LikeDislikeSchema.nullable(),
        400: ErrorResponseSchema,
      },
    },
    commentDislike: {
      method: "POST",
      path: "/comment/dislike/:commentId",
      pathParams: z.object({ commentId: z.string() }),
      body: AnySchema,
      responses: {
        201: LikeDislikeSchema.nullable(),
        400: ErrorResponseSchema,
      },
    },
  },
  {
    pathPrefix: "/interact",
  },
);

export const advertisementApiContracts = c.router(
  {
    create: {
      method: "POST",
      path: "/create",
      contentType: "multipart/form-data",
      body: AnySchema,
      responses: {
        200: AdvertisementSchema,
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
    },
    getAll: {
      method: "GET",
      path: "/getAll",
      responses: {
        200: z.array(AdvertisementSchema),
        400: ErrorResponseSchema,
        404: z.string(),
      },
    },
    getAllPublished: {
      method: "GET",
      path: "/getAllPublished",
      responses: {
        200: z.array(AdvertisementSchema),
        400: ErrorResponseSchema,
        404: z.string(),
      },
    },
    getAllUser: {
      method: "GET",
      path: "/getAllUser/:userId",
      pathParams: z.object({ userId: z.string() }),
      responses: {
        200: z.array(AdvertisementSchema),
        204: z.string(),
        400: ErrorResponseSchema,
      },
    },
    getById: {
      method: "GET",
      path: "/get/:adsId",
      pathParams: z.object({ adsId: z.string() }),
      responses: {
        200: AdvertisementSchema,
        204: z.string(),
        400: ErrorResponseSchema,
      },
    },
    getAdsByOwner: {
      method: "GET",
      path: "/getAdsByOwner/:ownerId",
      pathParams: z.object({ ownerId: z.string() }),
      responses: {
        200: z.array(AdvertisementSchema),
        400: ErrorResponseSchema,
      },
    },
    update: {
      method: "PUT",
      path: "/update/:id",
      pathParams: z.object({ id: z.string() }),
      contentType: "multipart/form-data",
      body: AnySchema,
      responses: {
        200: AdvertisementSchema,
        400: ErrorResponseWithRequestBodySchema,
        401: MessageResponseSchema,
        403: ErrorResponseSchema,
      },
    },
    delete: {
      method: "DELETE",
      path: "/delete/:id",
      pathParams: z.object({ id: z.string() }),
      body: AnySchema,
      responses: {
        200: AdvertisementDeleteResponseSchema,
        400: ErrorResponseSchema,
        401: MessageResponseSchema,
        403: ErrorResponseSchema,
        404: z.string(),
      },
    },
    getPrices: {
      method: "GET",
      path: "/getPrices",
      responses: { 200: z.array(AdPriceSchema), 400: ErrorResponseSchema },
    },
    addPrice: {
      method: "POST",
      path: "/addPrice",
      body: AnySchema,
      responses: {
        201: AdPriceSchema,
        400: z.object({
          message: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    updatePrice: {
      method: "PUT",
      path: "/updatePrice/:id",
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
    deletePrice: {
      method: "DELETE",
      path: "/deletePrice/:id",
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
    pricing: {
      method: "GET",
      path: "/pricing",
      responses: {
        200: z.array(SegmentPricingSchema),
        400: MessageResponseSchema,
      },
    },
    getSegmentPrices: {
      method: "GET",
      path: "/getSegmentPrices",
      responses: {
        200: z.array(SegmentPriceSchema),
        400: ErrorResponseSchema,
      },
    },
    updateSegmentPrice: {
      method: "PUT",
      path: "/updateSegmentPrice/:segmentId",
      pathParams: z.object({ segmentId: z.string() }),
      body: AnySchema,
      responses: {
        200: SegmentPriceSchema,
        400: ErrorResponseSchema,
        403: MessageResponseSchema,
      },
    },
    deleteSegmentPrice: {
      method: "DELETE",
      path: "/deleteSegmentPrice/:segmentId",
      pathParams: z.object({ segmentId: z.string() }),
      body: AnySchema,
      responses: {
        200: MessageResponseSchema,
        400: ErrorResponseSchema,
        403: MessageResponseSchema,
      },
    },
  },
  {
    pathPrefix: "/advertisement",
  },
);

export const communityApiContracts = c.router({
  comment: commentApiContracts,
  interact: commentInteractionApiContracts,
  advertisement: advertisementApiContracts,
  community: c.router(
    {
      createCollaborator: {
        method: "POST",
        path: "/create/collaborator",
        body: AnySchema,
        responses: { 200: ProposalMembershipSchema, 400: ErrorResponseSchema },
      },
      getCollaborators: {
        method: "GET",
        path: "/collaborators/getAll/:proposalId",
        pathParams: z.object({ proposalId: z.string() }),
        responses: {
          200: z.array(ProposalMembershipSchema),
          400: ErrorResponseSchema,
        },
      },
      createVolunteer: {
        method: "POST",
        path: "/create/volunteer",
        body: AnySchema,
        responses: { 200: ProposalMembershipSchema, 400: ErrorResponseSchema },
      },
      getVolunteers: {
        method: "GET",
        path: "/volunteers/getAll/:proposalId",
        pathParams: z.object({ proposalId: z.string() }),
        responses: {
          200: z.array(ProposalMembershipSchema),
          400: ErrorResponseSchema,
        },
      },
      createDonor: {
        method: "POST",
        path: "/create/donor",
        body: AnySchema,
        responses: { 200: ProposalMembershipSchema, 400: ErrorResponseSchema },
      },
      getDonors: {
        method: "GET",
        path: "/donors/getAll/:proposalId",
        pathParams: z.object({ proposalId: z.string() }),
        responses: {
          200: z.array(ProposalMembershipSchema),
          400: ErrorResponseSchema,
        },
      },
    },
    {
      pathPrefix: "/community",
    },
  ),
  category: c.router(
    {
      get: {
        method: "GET",
        path: "/",
        responses: { 200: RouteResponseSchema, 400: ErrorResponseSchema },
      },
      getAll: {
        method: "GET",
        path: "/getall",
        responses: { 200: z.array(CategorySchema), 400: ErrorResponseSchema },
      },
      getById: {
        method: "GET",
        path: "/get/:categoryId",
        pathParams: z.object({ categoryId: z.string() }),
        responses: { 200: CategorySchema, 400: ErrorResponseSchema },
      },
    },
    {
      pathPrefix: "/category",
    },
  ),
  blogRoot: {
    method: "GET",
    path: "/blog/",
    responses: { 200: RouteResponseSchema, 400: ErrorResponseSchema },
  },
});
