import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Gamepad2,
  Handshake,
  HomeIcon,
  MessageCircle,
  Unplug,
} from "lucide-react";

function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const links = [
    { to: "/home", icon: <HomeIcon className="size-6" />, label: "Home" },
    {
      to: "/friends",
      icon: <Handshake className="size-6" />,
      label: "Friends",
    },
    { to: "/connect", icon: <Unplug className="size-6" />, label: "Connect" },
    { to: "/chat", icon: <MessageCircle className="size-6" />, label: "Chats" },
    { to: "/games", icon: <Gamepad2 className="size-6" />, label: "Games" },
  ];

  const handleChatClick = (e) => {
    e.preventDefault();

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      navigate("/chat", { state: { openChatList: true } });
    } else {
      navigate("/chat");
    }
  };

  return (
    <nav
      className="
        fixed bottom-0 left-0 w-full 
        md:hidden z-50

        /* SAME BG AS SIDEBAR */
        bg-gradient-to-tr from-primary-content to-secondary-content

        flex justify-between px-4 py-3 
        shadow-[0_-2px_10px_rgba(0,0,0,0.4)]
      "
    >
      {links.map(({ to, icon }) => {
        const active = currentPath.startsWith(to);

        // Chat link uses custom handler
        if (to === "/chat") {
          return (
            <a
              key={to}
              href={to}
              onClick={handleChatClick}
              className={`
                flex flex-col items-center gap-0.5 text-[10px] font-medium
                transition-all duration-300 px-3 py-1 rounded-lg

                ${
                  active
                    ? "text-primary bg-gradient-to-tr from-primary/30 to-secondary/30"
                    : "text-base-content"
                }

                hover:bg-primary/40 hover:text-primary
              `}
            >
              {icon}
            </a>
          );
        }

        return (
          <Link
            key={to}
            to={to}
            className={`
              flex flex-col items-center gap-0.5 text-[10px] font-medium
              transition-all duration-300 px-3 py-1 rounded-lg

              /* ACTIVE */
              ${
                active
                  ? "text-primary bg-gradient-to-tr from-primary/30 to-secondary/30"
                  : "text-base-content"
              }

              /* HOVER */
              hover:bg-primary/40 hover:text-primary
            `}
          >
            {icon}
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
