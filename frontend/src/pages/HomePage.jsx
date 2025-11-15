import { HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="
        w-full
        h-[calc(100vh-5rem)]          /* fit under navbar exactly */
        bg-gradient-to-b from-primary-content to-secondary-content
        flex items-center justify-center
        px-4 sm:px-6 lg:px-20
      "
    >
      <div
        className="
          w-full max-w-6xl
          flex flex-col lg:flex-row      /* STACK for small; row only on lg+ */
          items-center justify-center
          gap-8 lg:gap-16
          h-full
        "
      >
        <div
          className="
            w-full lg:w-1/2
            flex justify-center items-center
            order-1
          "
        >
          <div
            className="
              media-border bg-black
              rounded-2xl shadow-xl
              flex items-center gap-3 lg:gap-6
              px-5 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-14

              /* ensure box scales and doesn't exceed available height */
              max-h-[46vh] lg:max-h-none
              
            "
          >
            <HeartHandshake
              className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
              style={{
                stroke: "url(#logo-gradient)",
                strokeWidth: 2,
              }}
            />

            <svg width="0" height="0">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%">
                  <stop stopColor="#2563eb" offset="0%" />
                  <stop stopColor="#c026d3" offset="100%" />
                </linearGradient>
              </defs>
            </svg>

            <span
              className="
                font-mono font-bold tracking-tight
                bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-pink-700

                text-3xl sm:text-4xl md:text-5xl lg:text-7xl
              "
            >
              Connectify
            </span>
          </div>
        </div>

        {/* TEXT CONTENT - below logo on small, right on lg */}
        <div
          className="
            w-full lg:w-1/2
            text-center lg:text-left
            flex flex-col items-center lg:items-start
            order-2
            /* ensure content does not push beyond available height */
            justify-center
          "
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 lg:mb-4 text-secondary">
            Welcome to Connectify
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-base-content mb-5 leading-relaxed px-2 max-w-[36rem]">
            Connect and chat with friends and experience a smarter, faster way
            of interacting with people around you.
          </p>

          <div className="flex gap-4 mt-2 justify-center lg:justify-start">
            <button
              onClick={() => navigate("/friends")}
              className="px-5 py-2 sm:px-6 sm:py-3 rounded-lg text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-900 hover:opacity-80 transition shadow-md"
            >
              Friends
            </button>

            <button
              onClick={() => navigate("/connect")}
              className="px-5 py-2 sm:px-6 sm:py-3 rounded-lg text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-900 hover:opacity-80 transition shadow-md"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
