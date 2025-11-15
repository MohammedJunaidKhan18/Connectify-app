import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function CallPage() {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const alreadyJoined = useRef(false);
  const { authUser, isLoading } = useAuthUser();

  //  Fetch token for Stream Video
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const init = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        if (alreadyJoined.current) return; //  Prevent duplicate joins
        alreadyJoined.current = true;

        //  Create or get the Stream video client
        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token: tokenData.token,
        });

        //  Create call instance
        const callInstance = videoClient.call("default", callId);

        //  Try to join or create call if it doesn’t exist
        try {
          await callInstance.join({ create: true });
        } catch (err) {
          console.warn("Join failed, creating call manually:", err);
          await callInstance.getOrCreate({
            members: [{ user_id: authUser._id }],
          });
          await callInstance.join();
        }

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        toast.error("Failed to join call");
        console.error("Error joining call:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    init();
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-90% bg-gradient-to-b from-primary-content to-secondary-content">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p>Could not initialize call</p>
        </div>
      )}
    </div>
  );
}

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const navigate = useNavigate();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/chat"); //  Redirect to chat after leaving the call
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};
