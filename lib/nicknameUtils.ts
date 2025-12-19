/**
 * Generates a nickname based on timestamp
 * Format: Player_YYYYMMDDHHMMSS (e.g., Player_20251219143025)
 * @returns A unique nickname based on current timestamp
 */
export function generateTimestampNickname(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `Player_${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Gets or generates a nickname for the player
 * Checks localStorage first, then generates a new one if not found
 * @returns A nickname string
 */
export function getOrGenerateNickname(): string {
  // Check if nickname exists in localStorage
  const savedNickname = localStorage.getItem("sudoku_nickname");
  if (savedNickname) {
    return savedNickname;
  }
  
  // Generate new nickname based on timestamp
  const newNickname = generateTimestampNickname();
  localStorage.setItem("sudoku_nickname", newNickname);
  return newNickname;
}

