import { GAMES } from "../games";
import { useNavigate } from "react-router-dom";

export default function GamesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-content to-secondary-content p-5">
      <h1 className="text-[32px] font-bold text-primary text-center mb-5">
        Games
      </h1>

      <div className="grid gap-6 mt-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className="
             bg-gradient-to-l from-primary/10 to-secondary/20 p-5 rounded-xl shadow-md 
              transition-all duration-200 cursor-pointer
               hover:shadow-lg
            "
          >
            <h2 className="text-[22px] font-semibold mb-2 text-secondary">
              {game.title}
            </h2>

            <p className="text-[15px] text-primary leading-relaxed mb-4">
              {game.description}
            </p>

            <button
              onClick={() => navigate(`/games/${game.id}`)}
              className="
                mt-3 w-full px-4 py-3 text-[15px] btn btn-outline hover:btn-info
              "
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
