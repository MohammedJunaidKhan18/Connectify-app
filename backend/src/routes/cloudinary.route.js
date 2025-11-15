import express from "express";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

router.post("/signature", async (req, res) => {
  try {
    const { folder = "avatars" } = req.body;

    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to generate signature" });
  }
});

export default router;
