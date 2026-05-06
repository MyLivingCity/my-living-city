import { prisma } from "src/prisma/client";
import { env } from "src/lib/env";
// ============================================================================
// auth
// ============================================================================
/**
 * Primitive auth: checks if userType is "SUPER_ADMIN" or "ADMIN"
 * @param u: userId
 * @returns: Error if user not found or not admin
 */
const authorizeUser = async (u: string) => {
  const AUTHORIZED = ["ADMIN", "SUPER_ADMIN"];

  const foundUser = await prisma.user.findUnique({
    where: { id: u },
    select: { userType: true }, // Performance: only fetch the column you need
  });

  if (!foundUser) throw new Error("User not found");

  if (!AUTHORIZED.includes(foundUser.userType))
    throw new Error("Insufficient permissions");
};
// ============================================================================
// dashboard
// ============================================================================
const fetchUnseenNotifications = async () => {
  return await prisma.quarantine_Notifications.findMany({
    where: {
      seen: false,
    },
  });
};
// ----------------------------------------------------------------------------
const dismissQuarantineNotification = async (id: number) => {
  return await prisma.quarantine_Notifications.update({
    where: { id },
    data: { seen: true },
  });
};
// ============================================================================
// report
// ============================================================================
const fetchAllReports = async () => {
  return await prisma.report.findMany();
};
// ----------------------------------------------------------------------------
const createNewReport = async (data: {
  email: string;
  description: string;
}) => {
  return await prisma.report.create({
    data: {
      email: data.email,
      description: data.description,
    },
  });
};
// ----------------------------------------------------------------------------
const deleteReportById = async (id: number) => {
  return await prisma.report.delete({
    where: { id },
  });
};
// ============================================================================
// threshhold
// ============================================================================
const THRESHOLD_DEFAULTS = [
  { id: 1, number: 3 }, // BAN: Overall
  { id: 2, number: 3 }, // FALSE_FLAG: Improper reporting
  { id: 3, number: 3 }, // BAD_POST: Offensive/improper posting
];
/**
 * Sets all unset ban thresholds in case the Threshhold table is unseeded
 * @param value: the threshold
 * @returns
 */
const seedThresholds = async () => {
  return await Promise.all(
    THRESHOLD_DEFAULTS.map((data) =>
      prisma.threshhold.upsert({
        where: { id: data.id },
        update: {}, // Don't overwrite if they already exist
        create: data, // Force ID 1, 2, or 3
      }),
    ),
  );
};
// ----------------------------------------------------------------------------
const fetchBanThreshold = async () => {
  let val = await prisma.threshhold.findUnique({ where: { id: 1 } });

  // 2. If missing, seed it
  if (!val) {
    await seedThresholds();
    val = await prisma.threshhold.findUnique({ where: { id: 1 } });
  }
  if (!val) {
    throw new Error("Unable to set ban threshold");
  }

  return val;
};
// ----------------------------------------------------------------------------
const updateBanThreshold = async (newThreshold: number) => {
  return await prisma.threshhold.update({
    where: { id: 1 },
    data: { number: newThreshold },
  });
};
// ----------------------------------------------------------------------------
const fetchFalseFlagThreshold = async () => {
  let val = await prisma.threshhold.findUnique({ where: { id: 2 } });

  // 2. If missing, seed it
  if (!val) {
    await seedThresholds();
    val = await prisma.threshhold.findUnique({ where: { id: 2 } });
  }
  if (!val) {
    throw new Error("Unable to set false flag threshold");
  }

  return val;
};
// ----------------------------------------------------------------------------
const updateFalseFlagThresholdValue = async (newThreshold: number) => {
  return await prisma.threshhold.update({
    where: { id: 2 },
    data: { number: newThreshold },
  });
};
// ----------------------------------------------------------------------------
const fetchBadPostingThreshold = async () => {
  let val = await prisma.threshhold.findUnique({ where: { id: 3 } });

  // 2. If missing, seed it
  if (!val) {
    await seedThresholds();
    val = await prisma.threshhold.findUnique({ where: { id: 3 } });
  }
  if (!val) {
    throw new Error("Unable to set bad posting threshold");
  }

  return val;
};
// ----------------------------------------------------------------------------
const updateBadPostingThresholdValue = async (newThreshold: number) => {
  return await prisma.threshhold.update({
    where: { id: 3 },
    data: { number: newThreshold },
  });
};
// ----------------------------------------------------------------------------
const verifyUserEmail = async (userId: string, verificationCode: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, verifiedToken: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.verifiedToken !== verificationCode) {
    throw new Error("Invalid verification code");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { verified: true },
  });

  const corsOrigin = env.CORS_ORIGIN || "http://localhost:3000";
  return {
    redirectUrl: `${corsOrigin}/login`,
  };
};
export {
  //auth
  authorizeUser,
  //dashboard
  fetchUnseenNotifications,
  dismissQuarantineNotification,
  // report
  fetchAllReports,
  createNewReport,
  deleteReportById,
  //threshhold
  fetchBanThreshold,
  updateBanThreshold,
  seedThresholds,
  fetchFalseFlagThreshold,
  updateFalseFlagThresholdValue,
  fetchBadPostingThreshold,
  updateBadPostingThresholdValue,
  //email
  verifyUserEmail,
};
