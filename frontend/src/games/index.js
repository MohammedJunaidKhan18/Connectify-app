import TicTacToe from "./tictactoe/Game";
import Connect4 from "./connect4/Game";

export const GAMES = [
  {
    id: "tictactoe",
    
    description: "Classic 3×3 board game.",
    component: TicTacToe,  
  },
  {
    id: "connect4",
  
    description: "Drop discs and connect 4 in a row.",
    component: Connect4,
  },

   
];

// Helper to get a game by ID
export function getGameById(id) {
  return GAMES.find((g) => g.id === id);
}
