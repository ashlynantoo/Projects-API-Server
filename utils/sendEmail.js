require("dotenv").config();
const sgMail = require("@sendgrid/mail");

const sendVerificationEmail = async (
  userName,
  userEmail,
  verificationToken,
  origin
) => {
  const verificationLink = `${origin}/user/verify-email?token=${verificationToken}&email=${userEmail}`;
  const subject = "Activate your Comfy Store account";
  const content = `<p>Hi ${userName},</p>
                   <p>Thank you for signing up for Comfy Store. <a href="${verificationLink}">Click Here</a> to verify your email.</p>
                   <p>If you did not sign up for Comfy Store account, you can safely ignore this email.</p>
                   <p>Thanks,</p>
                   <p>The Comfy Store Team</p>`;

  sendEmail(userEmail, subject, content);
};

const sendResetPasswordEmail = async (
  userName,
  userEmail,
  passwordToken,
  origin
) => {
  const resetPasswordLink = `${origin}/user/reset-password?token=${passwordToken}&email=${userEmail}`;
  const subject = "Reset the password of your Comfy Store account";

  const content = `<p>Hi ${userName},</p>
                   <p><a href="${resetPasswordLink}">Click Here</a> to reset your password.</p>
                   <p>The above link will expire in 24 hours. If you do not want to reset the password, you can safely ignore this email.</p>
                   <p>Thanks,</p>
                   <p>The Comfy Store Team</p>`;

  sendEmail(userEmail, subject, content);
};

const sendEmail = async (userEmail, subject, content) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: userEmail, // recipient
    from: "ashlynantoo@gmail.com", // verified sender
    subject: subject,
    html: content,
  };

  sgMail.send(msg);
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
