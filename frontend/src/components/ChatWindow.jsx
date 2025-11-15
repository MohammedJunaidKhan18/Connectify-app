import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";

import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { Clock, SmilePlus } from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import useStreamClient from "../hooks/useStreamClient";

import ChatLoader from "./ChatLoader";
import CallButton from "./CallButton";

export default function ChatWindow() {
  const { id: friendId } = useParams();
  const navigate = useNavigate();

  const { authUser } = useAuthUser();
  const { client, isReady } = useStreamClient();

  const userId = authUser?._id || "";

  const [channel, setChannel] = useState(null);
  const channelRef = useRef(null);
  const [presence, setPresence] = useState({ online: false, lastSeen: null });
  const [showEmoji, setShowEmoji] = useState(false);

  /* ---------- Initialize Channel ---------- */
  const initializeChannel = useCallback(async () => {
    if (!client || !userId || !friendId || !isReady) return null;

    const cid = [userId, friendId].sort().join("-");
    const ch = client.channel("messaging", cid, {
      members: [userId, friendId],
    });

    await ch.watch();

    setChannel(ch);
    channelRef.current = ch;

    // Fetch presence
    try {
      const res = await client.queryUsers({ id: { $eq: friendId } });
      const friend = res.users?.[0];
      if (friend) {
        setPresence({
          online: friend.online,
          lastSeen: friend.last_active,
        });
      }
    } catch {
      //
    }

    // Listen for presence events
    const sub = client.on("user.presence.changed", (ev) => {
      if (ev.user.id === friendId) {
        setPresence({
          online: ev.user.online,
          lastSeen: ev.user.last_active,
        });
      }
    });

    return () => sub.unsubscribe();
  }, [client, userId, friendId, isReady]);

  /* ---------- Setup + Cleanup ---------- */
  useEffect(() => {
    let cleanup;
    initializeChannel().then((cb) => (cleanup = cb));

    return () => {
      cleanup?.();
      try {
        channelRef.current?.stopWatching();
      } catch {
        //
      }
      channelRef.current = null;
      setChannel(null);
    };
  }, [initializeChannel]);

  /* ---------- Emoji handler ---------- */
  const pasteEmoji = (emoji) => {
    const ta = document.querySelector("textarea[class*='str-chat__textarea']");
    if (!ta) return;

    const ev = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
      bubbles: true,
      cancelable: true,
    });

    ev.clipboardData.setData("text/plain", emoji);
    ta.dispatchEvent(ev);
  };

  /* ---------- Video Call ---------- */
  const startVideoCall = async () => {
    const cid = [userId, friendId].sort().join("-");
    const url = `${window.location.origin}/call/${cid}`;

    try {
      await channel.sendMessage({
        text: ` JOIN CALL\n${url}`,
      });

      toast.success("Video call link sent");
      window.open(url, "_blank");
    } catch {
      toast.error("Failed to send video call link");
    }
  };

  if (!friendId)
    return (
      <div className="flex items-center justify-center h-full text-4xl bg-gradient-to-b from-primary-content to-secondary-content font-bold text-primary">
        Select a friend to start chatting
      </div>
    );

  if (!client || !channel || !isReady) return <ChatLoader />;

  const friendUser = channel.state?.members?.[friendId]?.user || {
    name: "Friend",
    image: "",
  };

  return (
    <div className="relative h-full flex flex-col">
      <Chat client={client} theme="str-chat__theme-light">
        <Channel channel={channel} markReadOnMount>
          <Window className="flex flex-col h-full">
            {/* HEADER */}
            <div className="px-3 py-3 flex items-center justify-between bg-primary-content">
              <div className="flex items-center gap-4">
                <img
                  src={friendUser.image || "/default-avatar.png"}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={() => navigate(`/friend/${friendId}`)}
                />

                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/friend/${friendId}`)}
                >
                  <h3 className="text-md text-secondary font-semibold">
                    {friendUser.name}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-primary">
                    {presence.online ? (
                      <>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>
                          Last seen:{" "}
                          {presence.lastSeen
                            ? new Date(presence.lastSeen).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : "Unknown"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <CallButton className="h-8" onVideoCall={startVideoCall} />
            </div>

            {/* MESSAGES */}
            <MessageList className="flex-1 overflow-y-auto" />

            {/* INPUT */}
            <div className="custom-chat-input relative w-full pb-[50px] md:pb-0">
              <MessageInput focus />

              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="emoji-btn  right-14 bottom-5 md:bottom-3 w-3"
              >
                <SmilePlus />
              </button>

              {showEmoji && (
                <div className="emoji-picker-popup">
                  <EmojiPicker
                    onEmojiClick={(e) => {
                      pasteEmoji(e.emoji);
                      setShowEmoji(false);
                    }}
                  />
                </div>
              )}
            </div>

            <Thread />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
}
