import { useState, useEffect } from "react";
import { aiMove, checkWinner } from "./ai";
import { useNavigate } from "react-router-dom";

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);

  const navigate = useNavigate();

  function handleClick(i) {
    if (winner || board[i] || turn === "O") return;

    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setTurn("O");
  }

  useEffect(() => {
    if (turn === "O" && !winner) {
      const mv = aiMove(board);
      if (mv !== null) {
        setTimeout(() => {
          const newBoard = [...board];
          newBoard[mv] = "O";
          setBoard(newBoard);
          setTurn("X");
        }, 300);
      }
    }
  }, [turn, board, winner]);

  useEffect(() => {
    const w = checkWinner(board);
    if (w) setWinner(w);
  }, [board]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-primary-content to-secondary-content">
      {/* Back Button  */}
      <button
        onClick={() => navigate("/games")}
        className="mb-6 px-4 py-2 btn btn-outline text-primary rounded-lg hover:btn-error transition"
      >
        Back to Games
      </button>

      {/* Centered Content */}
      <div className="text-center">
        {/* Title */}
        <h2 className="text-3xl font-bold text-primary">
          {winner
            ? winner === "draw"
              ? "It's a Draw!"
              : `${winner} Wins!`
            : `Turn: ${turn}`}
        </h2>

        {/* Board */}
        <div className="grid grid-cols-3 gap-4 mt-8 mx-auto w-fit">
          {board.map((v, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="
                w-20 h-20 bg-white/20 backdrop-blur-md rounded-xl 
                shadow-md text-4xl font-bold 
                flex items-center justify-center
                transition hover:bg-white/30
              "
            >
              <span
                className={
                  v === "X"
                    ? "text-primary drop-shadow-md"
                    : "text-secondary drop-shadow-md"
                }
              >
                {v}
              </span>
            </button>
          ))}
        </div>

        {/* Reset Button */}
        {winner && (
          <button
            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            onClick={() => {
              setBoard(Array(9).fill(null));
              setTurn("X");
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
