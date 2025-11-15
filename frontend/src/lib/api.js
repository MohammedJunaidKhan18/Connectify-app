// src/lib/api.js
import { axiosInstance } from "./axios";

// auth (existing)
export const sendSignupOtp = async (email) => {
  const response = await axiosInstance.post("/auth/send-otp", { email });
  return response.data;
};

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};
export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};



export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch  {
    // console.log("Error in getAuthUser:", error);
    return null;
  }
};




export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

// friends
export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

// recommended users
export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users/connect");
  return response.data;
}

// outgoing friend requests
export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

// send friend request
export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

// get friend requests (incoming + accepted)
export async function getFriendRequests() {
  const response = await axiosInstance.get(`/users/friend-requests`);
  return response.data;
}

// accept friend request
export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

// reject friend request
export async function rejectFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/reject`);
  return response.data;
}

// unfriend
export async function unfriendUser(userId) {
  const res = await axiosInstance.delete(`/users/unfriend/${userId}`);
  return res.data;
}



// get stream token

export async function getStreamToken() {
  const response = await axiosInstance.get(`/chat/token`);
  return response.data;
}




//update profile
export async function updateProfile(data) {
  const res = await axiosInstance.put("/users/me", data);
  return res.data;
}


//profilepic

export const getCloudinarySignature = async (folder = "avatars") => {
  const { data } = await axiosInstance.post("/cloudinary/signature", { folder });
  return data;
};

export const saveUserAvatar = async ({ url, public_id }) => {
  const { data } = await axiosInstance.put("/users/update-avatar", {
    url,
    public_id,
  });
  return data;
};


//search by user name in connect page

export async function searchUserByName(query) {
  const { data } = await axiosInstance.get(`/users/search?query=${query}`);
  return data;
}






