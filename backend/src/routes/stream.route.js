import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { generateStreamToken } from "../lib/stream.js";

const router = express.Router();


router.get("/token", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const token = generateStreamToken(userId);

    if (!token) {
      return res
        .status(500)
        .json({ message: "Failed to generate Stream token" });
    }

    res.json({ token });
  } catch (err) {
    console.error("Stream token error:", err);
    res.status(500).json({ message: "Stream token error" });
  }
});

export default router;
