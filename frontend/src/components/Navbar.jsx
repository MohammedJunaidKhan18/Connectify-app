import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HandHeart, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";

import ThemeSelector from "./ThemeSelector";
import SupportModal from "./support/SupportModal";

function Navbar() {
  const { authUser } = useAuthUser();
  const location = useLocation();

  const [notifCount, setNotifCount] = useState(0);
  const [openSupport, setOpenSupport] = useState(false);

  const updateBadge = () => {
    const stored = JSON.parse(localStorage.getItem("unreadNotifications")) || {
      incoming: [],
      accepted: [],
    };
    const dismissed =
      JSON.parse(localStorage.getItem("dismissedNotifications")) || [];

    const actualCount =
      stored.incoming.filter((id) => !dismissed.includes(id)).length +
      stored.accepted.filter((id) => !dismissed.includes(id)).length;

    setNotifCount(actualCount);
  };

  useEffect(() => {
    updateBadge();
  }, []);

  useEffect(() => {
    const handler = () => updateBadge();
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
  }, []);

  useEffect(() => {
    if (location.pathname === "/notifications") {
      localStorage.setItem(
        "unreadNotifications",
        JSON.stringify({ incoming: [], accepted: [] })
      );
      updateBadge();
      window.dispatchEvent(new Event("notifications-updated"));
    }
  }, [location.pathname]);

  return (
    <>
      <nav
        className="
          fixed top-0 left-0 z-40 w-full h-20
          bg-primary-content  
          flex items-center

          /* Reduced padding for mobile, same for desktop */
          px-3 sm:px-4 md:px-6
        "
      >
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 sm:gap-3">
            <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />

            {/* Scales down beautifully on mobile */}
            <span
              className="
                font-bold font-mono bg-clip-text text-transparent 
                bg-gradient-to-r from-primary to-secondary tracking-wide

                text-xl sm:text-2xl md:text-3xl
              "
            >
              Connectify
            </span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-3.5">
            {/* NOTIFICATIONS */}
            <div className="relative">
              <Link to="/notifications">
                <button className="btn btn-ghost btn-circle text-primary p-1 sm:p-2">
                  <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 opacity-90" />
                </button>

                {notifCount > 0 && (
                  <span
                    className="
                      absolute -top-1 -right-1 bg-red-600 text-white text-[10px]
                      sm:text-xs rounded-full px-1.5 py-0.5 shadow-md
                    "
                  >
                    {notifCount}
                  </span>
                )}
              </Link>
            </div>

            {/* SUPPORT */}
            <button
              onClick={() => setOpenSupport(true)}
              className="btn btn-ghost btn-circle p-1 sm:p-2"
            >
              <HandHeart className="h-5 w-5 sm:h-6 sm:w-6 opacity-90 text-primary" />
            </button>

            {/* THEME SELECTOR */}
            <div className="scale-90 sm:scale-100">
              <ThemeSelector />
            </div>

            {/* PROFILE */}
            <Link to="/profile" className="pr-1 sm:pr-3">
              <div className="avatar cursor-pointer">
                <div className="w-8 sm:w-9 rounded-full ring ring-secondary">
                  <img src={authUser?.profilePic} className="object-cover" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {openSupport && <SupportModal onClose={() => setOpenSupport(false)} />}
    </>
  );
}

export default Navbar;
