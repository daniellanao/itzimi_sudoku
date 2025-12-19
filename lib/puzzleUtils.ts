/**
 * Converts a puzzle string (up to 81 characters) into a 9x9 grid
 * @param puzzleString - String of digits representing the puzzle (can be less than 81 chars, will be padded with 0s)
 * @returns 9x9 grid as number[][]
 */
export function parsePuzzleString(puzzleString: string): number[][] {
  if (!puzzleString || typeof puzzleString !== 'string') {
    throw new Error('Puzzle string must be a valid string');
  }

  // Remove any whitespace or non-digit characters
  const cleanString = puzzleString.replace(/\D/g, '');
  
  // Pad with zeros if shorter than 81 characters, truncate if longer
  const paddedString = cleanString.padEnd(81, '0').substring(0, 81);

  const grid: number[][] = [];
  for (let row = 0; row < 9; row++) {
    grid[row] = [];
    for (let col = 0; col < 9; col++) {
      const index = row * 9 + col;
      // Parse each character individually to preserve leading zeros
      const char = paddedString[index] || '0';
      grid[row][col] = parseInt(char, 10);
    }
  }
  return grid;
}

