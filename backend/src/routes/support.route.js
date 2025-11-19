// import express from "express";
// import nodemailer from "nodemailer";

// const router = express.Router();

// router.post("/", async (req, res) => {
//   const { email, username, message, rating } = req.body;

//   try {
//     // Brevo SMTP Transport
//     const transporter = nodemailer.createTransport({
//       host: "smtp-relay.brevo.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     //  Generate stars for rating
//     const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

//     //  FULL HTML EMAIL TEMPLATE
//     const html = `
// <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f7; padding: 20px;">
//   <table align="center" width="100%" style="max-width: 650px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">

//     <!-- Header With Gradient Logo -->
//     <tr>
//           <td style="background: black; padding: 20px; text-align: center; color: white; font-size: 24px; font-weight: bold;">
//             Connectify
//           </td>
//         </tr>

//     <!-- Title -->
//     <tr>
//       <td style="padding: 20px; text-align: center;">
//         <h2 style="margin: 0; font-size: 22px; color: #111;">New Support / Feedback Submission</h2>
//       </td>
//     </tr>

//     <!-- Content -->
//     <tr>
//       <td style="padding: 20px 30px; font-size: 16px; color: #333;">

//         <p style="margin: 0 0 15px;"><strong>Email:</strong> ${email}</p>
//         <p style="margin: 0 0 15px;"><strong>Username:</strong> ${username}</p>

//         <p style="margin: 0 0 8px;"><strong>Message:</strong></p>

//         <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-bottom: 20px; line-height: 1.5;">
//           ${message}
//         </div>

//         <p><strong>Rating:</strong></p>
//         <div style="font-size: 24px; color: #fbbf24; margin-bottom: 10px;">
//           ${stars}
//         </div>

//       </td>
//     </tr>

//     <!-- Footer -->
//     <tr>
//       <td style="background: #f4f4f7; color: #777; font-size: 13px; text-align: center; padding: 15px;">
//         © 2025 Connectify — Support Team
//       </td>
//     </tr>

//   </table>
// </div>
// `;

//     // Send the styled email
//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: process.env.SENDER_EMAIL,
//       replyTo: email,
//       subject: `Support Feedback from ${username}`,
//       html,
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Support email error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;






import express from "express";
import { sendEmail } from "../utils/sendEmail.js";  // your working file

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, username, message, rating } = req.body;

    if (!email || !username || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    const html = `
<div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f7; padding: 20px;">
  <table align="center" width="100%" style="max-width: 650px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">

    <tr>
      <td style="background: black; padding: 20px; text-align: center; color: white; font-size: 24px; font-weight: bold;">
        Connectify
      </td>
    </tr>

    <tr>
      <td style="padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; color: #111;">New Support / Feedback Submission</h2>
      </td>
    </tr>

    <tr>
      <td style="padding: 20px 30px; font-size: 16px; color: #333;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Username:</strong> ${username}</p>

        <p style="margin-top: 15px;"><strong>Message:</strong></p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; line-height: 1.5;">
          ${message}
        </div>

        <p style="margin-top: 20px;"><strong>Rating:</strong></p>
        <div style="font-size: 24px; color: #fbbf24;">${stars}</div>
      </td>
    </tr>

    <tr>
      <td style="background: #f4f4f7; color: #777; font-size: 13px; text-align: center; padding: 15px;">
        © 2025 Connectify — Support Team
      </td>
    </tr>

  </table>
</div>
`;

    // Send using your sendEmail.js
    await sendEmail(
      process.env.SUPPORT_RECEIVER || process.env.SENDER_EMAIL, 
      `Support Feedback from ${username}`,
      html
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Support Email Error:", err);
    res.status(500).json({ error: "Failed to send support message" });
  }
});

export default router;

