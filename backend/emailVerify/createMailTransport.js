import nodemailer from "nodemailer";
import { lookup } from "node:dns/promises";

export const createMailTransport = async () => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("MAIL_USER and MAIL_PASS must be configured to send email.");
  }

  const { address: smtpIpv4 } = await lookup("smtp.gmail.com", { family: 4 });
  return nodemailer.createTransport({
    host: smtpIpv4,
    port: 587,
    secure: false,
    requireTLS: true,
    tls: { servername: "smtp.gmail.com" },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};
