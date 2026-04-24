import { userApiContracts, UserSchema } from "@mlc/lib/api";
import { UserType } from "#prisma/client";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { NextFunction, Request, Response } from "express";
import * as passport from "passport";
import { prisma } from "src/prisma/client";
import { Handlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";
import { env } from "src/lib/env";
import { argon2Hash } from "src/lib/helpers";
import * as jwt from "jsonwebtoken";
import z from "zod";

const s = initServer();

const ADMIN_USER_TYPES = new Set<UserType>([
  UserType.SUPER_ADMIN,
  UserType.ADMIN,
  UserType.MOD,
  UserType.SEG_ADMIN,
  UserType.SEG_MOD,
  UserType.MUNICIPAL_SEG_ADMIN,
]);

const REGISTER_WITHOUT_AUTH_TYPES = new Set<UserType>([
  UserType.BUSINESS,
  UserType.RESIDENTIAL,
  UserType.COMMUNITY,
]);

const GET_ALL_ALLOWED_TYPES = new Set<UserType>([
  UserType.SUPER_ADMIN,
  UserType.ADMIN,
  UserType.MOD,
  UserType.MUNICIPAL_SEG_ADMIN,
  UserType.SEG_ADMIN,
]);

const GET_ALL_REGULAR_ALLOWED_TYPES = new Set<UserType>([
  UserType.SUPER_ADMIN,
  UserType.ADMIN,
  UserType.MOD,
  UserType.MUNICIPAL_SEG_ADMIN,
]);

const REGULAR_USER_EXCLUDED_TYPES = [
  UserType.SUPER_ADMIN,
  UserType.ADMIN,
  UserType.MOD,
  UserType.MUNICIPAL_SEG_ADMIN,
  UserType.SEG_ADMIN,
];

const localLoginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return passport.authenticate(
    "local",
    { session: false },
    (err: unknown, user: Express.User | false, info?: { message?: string }) => {
      if (err) {
        return res.status(400).json({
          message:
            err instanceof Error
              ? err.message
              : "An error occurred during login.",
        });
      }

      if (!user) {
        return res.status(400).json({
          message: info?.message || "Invalid credentials.",
        });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
};

const pickUserCore = <T extends { password?: string | null }>(user: T) => {
  const { password: _password, ...rest } = user;
  return rest;
};

const toContractUser = (
  user: Record<string, unknown> & {
    password?: string | null;
    imagePath?: string | null;
    address?: {
      city?: string | null;
      streetAddress?: string | null;
      postalCode?: string | null;
    } | null;
    geo?: {
      lat?: unknown;
      lon?: unknown;
    } | null;
    userReach?: unknown[];
    userSegment?: unknown[];
  },
) => {
  const core = pickUserCore(user);

  return serializeForContract({
    ...core,
    password: null,
    avatar: user.imagePath ?? undefined,
    city: user.address?.city ?? undefined,
    latitude: user.geo?.lat ?? undefined,
    longitude: user.geo?.lon ?? undefined,
    postalCode: user.address?.postalCode ?? undefined,
    streetAddress: user.address?.streetAddress ?? undefined,
    userReach: user.userReach ?? undefined,
    userSegment: user.userSegment ?? undefined,
  });
};

const toVerboseUser = (user: Record<string, unknown>) => {
  const base = toContractUser(user as Parameters<typeof toContractUser>[0]);
  const { userSegment, ...rest } = base as Record<string, unknown>;

  return serializeForContract({
    ...rest,
    address: user["address"] ?? null,
    geo: user["geo"] ?? null,
    userHandles: user["userHandles"] ?? [],
    userSegments: user["userSegment"] ?? [],
  });
};

const getAuthenticatedRequestUser = async (req: Request) => {
  const user = req.user as { id?: string } | undefined;

  if (!user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: user.id },
  });
};

const authenticateJwt = async (req: Request) => {
  return new Promise<{
    err: unknown;
    user: Express.User | false;
    info: { message?: string } | undefined;
  }>((resolve) => {
    const res = req.res as Response;

    passport.authenticate(
      "jwt",
      { session: false },
      (err: unknown, user: Express.User | false, info?: { message?: string }) =>
        resolve({ err, user, info }),
    )(req, res, (() => undefined) as NextFunction);
  });
};

const generateAdminEmail = async (userType: UserType) => {
  while (true) {
    const randomDigits = Math.floor(Math.random() * 99)
      .toString()
      .padStart(2, "0");
    const randomChars = Math.random().toString(35).slice(2, 4).toLowerCase();
    const email =
      `${userType}${randomDigits}${randomChars}@mylivingcity.org`.toLowerCase();

    const existing = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });

    if (!existing) {
      return email;
    }
  }
};

const toUserSegmentCreates = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return [];
  }

  const raw = value as Record<string, unknown>;
  const result: Array<{
    userSegmentRelationship: "HOME" | "WORK" | "SCHOOL";
    segmentId: number;
  }> = [];

  const pushIfNumber = (
    relationship: "HOME" | "WORK" | "SCHOOL",
    key: string,
  ) => {
    const segmentId = raw[key];

    if (typeof segmentId === "number" && Number.isInteger(segmentId)) {
      result.push({ userSegmentRelationship: relationship, segmentId });
    }
  };

  pushIfNumber("HOME", "homeSegmentId");
  pushIfNumber("WORK", "workSegmentId");
  pushIfNumber("SCHOOL", "schoolSegmentId");
  pushIfNumber("HOME", "homeSubSegmentId");
  pushIfNumber("WORK", "workSubSegmentId");
  pushIfNumber("SCHOOL", "schoolSubSegmentId");

  return result;
};

const toUserReachCreates = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "number" && Number.isInteger(item)) {
        return { segId: item };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const segId = record["segId"] ?? record["segmentId"];

      if (typeof segId === "number" && Number.isInteger(segId)) {
        return { segId };
      }

      return null;
    })
    .filter((item): item is { segId: number } => item !== null);
};

const hasOwnValues = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.keys(value).length > 0;
};

const getSelf = s.route(userApiContracts.getSelf, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    const { id } = req.user as { id?: string };

    if (!id) {
      return {
        status: 404,
        body: {
          message: "User could not be found or does not exist in the database.",
        },
      };
    }

    const foundUser = await prisma.user.findFirst({
      where: { id },
      omit: { password: true },
      include: {
        address: true,
        geo: true,
        userReach: true,
        userSegment: {
          include: {
            segment: true,
          },
        },
      },
    });

    if (!foundUser) {
      return {
        status: 404,
        body: {
          message: "User could not be found or does not exist in the database.",
        },
      };
    }

    return {
      status: 200,
      body: toContractUser(foundUser) as z.infer<typeof UserSchema>,
    };
  },
});

const getSelfVerbose = s.route(userApiContracts.getSelfVerbose, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    try {
      const { id } = req.user as { id?: string };

      if (!id) {
        return {
          status: 400,
          body: {
            message:
              "User could not be found or does not exist in the database.",
          },
        };
      }

      const foundUser = await prisma.user.findUnique({
        where: { id },
        include: {
          address: true,
          geo: true,
          userHandles: true,
          userSegment: {
            include: {
              segment: true,
            },
          },
        },
      });

      if (!foundUser) {
        return {
          status: 400,
          body: {
            message:
              "User could not be found or does not exist in the database.",
          },
        };
      }

      return {
        status: 200,
        body: toVerboseUser(foundUser),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch the user.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getById = s.route(userApiContracts.getById, {
  handler: async ({ params }) => {
    try {
      const foundUser = await prisma.user.findUnique({
        where: { id: params.userId },
        select: {
          email: true,
          fname: true,
          lname: true,
        },
      });

      if (!foundUser) {
        return {
          status: 400,
          body: {
            message:
              "User could not be found or does not exist in the database.",
          },
        };
      }

      return {
        status: 200,
        body: foundUser,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: error instanceof Error ? error.message : String(error),
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getByEmail = s.route(userApiContracts.getByEmail, {
  handler: async ({ params }) => {
    try {
      const foundUser = await prisma.user.findUnique({
        where: { email: params.email },
        include: {
          address: true,
          geo: true,
        },
      });

      if (!foundUser) {
        return {
          status: 201,
          body: {
            message:
              "User could not be found or does not exist in the database.",
          },
        };
      }

      return {
        status: 200,
        body: {
          foundUser: toContractUser(foundUser) as z.infer<typeof UserSchema>,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: error instanceof Error ? error.message : String(error),
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAll = s.route(userApiContracts.getAll, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    try {
      const authenticatedUser = await getAuthenticatedRequestUser(req);

      if (
        !authenticatedUser ||
        !GET_ALL_ALLOWED_TYPES.has(authenticatedUser.userType)
      ) {
        return {
          status: 401,
          body: "You are not allowed to pull all users!",
        };
      }

      const allUsers = await prisma.user.findMany({
        include: {
          address: true,
          geo: true,
          userReach: true,
          userSegment: {
            include: {
              segment: true,
            },
          },
        },
      });

      return {
        status: 200,
        body: allUsers.map((user) => toContractUser(user)),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all the users.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllRegularUsers = s.route(userApiContracts.getAllRegularUsers, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    try {
      const authenticatedUser = await getAuthenticatedRequestUser(req);

      if (
        !authenticatedUser ||
        !GET_ALL_REGULAR_ALLOWED_TYPES.has(authenticatedUser.userType)
      ) {
        return {
          status: 401,
          body: "You are not allowed to pull all users!",
        };
      }

      const allUsers = await prisma.user.findMany({
        where: {
          NOT: {
            userType: {
              in: REGULAR_USER_EXCLUDED_TYPES,
            },
          },
        },
        include: {
          address: true,
          geo: true,
          userSegment: {
            include: {
              segment: true,
            },
          },
        },
      });

      return {
        status: 200,
        body: allUsers.map((user) => toContractUser(user)),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all the users.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const register = s.route(userApiContracts.register, {
  handler: async ({ body, req }) => {
    try {
      const email =
        typeof body["email"] === "string" ? body["email"].toLowerCase() : "";
      const password =
        typeof body["password"] === "string" ? body["password"] : "";
      const confirmPassword =
        typeof body["confirmPassword"] === "string"
          ? body["confirmPassword"]
          : "";
      const userType = body["userType"] as UserType;
      const verified = Boolean(body["verified"]);

      if (!email) {
        return {
          status: 401,
          body: { message: "You must supply an email." },
        };
      }

      if (!password) {
        return {
          status: 401,
          body: { message: "You must supply a password." },
        };
      }

      if (password !== confirmPassword) {
        return {
          status: 401,
          body: {
            message:
              "Both password and password confirmation must be the same.",
          },
        };
      }

      if (!REGISTER_WITHOUT_AUTH_TYPES.has(userType) || verified) {
        const authResult = await authenticateJwt(req);

        if (authResult.err) {
          return {
            status: 500,
            body: {
              error:
                authResult.err instanceof Error
                  ? authResult.err.message
                  : "Authentication failed.",
            },
          };
        }

        if (!authResult.user) {
          return {
            status: 401,
            body: {
              message: authResult.info?.message || "User not found",
            },
          };
        }
      }

      const existing = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          verified: true,
        },
      });

      if (existing) {
        return {
          status: 401,
          body: {
            message: existing.verified
              ? "User already exists."
              : "An account with this email already exists but is not verified. Please check your email.",
          },
        };
      }

      const userSegmentCreates = toUserSegmentCreates(body["userSegment"]);
      const userReachCreates = toUserReachCreates(body["userReach"]);
      const passwordHash = await argon2Hash(password);

      const createData: any = {
        email: ADMIN_USER_TYPES.has(userType)
          ? await generateAdminEmail(userType)
          : email,
        adminmodEmail: ADMIN_USER_TYPES.has(userType) ? email : null,
        password: passwordHash,
        userType,
        verified,
        organizationName:
          typeof body["organizationName"] === "string"
            ? body["organizationName"]
            : null,
        fname: typeof body["fname"] === "string" ? body["fname"] : null,
        lname: typeof body["lname"] === "string" ? body["lname"] : null,
        imagePath:
          typeof body["imagePath"] === "string" ? body["imagePath"] : null,
        passCode:
          typeof body["passCode"] === "string" ? body["passCode"] : undefined,
        displayFName:
          typeof body["displayFName"] === "string"
            ? body["displayFName"]
            : null,
        displayLName:
          typeof body["displayLName"] === "string"
            ? body["displayLName"]
            : null,
        proposalLimit:
          typeof body["proposalLimit"] === "number"
            ? body["proposalLimit"]
            : null,
        status:
          typeof body["status"] === "boolean" ? body["status"] : undefined,
        banned:
          typeof body["banned"] === "boolean" ? body["banned"] : undefined,
        reviewed:
          typeof body["reviewed"] === "boolean" ? body["reviewed"] : undefined,
        totalFlagged:
          typeof body["totalFlagged"] === "number"
            ? body["totalFlagged"]
            : undefined,
        hasFlagged:
          typeof body["hasFlagged"] === "number"
            ? body["hasFlagged"]
            : undefined,
        verifiedToken:
          typeof body["verifiedToken"] === "string"
            ? body["verifiedToken"]
            : undefined,
        ...(hasOwnValues(body["address"])
          ? { address: { create: body["address"] as Record<string, unknown> } }
          : {}),
        ...(hasOwnValues(body["geo"])
          ? { geo: { create: body["geo"] as Record<string, unknown> } }
          : {}),
        ...(userSegmentCreates.length > 0
          ? { userSegment: { create: userSegmentCreates } }
          : {}),
        ...(userReachCreates.length > 0
          ? { userReach: { create: userReachCreates } }
          : {}),
        ...(Array.isArray(body["segmentRequest"]) &&
          body["segmentRequest"].length > 0
          ? { segmentRequest: { create: body["segmentRequest"] as [] } }
          : {}),
        ...(hasOwnValues(body["schoolDetails"])
          ? {
            School_Details: {
              create: body["schoolDetails"] as Record<string, unknown>,
            },
          }
          : {}),
        ...(hasOwnValues(body["workDetails"])
          ? {
            Work_Details: {
              create: body["workDetails"] as Record<string, unknown>,
            },
          }
          : {}),
      };

      const createdUser = await prisma.user.create({
        data: createData,
        include: {
          address: true,
          geo: true,
          userReach: true,
          userSegment: {
            include: {
              segment: true,
            },
          },
        },
      });

      const token = jwt.sign(
        {
          user: {
            id: createdUser.id,
            email: createdUser.email,
          },
        },
        env.JWT_SECRET,
        {
          expiresIn: env.JWT_EXPIRY as NonNullable<
            jwt.SignOptions["expiresIn"]
          >,
        },
      );

      return {
        status: 201,
        body: {
          user: toContractUser(createdUser) as z.infer<typeof UserSchema>,
          token,
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          error:
            error instanceof Error
              ? error.message
              : "Failed to create user in database",
        },
      };
    }
  },
});

const login = s.route(userApiContracts.login, {
  middleware: [localLoginMiddleware],
  handler: async ({ req }) => {
    const user = req.user as z.infer<typeof UserSchema>;

    if (!user?.id || !user?.email) {
      return {
        status: 400,
        body: {
          message: "Could not find authenticated user after login.",
        },
      };
    }

    const token = jwt.sign(
      { user: { id: user.id, email: user.email } },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRY as NonNullable<jwt.SignOptions["expiresIn"]>,
      },
    );

    return {
      status: 200,
      body: {
        user,
        token,
      },
    };
  },
});

const tryUnbanSelf = s.route(userApiContracts.tryUnbanSelf, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    try {
      const { id } = (req.user ?? {}) as z.infer<typeof UserSchema>;

      if (!id) {
        return {
          status: 400,
          body: {
            message: "No user",
          },
        };
      }

      const theUser = await prisma.user.findFirst({ where: { id: id } });

      if (!theUser) {
        return {
          status: 400,
          body: {
            message: "No user",
          },
        };
      }

      if (!theUser.banned) {
        return {
          status: 200,
          body: {
            message: "You are not banned",
          },
        };
      }

      const ban = await prisma.userBan.findMany({
        where: { userId: id },
        orderBy: { id: "desc" },
        distinct: ["userId"],
      });

      if (!ban.length) {
        return {
          status: 200,
          body: {
            message: "You are not banned",
          },
        };
      }

      const isExpired = ban.every((b) => b.banUntil <= new Date(Date.now()));
      if (isExpired) {
        await prisma.user.update({
          where: { id: id },
          data: {
            banned: false,
          },
        });
        await prisma.userBan.deleteMany({
          where: { userId: theUser.id },
        });

        return {
          status: 200,
          body: {
            message: "You are succesfully unbanned",
          },
        };
      }

      return {
        status: 200,
        body: {
          message: "Your ban is still ongoing",
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: "An Error occured while trying to unban.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteById = s.route(userApiContracts.deleteById, {
  handler: async ({ params }) => {
    try {
      const foundUser = await prisma.user.findUnique({
        where: { id: params.userId },
      });

      if (!foundUser) {
        return {
          status: 400,
          body: {
            message:
              "User could not be found or does not exist in the database.",
          },
        };
      }

      await prisma.$transaction([
        prisma.userAddress.deleteMany({ where: { userId: foundUser.id } }),
        prisma.userGeo.deleteMany({ where: { userId: foundUser.id } }),
        prisma.userSegments.deleteMany({ where: { userId: foundUser.id } }),
        prisma.userReach.deleteMany({ where: { userId: foundUser.id } }),
        prisma.userStripe.deleteMany({ where: { userId: foundUser.id } }),
        prisma.userHandle.deleteMany({ where: { userId: foundUser.id } }),
        prisma.userBan.deleteMany({ where: { userId: foundUser.id } }),
        prisma.school_Details.deleteMany({ where: { userId: foundUser.id } }),
        prisma.work_Details.deleteMany({ where: { userId: foundUser.id } }),
        prisma.idea.deleteMany({ where: { authorId: foundUser.id } }),
        prisma.advertisements.deleteMany({ where: { ownerId: foundUser.id } }),
        prisma.ideaRating.deleteMany({ where: { authorId: foundUser.id } }),
        prisma.userIdeaFollow.deleteMany({ where: { userId: foundUser.id } }),
        prisma.userIdeaEndorse.deleteMany({ where: { userId: foundUser.id } }),
        prisma.user.delete({ where: { id: foundUser.id } }),
      ]);

      return {
        status: 200,
        body: {
          message: "User deleted successfully.",
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message:
            error instanceof Error ? error.message : "Failed to delete user.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default {
  schema: userApiContracts,
  router: {
    deleteById,
    getAll,
    getAllRegularUsers,
    getByEmail,
    getById,
    getSelf,
    getSelfVerbose,
    login,
    register,
    tryUnbanSelf,
  },
} as unknown as Handlers;
