import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { StreamChat } from "stream-chat";
import StreamClientContext from "./StreamClientContext";
import useAuthUser from "../hooks/useAuthUser.js";
import { axiosInstance } from "../lib/axios.js";

export default function StreamClientProvider({
  children,
  apiKey = import.meta.env.VITE_STREAM_API_KEY,
}) {
  const clientRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [connectedUserId, setConnectedUserId] = useState(null);

  const { authUser } = useAuthUser();

  //  Main connect function
  const connect = useCallback(
    async ({ id, name, image }, token) => {
      if (!apiKey || !id || !token) return;

      //  Already connected to same user → do nothing
      if (clientRef.current && connectedUserId === id) {
        setIsReady(true);
        return;
      }

      //  Switching user → disconnect old one
      if (clientRef.current && connectedUserId && connectedUserId !== id) {
        try {
          await clientRef.current.disconnectUser();
        } catch {
          //
        }
        clientRef.current = null;
        setIsReady(false);
      }

      const client = new StreamChat(apiKey);

      await client.connectUser({ id, name, image }, token);

      clientRef.current = client;
      setConnectedUserId(id);
      setIsReady(true);
    },
    [apiKey, connectedUserId]
  );

  //  SAFE TOKEN REFRESH: only run when user is ready & onboarded
  useEffect(() => {
    if (!authUser?._id) return; // user must exist
    if (!authUser?.isOnboarded) return; // onboarding must be done
    if (!localStorage.getItem("token")) return; // JWT must exist

    const refreshStreamConnection = async () => {
      try {
        //  Fetch new token
        const res = await axiosInstance.get("/stream/token");
        const token = res.data.token;

        // Disconnect old user if exists
        if (clientRef.current) {
          try {
            await clientRef.current.disconnectUser();
          } catch {
            //
          }
          clientRef.current = null;
        }

        //  Reconnect with new data
        await connect(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token
        );
      } catch (err) {
        console.warn("Stream token refresh skipped:", err?.response?.status);
      }
    };

    refreshStreamConnection();
  }, [authUser, connect]);

  //  Cleanup on unmount
  useEffect(() => {
    return () => {
      clientRef.current?.disconnectUser().catch(() => {});
    };
  }, []);

  const value = useMemo(
    () => ({
      client: clientRef.current,
      isReady,
      connect,
    }),
    [isReady, connect]
  );

  return (
    <StreamClientContext.Provider value={value}>
      {children}
    </StreamClientContext.Provider>
  );
}
