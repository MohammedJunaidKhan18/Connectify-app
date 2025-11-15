import { useState, useEffect } from "react";
import { aiPick, drop, checkWinner } from "./ai";
import { useNavigate } from "react-router-dom";

export default function Connect4() {
  const [board, setBoard] = useState(
    Array.from({ length: 6 }, () => Array(7).fill(null))
  );
  const [turn, setTurn] = useState("R"); // Human = R, AI = Y
  const [winner, setWinner] = useState(null);

  const navigate = useNavigate();

  function play(col) {
    if (winner || turn === "Y") return;

    const next = drop(board, col, "R");
    setBoard(next);
    setTurn("Y");
  }

  // AI Move
  useEffect(() => {
    if (turn === "Y" && !winner) {
      const mv = aiPick(board);

      if (mv !== null) {
        setTimeout(() => {
          const next = drop(board, mv, "Y");
          setBoard(next);
          setTurn("R");
        }, 300);
      }
    }
  }, [turn, board, winner]);

  // Winner detection
  useEffect(() => {
    const w = checkWinner(board);
    if (w) setWinner(w);
  }, [board]);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-primary-content to-secondary-content">
      {/* Back Button */}
      <button
        onClick={() => navigate("/games")}
        className="mb-6 px-4 py-2 btn btn-outline text-primary rounded-lg hover:btn-error transition"
      >
        Back to Games
      </button>

      {/* Center Section */}
      <div className="flex flex-col items-center w-full">
        {/* Title */}
        <h2 className="text-3xl font-extrabold text-purple-300 drop-shadow mb-4 text-center">
          {winner
            ? winner === "draw"
              ? "It's a Draw!"
              : `${winner} Wins!`
            : turn === "R"
            ? "Your Turn (Red)"
            : "AI Thinking... (Yellow)"}
        </h2>

        {/* Column Buttons */}
        <div className="flex justify-center gap-2 mt-4 w-full max-w-[420px] sm:max-w-[500px] md:max-w-[560px]">
          {board[0].map((_, col) => (
            <button
              key={col}
              onClick={() => play(col)}
              disabled={winner || turn !== "R"}
              className={`
              w-8 h-8 text-lg rounded-md
              transition select-none
              ${
                winner || turn !== "R"
                  ? "opacity-40 cursor-not-allowed"
                  : "bg-purple-600/20 text-purple-300 hover:bg-purple-600/40"
              }
            `}
            >
              ↓
            </button>
          ))}
        </div>

        {/* Board */}
        <div
          className="
          mt-6 p-4 rounded-xl bg-black/20 backdrop-blur-md shadow-xl
          border border-white/10 mx-auto
          w-full max-w-[420px] sm:max-w-[500px] md:max-w-[560px]
        "
        >
          {board.map((row, r) => (
            <div key={r} className="flex justify-center">
              {row.map((cell, c) => (
                <div
                  key={c}
                  className={`
                  m-1 rounded-full border-2 transition shadow-inner
                  ${cell === "R" ? "bg-red-800 border-red-500" : ""}
                  ${cell === "Y" ? "bg-yellow-600 border-yellow-300" : ""}
                  ${!cell ? "bg-white/20 border-white/30" : ""}
                  
                  /* Responsive circle sizes */
                  w-10 h-10
                  sm:w-12 sm:h-12
                  md:w-14 md:h-14
                `}
                ></div>
              ))}
            </div>
          ))}
        </div>

        {/* Reset Button BELOW board */}
        {winner && (
          <button
            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition"
            onClick={() => {
              setBoard(Array.from({ length: 6 }, () => Array(7).fill(null)));
              setTurn("R");
              setWinner(null);
            }}
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
