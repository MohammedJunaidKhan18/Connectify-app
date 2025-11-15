import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import useStreamClient from "../hooks/useStreamClient";

function Layout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { authUser } = useAuthUser();
  const { connect } = useStreamClient();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (authUser && tokenData?.token) {
      connect(
        {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        },
        tokenData.token
      );
    }
  }, [authUser, tokenData, connect]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-primary-content to-secondary-content flex flex-col overflow-hidden">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-40">
        <Navbar />
      </div>

      <div className="flex flex-row pt-20 w-full min-h-[calc(100vh-5rem)] overflow-y-auto">
        {/* Sidebar (desktop & tablet only) */}
        <div className="hidden md:block">
          <Sidebar
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
          />
        </div>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-500 ${
            isSidebarExpanded ? "md:ml-60" : "md:ml-20"
          }`}
        >
          {/* FIX — ensures full height & no gray gap */}
          <div className="pb-24 md:pb-6 min-h-[calc(100vh-5rem)]">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation (mobile only) */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

export default Layout;
