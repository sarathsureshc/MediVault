import nodemailer from "nodemailer";
import { config } from "../config";
import logger from "../utils/logger";

// Create a transporter. For dev, we can use Ethereal or just log it if no creds.
// For now, I'll set up a basic structure that can be configured with env vars.

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "test",
    pass: process.env.EMAIL_PASS || "test",
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    // Always send real emails if credentials are configured
    const info = await transporter.sendMail({
      from: `"MEDIVAULT" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error; // Throw error so caller knows email failed
  }
};
