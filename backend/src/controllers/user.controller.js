import mongoose from "mongoose";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

// Get recommended users (not friends and not current user)
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId).select("friends");

    const recommendedUsers = await User.find({
      _id: { $ne: currentUserId, $nin: currentUser.friends },
      isOnboarded: true,
    }).select("fullName profilePic nativeLanguage bio location");

    res.status(200).json({ success: true, recommendedUsers });
  } catch (error) {
    console.error("Error in getRecommendedUsers controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get current user's friends (populated)
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage bio location");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: recipientId } = req.params;

    console.log("📩 Send Friend Request Called:");
    console.log("Sender:", senderId);
    console.log("Recipient:", recipientId);

    // ✅ Self-request check
    if (senderId.toString() === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });
    }

    // ✅ Check existing request
    let existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    });

    // ✅ If old accepted request exists → delete it
    if (existingRequest && existingRequest.status === "accepted") {
      console.log("🧹 Removing old accepted request...");
      await FriendRequest.deleteOne({ _id: existingRequest._id });
      existingRequest = null;
    }

    // ✅ Prevent duplicate pending requests
    if (existingRequest && existingRequest.status === "pending") {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // ✅ Create new request
    const newRequest = await FriendRequest.create({
      sender: senderId,
      recipient: recipientId,
    });

    console.log("✅ New friend request created:", newRequest);

    return res
      .status(200)
      .json({ message: "Friend request sent", request: newRequest });
  } catch (error) {
    console.error("❌ Error in sendFriendRequest controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept friend request
export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest)
      return res.status(404).json({ message: "Friend request not found" });

    // only recipient can accept
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    // mark accepted and add to both users' friends
    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    // remove any duplicate/past requests between them (cleanup)
    await FriendRequest.deleteMany({
      $or: [
        { sender: friendRequest.sender, recipient: friendRequest.recipient },
        { sender: friendRequest.recipient, recipient: friendRequest.sender },
      ],
      _id: { $ne: friendRequest._id }, // keep the accepted one if needed (optional)
    });

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Reject friend request
export async function rejectFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest)
      return res.status(404).json({ message: "Friend request not found" });

    // only recipient can reject
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to reject this request" });
    }

    // delete the request so the sender can send again later
    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error("Error in rejectFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all friend requests (incoming pending + accepted sent)
export async function getFriendRequest(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage bio location");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic nativeLanguage bio location");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.error("Error in getFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get outgoing friend requests (pending)
export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage bio location");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const unfriendUser = async (req, res) => {
  try {
    const { id: friendId } = req.params; // the user you want to unfriend
    const userId = req.user._id; // logged-in user

    if (!friendId) {
      return res.status(400).json({ message: "Friend ID missing" });
    }

    if (userId.toString() === friendId) {
      return res.status(400).json({ message: "You cannot unfriend yourself" });
    }

    //  1. Find both users
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    //  2. Remove friend from each other's friend lists
    user.friends = user.friends.filter(
      (f) => f.toString() !== friendId.toString()
    );
    friend.friends = friend.friends.filter(
      (f) => f.toString() !== userId.toString()
    );

    await user.save();
    await friend.save();

    // ✅ 3. Delete all friend requests between them
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId },
      ],
    });

    return res
      .status(200)
      .json({ success: true, message: "Unfriended successfully" });
  } catch (error) {
    console.error("Error in unfriendUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


