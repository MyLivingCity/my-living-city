import { prisma } from "src/prisma/client";

// auth
const authorizeUser = async (u: string) => {
  const foundUser = await prisma.user.findUnique({
    where: { id: u },
  });
  const isUserAdmin =
    foundUser?.userType === "SUPER_ADMIN" || foundUser?.userType === "ADMIN";

  return isUserAdmin;
};

// dashboard
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
};
