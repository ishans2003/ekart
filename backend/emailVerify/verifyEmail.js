import { createMailTransport } from "./createMailTransport.js";

export const verifyEmail = async (token, email) => {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const transporter = await createMailTransport();
  const mailConfigurations = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Email Verification",

    // This would be the text of email body
    text: `Hi! There, You have recently visited 
           our website and entered your email.
           Please follow the given link to verify your email
           ${frontendUrl}/verify/${token}
           Thanks`,
  };
  await transporter.sendMail(mailConfigurations);
  console.log("Verification email sent successfully");
};
