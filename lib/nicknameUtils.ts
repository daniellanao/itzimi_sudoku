import { XOConnect } from "xo-connect";
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
 * Tries to get nickname from XO Connect, falls back to timestamp if not available
 * @returns A nickname string from XO Connect or timestamp-based fallback
 */
export async function getNicknameFromXOConnectOrFallback(): Promise<string> {
  try {
    // Try to get nickname from XO Connect
    const client = await XOConnect.getClient();
    
    // Check if client has a valid alias
    if (client?.alias && typeof client.alias === 'string' && client.alias.trim().length > 0) {
      const nickname = client.alias.trim();
      // Save to localStorage for future use
      localStorage.setItem("sudoku_nickname", nickname);
      return nickname;
    }
  } catch (error) {
    // XO Connect not available or error occurred, fall back to timestamp
    console.log('XO Connect not available, using fallback nickname:', error);
  }
  
  // Fallback to timestamp-based nickname
  return generateTimestampNickname();
}

/**
 * Gets or generates a nickname for the player
 * Checks localStorage first, then tries XO Connect, then generates a new one if not found
 * @returns A nickname string
 */
export async function getOrGenerateNickname(): Promise<string> {
  // Check if nickname exists in localStorage
  const savedNickname = localStorage.getItem("sudoku_nickname");
  if (savedNickname) {
    return savedNickname;
  }
  
  // Try XO Connect first, fallback to timestamp
  const nickname = await getNicknameFromXOConnectOrFallback();
  localStorage.setItem("sudoku_nickname", nickname);
  return nickname;
}

