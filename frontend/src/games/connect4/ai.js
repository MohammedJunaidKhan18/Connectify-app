//  Drop a piece into the selected column
export function drop(board, col, token) {
  const newBoard = board.map((row) => [...row]);
  for (let r = 5; r >= 0; r--) {
    if (!newBoard[r][col]) {
      newBoard[r][col] = token;
      return newBoard;
    }
  }
  return newBoard;
}

//  Get all valid columns
export function getValidColumns(board) {
  return board[0]
    .map((cell, col) => (cell === null ? col : null))
    .filter((col) => col !== null);
}

//  Full Winner detection (horizontal + vertical + both diagonals)
export function checkWinner(b) {
  const rows = 6,
    cols = 7;

  // Horizontal
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const cell = b[r][c];
      if (
        cell &&
        cell === b[r][c + 1] &&
        cell === b[r][c + 2] &&
        cell === b[r][c + 3]
      ) {
        return cell;
      }
    }
  }

  // Vertical
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 3; r++) {
      const cell = b[r][c];
      if (
        cell &&
        cell === b[r + 1][c] &&
        cell === b[r + 2][c] &&
        cell === b[r + 3][c]
      ) {
        return cell;
      }
    }
  }

  // Diagonal
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const cell = b[r][c];
      if (
        cell &&
        cell === b[r + 1][c + 1] &&
        cell === b[r + 2][c + 2] &&
        cell === b[r + 3][c + 3]
      ) {
        return cell;
      }
    }
  }

  // Diagonal
  for (let r = 3; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const cell = b[r][c];
      if (
        cell &&
        cell === b[r - 1][c + 1] &&
        cell === b[r - 2][c + 2] &&
        cell === b[r - 3][c + 3]
      ) {
        return cell;
      }
    }
  }

  // Draw check
  if (b[0].every((cell) => cell !== null)) return "draw";

  return null;
}

//  Medium AI
export function aiPick(board) {
  const valid = getValidColumns(board);
  if (valid.length === 0) return null;

  const AI = "Y";
  const HUMAN = "R";

  //  tries winning move
  for (const col of valid) {
    const test = drop(board, col, AI);
    if (checkWinner(test) === AI) return col;
  }

  //  Block player's winning move
  for (const col of valid) {
    const test = drop(board, col, HUMAN);
    if (checkWinner(test) === HUMAN) return col;
  }

  //  Prefer center-first strategy
  const priority = [3, 2, 4, 1, 5, 0, 6];
  for (const col of priority) {
    if (valid.includes(col)) return col;
  }

  //  Random fallback
  return valid[Math.floor(Math.random() * valid.length)];
}
