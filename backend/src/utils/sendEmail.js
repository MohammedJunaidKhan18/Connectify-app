// import nodemailer from "nodemailer";
// import "dotenv/config.js";

// // Create reusable transporter
// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   secure: false, // use true only for port 465
//   auth: {
//     user: process.env.SMTP_USER, // Brevo sender email
//     pass: process.env.SMTP_PASS, // Brevo SMTP key
//   },
// });

// // Verify SMTP connection on startup
// transporter.verify((error, success) => {
//   if (error) {
//     console.error(" SMTP Connection Error:", error);
//   } else {
//     console.log(" Server is ready to send emails!");
//   }
// });

// // Function to send email
// export const sendEmail = async (to, subject, html) => {
//   const mailOptions = {
//     from: `"Connectify" <${process.env.SMTP_USER}>`,
//     to,
//     subject,
//     html,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(` Email sent successfully to: ${to}`);
//   } catch (error) {
//     console.error(" Email sending failed:", error.message);
//     throw error;
//   }
// };

// export default transporter;



import Brevo from "@getbrevo/brevo";
import "dotenv/config.js";

const brevoClient = new Brevo.TransactionalEmailsApi();
brevoClient.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendEmail = async (to, subject, html) => {
  const emailData = {
    sender: { email: process.env.SMTP_USER, name: "Connectify" },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
  };

  try {
    const response = await brevoClient.sendTransacEmail(emailData);
    console.log(" Email sent successfully:", response.messageId);
  } catch (error) {
    console.error(" Email sending failed:", error.response?.body || error);
    throw error;
  }
};
