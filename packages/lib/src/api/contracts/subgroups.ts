import { initContract } from "@ts-rest/core";
import z from "zod";
import { UserSchema } from "./users";
import { SimpleMessageResponseSchema } from "../common";

const c = initContract();

const MembershipStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
const PrivacyFieldSchema = z.enum(["PUBLIC", "PRIVATE", "TEST"]);
const TypeFieldSchema = z.enum(["VIRTUAL", "NESTED"]);

const ErrorDetailsSchema = z.object({
  error: z.string(),
  errorStack: z.string(),
});

const ErrorResponseSchema = z.object({
  message: z.string(),
  details: ErrorDetailsSchema,
});

const SegmentReferenceSchema = z.object({
  name: z.string(),
});

const SubGroupSchema = z.object({
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

const ManagedSubGroupSchema = SubGroupSchema.extend({
  region: SegmentReferenceSchema.nullable(),
  segment: SegmentReferenceSchema.nullable(),
  subSegment: SegmentReferenceSchema.nullable(),
});

const SubGroupMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subGroupId: z.string(),
  status: MembershipStatusSchema,
  joinedAt: z.date(),
  updatedAt: z.date(),
});

const SubGroupUserSummarySchema = UserSchema.pick({
  id: true,
  email: true,
  organizationName: true,
  fname: true,
  lname: true,
  userType: true,
});

const SubGroupMemberWithUserSummarySchema = SubGroupMemberSchema.extend({
  user: SubGroupUserSummarySchema,
});

const SubGroupMemberWithUserSchema = SubGroupMemberSchema.extend({
  user: UserSchema,
});

const AddSubGroupMemberResponseSchema = z.object({
  message: z.string(),
  data: SubGroupMemberSchema.extend({
    user: UserSchema,
    subGroup: SubGroupSchema,
  }),
  email: z.string(),
  subGroupName: z.string(),
});

const UpdateSubGroupMemberResponseSchema = z.object({
  message: z.string(),
  data: SubGroupMemberWithUserSchema,
  email: z.string(),
});

const DeleteResultSchema = z.object({
  count: z.number(),
});

export const subgroupApiContracts = c.router(
  {
    getIsSubGroupManager: {
      method: "GET",
      path: "/isSubGroupManager",
      responses: {
        200: z.object({
          isSubGroupManager: z.boolean(),
        }),
        500: ErrorResponseSchema,
      },
      summary: "Get if the user is a subgroup manager",
    },
    getManagedSubgroups: {
      method: "GET",
      path: "/",
      responses: {
        200: z.array(ManagedSubGroupSchema),
        204: z.object({
          message: z.string(),
          data: z.array(z.never()),
        }),
        500: ErrorResponseSchema,
      },
      summary: "Get subgroups managed by the current user",
    },
    getSubgroupUsers: {
      method: "GET",
      path: "/:subGroupId/users",
      pathParams: z.object({
        subGroupId: z.string(),
      }),
      responses: {
        200: z.array(SubGroupMemberWithUserSummarySchema),
        400: ErrorResponseSchema,
      },
      summary: "Get users in a specific subgroup",
    },
    getUsersNotInSubGroup: {
      method: "GET",
      path: "/:subGroupId/users/notInSubGroup",
      pathParams: z.object({
        subGroupId: z.string(),
      }),
      responses: {
        200: z.array(SubGroupUserSummarySchema),
        400: ErrorResponseSchema,
      },
      summary: "Get users who are not in a specific subgroup",
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
        201: AddSubGroupMemberResponseSchema,
        400: SimpleMessageResponseSchema.or(ErrorResponseSchema),
        404: SimpleMessageResponseSchema,
      },
      summary: "Add a user to a subgroup",
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
        200: UpdateSubGroupMemberResponseSchema,
        400: SimpleMessageResponseSchema.or(ErrorResponseSchema),
        404: SimpleMessageResponseSchema,
      },
      summary: "Update a user's subgroup membership status",
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
          data: DeleteResultSchema,
        }),
        400: ErrorResponseSchema,
        404: SimpleMessageResponseSchema,
      },
      summary: "Remove a user from a subgroup",
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
        400: ErrorResponseSchema,
        404: SimpleMessageResponseSchema,
      },
      summary: "Remove a rejected subgroup membership request",
    },
  },
  {
    pathPrefix: "/subgroups",
  },
);
