// NOTE: This handler requires nodemailer to be installed in the backend:
//   pnpm --filter @mlc/backend add nodemailer
//   pnpm --filter @mlc/backend add -D @types/nodemailer
import nodemailer from "nodemailer";
import { sendEmailResetApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { toErrorDetails } from "src/server/utils";

const s = initServer();

const sendReset = s.route(sendEmailResetApiContracts.sendReset, {
  handler: async ({ body }) => {
    try {
      const { email } = body;

      const foundUser = await prisma.user.findUnique({ where: { email } });

      if (!foundUser) {
        // Return success regardless to avoid user enumeration
        return {
          status: 200,
          body: { message: "If an account with that email exists, a reset email has been sent." },
        };
      }

      const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        auth: {
          user: process.env["EMAIL"],
          pass: process.env["EMAIL_PASSWORD"],
        },
      });

      const mailOptions = {
        from: process.env["EMAIL"],
        to: email,
        subject: "MyLivingCity Password Reset",
        text: `${process.env["CORS_ORIGIN"]}/user/reset-password?passCode=${foundUser.passCode}`,
      };

      await transporter.sendMail(mailOptions);

      return {
        status: 200,
        body: { message: "Sent password reset email" },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while sending the password reset email.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: sendEmailResetApiContracts,
  router: { sendReset },
});
