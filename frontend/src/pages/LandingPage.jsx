import { HeartHandshake } from "lucide-react";
import { IoLogoInstagram } from "react-icons/io";
import { FaXTwitter } from "react-icons/fa6";
import { FiLinkedin } from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SupportModal from "../components/support/SupportModal";

function LandingPage() {
  const navigate = useNavigate();
  const [openSupport, setOpenSupport] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-l from-black to-gray-900 text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="w-full px-6 xl:px-8 py-4 bg-gradient-to-r from-gray-900 to-black shadow-md flex items-center justify-between">
        <HeartHandshake
          className="size-8 xl:size-9"
          style={{
            stroke: "url(#logo-gradient)",
            strokeWidth: 1.2,
          }}
        />

        <div className="flex items-center space-x-4 xl:space-x-6 text-md xl:text-lg font-bold">
          <a href="/" className="hover:text-gray-300">
            Home
          </a>
          <a href="/auth" className="hover:text-gray-300">
            SignUp
          </a>
          <button
            onClick={() => setOpenSupport(true)}
            className="hover:text-gray-300"
          >
            Support
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main
        className="
          flex flex-1
          px-6 xl:px-20
          py-10 xl:py-0
          flex-col xl:flex-row
          items-center
          justify-center xl:justify-between
          xl:gap-20
        "
      >
        {/* LEFT LOGO SECTION */}
        <div className="w-full xl:w-1/2 flex justify-center mb-10 xl:mb-0">
          <div
            className="
              media-border bg-black 
              p-6 xl:p-14 
              rounded-2xl shadow-xl 
              flex items-center 
              gap-3 xl:gap-4
              w-full max-w-[340px] xl:max-w-none
            "
          >
            <HeartHandshake
              className="w-12 h-12 xl:w-20 xl:h-20"
              style={{
                stroke: "url(#logo-gradient)",
                strokeWidth: 2,
              }}
            />

            <svg width="0" height="0">
              <defs>
                <linearGradient
                  id="logo-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop stopColor="#2563eb" offset="0%" />
                  <stop stopColor="#c026d3" offset="100%" />
                </linearGradient>
              </defs>
            </svg>

            <span
              className="
                text-4xl xl:text-7xl 
                font-mono font-bold 
                tracking-tight 
                bg-clip-text 
                text-transparent 
                bg-gradient-to-r 
                from-blue-800 to-pink-700
              "
            >
              Connectify
            </span>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full xl:w-1/2 text-center xl:text-left">
          <h1 className="text-3xl xl:text-5xl font-bold mb-4">
            Welcome to Connectify
          </h1>

          <p className="text-sm xl:text-md text-gray-300 font-bold mb-6 leading-relaxed px-4 xl:px-0">
            Connect and chat with friends and experience a smarter, faster way
            of connecting with people around you.
          </p>

          <button
            onClick={() => navigate("/auth")}
            className="
              px-8 py-3 
              bg-gradient-to-b from-blue-900 to-gray-900 
              border border-transparent hover:border-white 
              transition 
              rounded-lg 
              text-lg font-semibold 
              shadow-md
            "
          >
            Start
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className="
        w-full py-6 
        bg-gradient-to-r from-gray-900 to-black 
        text-white 
        flex flex-col xl:flex-row 
        justify-around items-center 
        gap-6 xl:gap-0
      "
      >
        <div className="text-center xl:text-left">
          <p className="font-bold">Copyright © Connectify.</p>
          <p className="font-bold">@MJunaid</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-lg font-bold">Contact Us</p>

          <div className="flex gap-6">
            <a
              href="https://x.com/mdjunaid1805"
              className="hover:text-blue-800 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter className="size-6" />
            </a>

            <a
              href="https://www.linkedin.com/in/mohammed-junaid-b879b3285/"
              className="hover:text-blue-600 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiLinkedin className="size-6" />
            </a>

            <a
              href="https://www.instagram.com/md__j_u_n_a_i_d"
              className="hover:text-pink-700 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoInstagram className="size-7" />
            </a>
          </div>
        </div>
      </footer>

      {openSupport && <SupportModal onClose={() => setOpenSupport(false)} />}
    </div>
  );
}

export default LandingPage;
