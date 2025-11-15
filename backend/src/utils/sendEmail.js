import nodemailer from "nodemailer";
import "dotenv/config.js";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true, // use true only for port 465
  auth: {
    user: process.env.SMTP_USER, // Brevo sender email
    pass: process.env.SMTP_PASS, // Brevo SMTP key
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error(" SMTP Connection Error:", error);
  } else {
    console.log(" Server is ready to send emails!");
  }
});

// Function to send email
export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Connectify" <${process.env.SENDER_EMAIL}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(` Email sent successfully to: ${to}`);
  } catch (error) {
    console.error(" Email sending failed:", error.message);
    throw error;
  }
};

export default transporter;
