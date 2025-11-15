import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting stream user", error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error getting stream token", error);
  }
};

export const ensureDMChannel = async (userA, userB) => {
  try {
    const channel = streamClient.channel("messaging", {
      members: [String(userA), String(userB)],
    });

    await channel.create();
    return channel;
  } catch (err) {
    console.error("Error creating DM channel:", err);
    throw err;
  }
};
