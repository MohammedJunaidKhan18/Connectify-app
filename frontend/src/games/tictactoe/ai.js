const WIN = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

export function checkWinner(board) {
  for (const [a,b,c] of WIN) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  }
  return board.every(Boolean) ? "draw" : null;
}

export function aiMove(board) {
  for (let i = 0; i < 9; i++)
    if (!board[i]) return i;
  return null;
}
