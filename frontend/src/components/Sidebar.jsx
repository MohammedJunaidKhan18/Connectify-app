import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import {
  Gamepad2,
  Handshake,
  HomeIcon,
  MessageCircle,
  PanelLeftOpen,
  Unplug,
} from "lucide-react";
import { useState } from "react";

function Sidebar() {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`
        hidden md:flex   /* SHOW on tablet + desktop ONLY */
        flex-col fixed left-0 top-18 
        h-[calc(100vh-5rem)]
        bg-gradient-to-b from-primary-content to-secondary-content
        overflow-hidden
        transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        shadow-lg z-50
      `}
      style={{
        width: isExpanded ? "300px" : "80px",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav className="flex-1 p-4 space-y-1 overflow-hidden">
        <div className="flex mt-2 items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-base-300">
          <PanelLeftOpen
            className={`size-5 text-base-content opacity-70 transform transition-transform duration-500 ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
          />
          <span
            className={`text-lg font-semibold whitespace-nowrap transition-opacity duration-500 ${
              isExpanded ? "opacity-100 delay-150" : "opacity-0"
            }`}
          >
            Menu
          </span>
        </div>

        {[
          { to: "/home", icon: <HomeIcon className="size-5" />, label: "Home" },
          {
            to: "/friends",
            icon: <Handshake className="size-5" />,
            label: "Friends",
          },
          {
            to: "/connect",
            icon: <Unplug className="size-5" />,
            label: "Connect",
          },
          {
            to: "/chat",
            icon: <MessageCircle className="size-5" />,
            label: "Chats",
          },
          {
            to: "/games",
            icon: <Gamepad2 className="size-5" />,
            label: "Games",
          },
        ].map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 
              hover:bg-primary/40 hover:text-primary 
              ${
                currentPath === to
                  ? "bg-gradient-to-tr from-primary/30 to-secondary/30 "
                  : "text-base-content"
              }
            `}
          >
            <div className="text-base-content h-8 flex justify-center items-center transition-transform duration-300">
              {icon}
            </div>
            <span
              className={`text-base-content whitespace-nowrap font-medium transition-opacity duration-500 ${
                isExpanded ? "opacity-100 delay-150" : "opacity-0"
              }`}
            >
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User section */}
      <Link
        to="/profile"
        className="p-4 flex items-center gap-3 transition-all duration-500"
      >
        <div className="avatar flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={authUser?.profilePic}
              alt="User Avatar"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ${
            isExpanded
              ? "opacity-100 translate-x-0 delay-150"
              : "opacity-0 -translate-x-2"
          }`}
        >
          <p className="font-bold text-md text-secondary/90 leading-tight truncate">
            {authUser?.fullName}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
            <span className="text-xs text-base-content">Online</span>
          </div>
        </div>
      </Link>
    </aside>
  );
}

export default Sidebar;

