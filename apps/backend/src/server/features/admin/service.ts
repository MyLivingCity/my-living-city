import { prisma } from "src/prisma/client";
import { Prisma } from "#prisma/client";

// auth
const authorizeUser = async (u: string) => {
  const foundUser = await prisma.user.findUnique({
    where: { id: u },
  });
  const isUserAdmin =
    foundUser?.userType === "SUPER_ADMIN" || foundUser?.userType === "ADMIN";

  return isUserAdmin;
};
// ----------------------------------------------------------------------------
// dashboard
// ----------------------------------------------------------------------------
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
// report
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
// ----------------------------------------------------------------------------
// threshhold
// ----------------------------------------------------------------------------
const fetchBanThreshold = async () => {
  return await prisma.threshhold.findUnique({
    where: { id: 1 },
  });
};
// ----------------------------------------------------------------------------
const updateBanThresholdValue = async (newThreshold: number) => {
  return await prisma.threshhold.update({
    where: { id: 1 },
    data: { number: newThreshold },
  });
};
// ----------------------------------------------------------------------------
/**
 * Sets all ban thresholds in case the table is unseeded
 * @param value: the threshold
 * @returns
 */
const seedInitialThresholds = async (
  value: number,
): Promise<Prisma.BatchPayload> => {
  return await prisma.threshhold.createMany({
    data: [
      { number: value }, //ID 1
      { number: value }, //ID 2
      { number: value }, //ID 3
    ],
  });
};
// ----------------------------------------------------------------------------
const fetchFalseFlagThreshold = async () => {
  return await prisma.threshhold.findUnique({
    where: { id: 2 },
  });
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
  return await prisma.threshhold.findUnique({
    where: { id: 3 },
  });
};
// ----------------------------------------------------------------------------
const updateBadPostingThresholdValue = async (newThreshold: number) => {
  return await prisma.threshhold.update({
    where: { id: 3 },
    data: { number: newThreshold },
  });
};
// ----------------------------------------------------------------------------
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
  updateBanThresholdValue,
  seedInitialThresholds,
  fetchFalseFlagThreshold,
  updateFalseFlagThresholdValue,
  fetchBadPostingThreshold,
  updateBadPostingThresholdValue,
};
