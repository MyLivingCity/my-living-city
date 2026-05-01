import jwt from "jsonwebtoken";
import { Request } from "express";
import { prisma } from "src/prisma/client";
import { env } from "src/lib/env";

export const PROFILE_VISIBILITY = {
  PUBLIC: "PUBLIC",
  COMMUNITY_MEMBERS: "COMMUNITY_MEMBERS",
  CONTACTS_ONLY: "CONTACTS_ONLY",
  PRIVATE: "PRIVATE",
} as const;

export type ProfileVisibility =
  (typeof PROFILE_VISIBILITY)[keyof typeof PROFILE_VISIBILITY];

const PRIVILEGED_USER_TYPES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "MOD",
  "SEG_ADMIN",
  "SEG_MOD",
  "MUNICIPAL",
  "MUNICIPAL_SEG_ADMIN",
]);

export type Viewer = { id: string; userType: string } | null;

export const isPrivilegedViewer = (viewer: Viewer): boolean => {
  return !!viewer && PRIVILEGED_USER_TYPES.has(viewer.userType);
};

export const getViewerFromRequest = async (req: Request): Promise<Viewer> => {
  const token = req.header("x-auth-token");
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      user?: { id?: string };
    };
    const userId = decoded.user?.id;
    if (!userId) return null;

    const viewer = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, userType: true },
    });
    return viewer || null;
  } catch {
    return null;
  }
};

export const hasSharedApprovedSubgroupMembership = async (
  viewerId: string,
  ownerId: string,
): Promise<boolean> => {
  if (!viewerId || !ownerId) return false;

  const [viewerMemberships, ownerMemberships] = await Promise.all([
    prisma.subGroupMember.findMany({
      where: { userId: viewerId, status: "APPROVED" },
      select: { subGroupId: true },
    }),
    prisma.subGroupMember.findMany({
      where: { userId: ownerId, status: "APPROVED" },
      select: { subGroupId: true },
    }),
  ]);

  if (!viewerMemberships.length || !ownerMemberships.length) return false;

  const viewerSubgroups = new Set(viewerMemberships.map((m) => m.subGroupId));
  return ownerMemberships.some((m) => viewerSubgroups.has(m.subGroupId));
};

export const canViewResidentialProfile = async ({
  viewer,
  ownerId,
  visibility,
}: {
  viewer: Viewer;
  ownerId: string;
  visibility: ProfileVisibility | null | undefined;
}): Promise<boolean> => {
  const effectiveVisibility = visibility || PROFILE_VISIBILITY.PUBLIC;

  if (!ownerId) return false;
  if (viewer?.id === ownerId || isPrivilegedViewer(viewer)) return true;
  if (effectiveVisibility === PROFILE_VISIBILITY.PUBLIC) return true;
  if (!viewer) return false;
  if (effectiveVisibility === PROFILE_VISIBILITY.PRIVATE) return false;

  if (effectiveVisibility === PROFILE_VISIBILITY.COMMUNITY_MEMBERS) {
    return hasSharedApprovedSubgroupMembership(viewer.id, ownerId);
  }

  // CONTACTS_ONLY: not yet modelled in this codebase.
  return false;
};

export const computeDisplayName = (user: {
  displayFName?: string | null;
  displayLName?: string | null;
  fname?: string | null;
  lname?: string | null;
}): string => {
  const first =
    user.displayFName && user.displayFName.trim()
      ? user.displayFName
      : user.fname ?? "";
  const last =
    user.displayLName && user.displayLName.trim()
      ? user.displayLName
      : user.lname ?? "";
  return `${first}@${last}`;
};
