import { initContract } from "@ts-rest/core";
import z from "zod";
import { UserSchema } from "./users";
import { ErrorResponseSchema, SimpleMessageResponseSchema } from "../common";

const c = initContract();

const MembershipStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
const PrivacyFieldSchema = z.enum(["PUBLIC", "PRIVATE", "TEST"]);
const TypeFieldSchema = z.enum(["VIRTUAL", "NESTED"]);

const ManagerErrorResponseSchema = z.object({
  message: z.string(),
  details: z.object({
    error: z.string(),
    errorStack: z.string(),
  }),
});

const SegmentReferenceSchema = z.object({
  name: z.string(),
});

const FullUserSchema = z.object({}).passthrough();

const SubGroupUserSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  organizationName: z.string().nullable(),
  fname: z.string().nullable(),
  lname: z.string().nullable(),
  userType: z.string(),
});

const ManagedSubGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  privacyField: PrivacyFieldSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  managerId: z.string(),
  regionId: z.number().nullable(),
  segmentId: z.number().nullable(),
  subSegmentId: z.number().nullable(),
  typeField: TypeFieldSchema,
  isPrivate: z.boolean(),
  isVirtual: z.boolean(),
});

const BaseSubGroupSchema = ManagedSubGroupSchema.extend({
  region: z.never().optional(),
  segment: z.never().optional(),
  subSegment: z.never().optional(),
}).omit({
  region: true,
  segment: true,
  subSegment: true,
});

const ManagedSubGroupWithRelationsSchema = BaseSubGroupSchema.extend({
  region: SegmentReferenceSchema.nullable(),
  segment: SegmentReferenceSchema.nullable(),
  subSegment: SegmentReferenceSchema.nullable(),
});

const FullSubGroupSchema = ManagedSubGroupWithRelationsSchema.extend({
  manager: z.object({
    id: z.string(),
    email: z.string(),
    adminmodEmail: z.string().nullable(),
    fname: z.string().nullable(),
    lname: z.string().nullable(),
  }),
});

const SubGroupMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subGroupId: z.string(),
  status: MembershipStatusSchema,
  joinedAt: z.date(),
  updatedAt: z.date(),
});

const SubGroupMemberWithUserSummarySchema = SubGroupMemberSchema.extend({
  user: SubGroupUserSummarySchema,
});

const SubGroupMemberWithUserSchema = SubGroupMemberSchema.extend({
  user: UserSchema,
});

const CreateSubGroupSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  typeField: TypeFieldSchema,
  privacyField: PrivacyFieldSchema,
  regionId: z.number().nullable().optional(),
  segmentId: z.number().nullable().optional(),
  subSegmentId: z.number().nullable().optional(),
  managerId: z.string(),
});

const UpdateSubGroupSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    typeField: TypeFieldSchema.optional(),
    privacyField: PrivacyFieldSchema.optional(),
  })
  .partial();

const subgroupsContracts = c.router(
  {
    getIsSubGroupManager: {
      method: "GET",
      path: "/isSubGroupManager",
      responses: {
        200: z.object({ isSubGroupManager: z.boolean() }),
        500: ManagerErrorResponseSchema,
      },
    },
    getManagedSubgroups: {
      method: "GET",
      path: "",
      responses: {
        200: z.array(ManagedSubGroupWithRelationsSchema),
        204: z.object({
          message: z.string(),
          data: z.array(z.never()),
        }),
        500: ManagerErrorResponseSchema,
      },
    },
    getSubgroupUsers: {
      method: "GET",
      path: "/:subGroupId/users",
      pathParams: z.object({
        subGroupId: z.string(),
      }),
      responses: {
        200: z.array(SubGroupMemberWithUserSummarySchema),
        400: ManagerErrorResponseSchema,
      },
    },
    getUsersNotInSubGroup: {
      method: "GET",
      path: "/:subGroupId/users/notInSubGroup",
      pathParams: z.object({
        subGroupId: z.string(),
      }),
      responses: {
        200: z.array(SubGroupUserSummarySchema),
        400: ManagerErrorResponseSchema,
      },
    },
    addUserToSubGroup: {
      method: "POST",
      path: "/:subGroupId/users/:userId",
      pathParams: z.object({
        subGroupId: z.string(),
        userId: z.string(),
      }),
      body: z.undefined(),
      responses: {
        201: z.object({
          message: z.string(),
          data: SubGroupMemberSchema.extend({
            user: FullUserSchema,
            subGroup: BaseSubGroupSchema,
          }),
          email: z.string(),
          subGroupName: z.string(),
        }),
        400: z.union([SimpleMessageResponseSchema, ManagerErrorResponseSchema]),
        404: SimpleMessageResponseSchema,
      },
    },
    updateUserRequestInSubGroup: {
      method: "PATCH",
      path: "/:subGroupId/users/:userId",
      pathParams: z.object({
        subGroupId: z.string(),
        userId: z.string(),
      }),
      body: z.object({
        action: MembershipStatusSchema,
      }),
      responses: {
        200: z.object({
          message: z.string(),
          data: SubGroupMemberWithUserSchema,
          email: z.string(),
        }),
        400: z.union([SimpleMessageResponseSchema, ManagerErrorResponseSchema]),
        404: SimpleMessageResponseSchema,
      },
    },
    removeUserFromSubGroup: {
      method: "DELETE",
      path: "/:subGroupId/users/:userId",
      pathParams: z.object({
        subGroupId: z.string(),
        userId: z.string(),
      }),
      responses: {
        200: z.object({
          message: z.string(),
          data: z.object({
            count: z.number(),
          }),
        }),
        400: ManagerErrorResponseSchema,
        404: SimpleMessageResponseSchema,
      },
    },
    removeRejectedRequestFromSubGroup: {
      method: "DELETE",
      path: "/:subGroupId/users/rejected/:userId",
      pathParams: z.object({
        subGroupId: z.string(),
        userId: z.string(),
      }),
      responses: {
        200: z.object({
          message: z.string(),
          data: SubGroupMemberSchema,
        }),
        400: ManagerErrorResponseSchema,
        404: SimpleMessageResponseSchema,
      },
    },
  },
  {
    pathPrefix: "/subGroups",
  },
);

const singularSubgroupContracts = c.router(
  {
    getAllSubgroups: {
      method: "GET",
      path: "/getAll",
      responses: {
        200: z.array(FullSubGroupSchema),
        400: ErrorResponseSchema,
      },
    },
    getSubgroupsByName: {
      method: "GET",
      path: "/getByName/:name",
      pathParams: z.object({
        name: z.string(),
      }),
      responses: {
        200: z.array(BaseSubGroupSchema),
        400: ErrorResponseSchema,
        404: SimpleMessageResponseSchema,
      },
    },
    createSubgroup: {
      method: "POST",
      path: "/create",
      body: CreateSubGroupSchema,
      responses: {
        201: BaseSubGroupSchema.extend({
          manager: FullUserSchema,
        }),
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
    },
    deleteSubgroup: {
      method: "DELETE",
      path: "/delete/:subGroupId",
      pathParams: z.object({
        subGroupId: z.string(),
      }),
      responses: {
        204: z.undefined(),
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: SimpleMessageResponseSchema,
      },
    },
    updateSubgroup: {
      method: "PATCH",
      path: "/update/:subGroupId",
      pathParams: z.object({
        subGroupId: z.string(),
      }),
      body: UpdateSubGroupSchema,
      responses: {
        200: FullSubGroupSchema,
        400: z.union([SimpleMessageResponseSchema, ErrorResponseSchema]),
        403: ErrorResponseSchema,
        404: SimpleMessageResponseSchema,
      },
    },
    getEligibleManagers: {
      method: "GET",
      path: "/eligibleManagers",
      responses: {
        200: z.array(
          z.object({
            id: z.string(),
            email: z.string(),
            adminmodEmail: z.string().nullable(),
            fname: z.string().nullable(),
            lname: z.string().nullable(),
          }),
        ),
        500: z.object({
          message: z.string(),
          details: z.string(),
        }),
      },
    },
  },
  {
    pathPrefix: "/subgroup",
  },
);

const subgroupRequestContracts = c.router(
  {
    getAllRequests: {
      method: "GET",
      path: "/getAllRequest/:userId",
      pathParams: z.object({
        userId: z.string(),
      }),
      responses: {
        200: z.array(
          z.object({
            id: z.string(),
            subGroup: z.object({
              name: z.string(),
            }),
            status: MembershipStatusSchema,
            joinedAt: z.date(),
          }),
        ),
        400: SimpleMessageResponseSchema,
        500: SimpleMessageResponseSchema,
      },
    },
    createRequest: {
      method: "POST",
      path: "/createRequest/:userId/:subGroupId",
      pathParams: z.object({
        userId: z.string(),
        subGroupId: z.string(),
      }),
      body: z.undefined(),
      responses: {
        200: SubGroupMemberSchema,
        400: SimpleMessageResponseSchema,
        409: SimpleMessageResponseSchema,
        500: SimpleMessageResponseSchema,
      },
    },
  },
  {
    pathPrefix: "/subgroupRequest",
  },
);

export const subgroupApiContracts = c.router({
  subgroups: subgroupsContracts,
  subgroup: singularSubgroupContracts,
  subgroupRequest: subgroupRequestContracts,
  getPublicSubgroups: {
    method: "GET",
    path: "/publicSubgroup/:userId",
    pathParams: z.object({
      userId: z.string(),
    }),
    responses: {
      200: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          region: SegmentReferenceSchema.nullable(),
          segment: SegmentReferenceSchema.nullable(),
          subSegment: SegmentReferenceSchema.nullable(),
          description: z.string().nullable(),
        }),
      ),
      400: SimpleMessageResponseSchema,
      500: SimpleMessageResponseSchema,
    },
  },
});
