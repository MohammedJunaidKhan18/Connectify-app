import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequest,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  unfriendUser,
} from "../controllers/user.controller.js";
import User from "../models/User.js";

const router = express.Router();

router.use(protectRoute);

// recommended / friends
router.get("/connect", getRecommendedUsers);
router.get("/friends", getMyFriends);

// friend request routes
router.post("/friend-request/:id", sendFriendRequest); // send
router.put("/friend-request/:id/accept", acceptFriendRequest); // accept
router.put("/friend-request/:id/reject", rejectFriendRequest); // reject (PUT to match frontend)
router.get("/friend-requests", getFriendRequest); // incoming + accepted notifications
router.get("/outgoing-friend-requests", getOutgoingFriendReqs); // outgoing pending

//profilepic
router.put("/update-avatar", protectRoute, async (req, res) => {
  try {
    const { url, public_id } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: url, profilePicPublicId: public_id },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update avatar" });
  }
});

router.delete("/unfriend/:id", protectRoute, unfriendUser);

//update profile
router.put("/me", async (req, res) => {
  console.log("/api/users/me route HIT with body:", req.body);

  try {
    const updates = {};

    if (req.body.fullName !== undefined) updates.fullName = req.body.fullName;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.nativeLanguage !== undefined)
      updates.nativeLanguage = req.body.nativeLanguage;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    console.log("Updated user:", updatedUser);

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
