import { createMailTransport } from "./createMailTransport.js";

export const sendOTPMail = async (otp, email) => {
  const transporter = await createMailTransport();

  const mailConfigurations = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "OTP for Password Reset",

    // This would be the text of email body
    text: `Hi! There, You have recently requested a password reset.
Please use the following OTP to reset your password:
${otp}
This OTP will expire in 10 minutes.
Thanks`,
  };

  const info = await transporter.sendMail(mailConfigurations);
  console.log("Email sent successfully");
  return info;
};
