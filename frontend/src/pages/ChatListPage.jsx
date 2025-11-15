import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import ChatWindow from "../components/ChatWindow";
import useStreamClient from "../hooks/useStreamClient";

export default function ChatListPage() {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const { id: selectedUserId } = useParams();
  const location = useLocation();
  const { client, isReady } = useStreamClient();

  const [activeFriendId, setActiveFriendId] = useState(selectedUserId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelMeta, setChannelMeta] = useState({});

  const watchersRef = useRef({});

  // Detect Mobile Toggle (chat navbar button)
  const isMobile = window.innerWidth <= 768;
  const isChatNavPressed = location.state?.openChatList === true;

  // When chat bottom-nav is clicked — show list only
  useEffect(() => {
    if (isMobile && isChatNavPressed) {
      setActiveFriendId(null);
    }
  }, [isChatNavPressed, isMobile]);

  // Fetch Friends
  const {
    data: friends = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (selectedUserId) setActiveFriendId(selectedUserId);
  }, [selectedUserId]);

  // ===== LOAD CHANNELS =====
  const computeUnread = (channel, myId) => {
    const readState = channel?.state?.read?.[myId];
    const lastRead = readState?.last_read
      ? new Date(readState.last_read).getTime()
      : 0;

    return (channel?.state?.messages || []).filter(
      (m) => m.user?.id !== myId && new Date(m.created_at).getTime() > lastRead
    ).length;
  };

  const loadChannels = useCallback(async () => {
    if (!isReady || !client || !authUser || friends.length === 0) return;

    Object.values(watchersRef.current).forEach((cb) => cb?.());
    watchersRef.current = {};

    const next = {};

    await Promise.all(
      friends.map(async (f) => {
        const cid = [authUser._id, f._id].sort().join("-");
        const channel = client.channel("messaging", cid, {
          members: [authUser._id, f._id],
        });

        await channel.watch();

        const messages = channel.state.messages;
        const lastMessage =
          messages.length > 0
            ? messages[messages.length - 1].created_at
            : channel.state.last_message_at || channel.created_at;

        const lastAt = lastMessage ? new Date(lastMessage) : null;

        next[f._id] = {
          channel,
          unread: computeUnread(channel, authUser._id),
          lastMessageAt: lastAt ? lastAt.toISOString() : null,
        };

        const sub = client.on((event) => {
          if (event.cid !== channel.cid) return;

          if (event.type === "message.new") {
            const ts = event.message?.created_at || new Date().toISOString();

            setChannelMeta((prev) => ({
              ...prev,
              [f._id]: {
                ...prev[f._id],
                channel,
                lastMessageAt: ts,
                unread:
                  event.user.id === authUser._id
                    ? prev[f._id]?.unread || 0
                    : (prev[f._id]?.unread || 0) + 1,
              },
            }));
          }

          if (event.type === "message.read") {
            if (event.user?.id === authUser._id) {
              setChannelMeta((prev) => ({
                ...prev,
                [f._id]: { ...prev[f._id], unread: 0 },
              }));
            }
          }
        });

        watchersRef.current[channel.cid] = () => sub.unsubscribe();
      })
    );

    setChannelMeta(next);
  }, [isReady, client, authUser, friends]);

  useEffect(() => {
    loadChannels();
    return () => {
      Object.values(watchersRef.current).forEach((cb) => cb?.());
      watchersRef.current = {};
    };
  }, [loadChannels]);

  // ===== FILTERING =====
  const filteredFriends = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return friends.filter((f) => f.fullName.toLowerCase().includes(q));
  }, [friends, searchQuery]);

  const sortedFriends = useMemo(() => {
    return [...filteredFriends]
      .map((f) => {
        const meta = channelMeta[f._id] || {};
        return {
          ...f,
          _last: meta.lastMessageAt
            ? new Date(meta.lastMessageAt).getTime()
            : 0,
          _unread: meta.unread || 0,
        };
      })
      .sort((a, b) => b._last - a._last);
  }, [filteredFriends, channelMeta]);

  // ===== SELECT FRIEND =====
  const handleSelectFriend = async (friendId) => {
    setActiveFriendId(friendId);

    navigate(`/chat/${friendId}`, {
      state: { openChatList: false }, // reset flag
    });

    const meta = channelMeta[friendId];
    if (meta?.channel) {
      try {
        await meta.channel.markRead();
      } catch {
        //
      }
      setChannelMeta((prev) => ({
        ...prev,
        [friendId]: { ...prev[friendId], unread: 0 },
      }));
    }
  };

  // ===== LOADING STATES =====
  if (isLoading) return <p className="p-6">Loading friends...</p>;
  if (isError)
    return <p className="p-6 text-red-500">Failed to load friends</p>;

  // ===== MOBILE CONDITIONAL UI =====
  const showOnlyUserList = isMobile && !activeFriendId;
  const showOnlyChat = isMobile && activeFriendId;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-gradient-to-b from-primary-content to-secondary-content overflow-hidden">
      {/* LEFT LIST — SHOW ONLY ON DESKTOP/TABLET OR MOBILE WHEN NO CHAT SELECTED */}
      {!showOnlyChat && (
        <div className="w-[310px] h-full border-r border-white flex flex-col">
          <h2 className="text-lg font-bold tracking-wide mb-4 text-center text-primary pt-5">
            Friends
          </h2>

          <div className="relative px-5 mb-4">
            <SearchIcon className="absolute left-8 top-3.5 text-primary size-5" />
            <input
              type="text"
              placeholder="Search friends..."
              className="input input-primary bg-primary-content w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-24">
            <ul className="space-y-2">
              {sortedFriends.map((f) => {
                const meta = channelMeta[f._id] || {};

                return (
                  <li
                    key={f._id}
                    onClick={() => handleSelectFriend(f._id)}
                    className={`p-2 rounded-md cursor-pointer hover:bg-primary/30 transition relative ${
                      activeFriendId === f._id
                        ? "bg-gradient-to-tr from-primary/30 to-secondary/30"
                        : ""
                    }`}
                  >
                    {meta.unread > 0 && (
                      <span className="absolute right-3 top-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {meta.unread}
                      </span>
                    )}

                    <div className="flex items-center gap-3 pointer-events-none">
                      <img
                        src={f.profilePic}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <p className="font-medium text-base-content">
                        {f.fullName}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* RIGHT CHAT WINDOW — SHOW ONLY WHEN A FRIEND IS SELECTED */}
      {!showOnlyUserList && (
        <div className="flex-1 h-full overflow-hidden">
          {activeFriendId ? (
            <ChatWindow key={activeFriendId} />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl font-bold text-primary">
              Select a friend to start chatting
            </div>
          )}
        </div>
      )}
    </div>
  );
}
