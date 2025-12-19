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
 * Only works in browser environment (client-side)
 * @returns A nickname string from XO Connect or timestamp-based fallback
 */
export async function getNicknameFromXOConnectOrFallback(): Promise<string> {
  // Only try XO Connect in browser environment
  if (typeof window === 'undefined') {
    return generateTimestampNickname();
  }

  try {
    // Dynamically import XO Connect to avoid SSR issues
    const { XOConnect } = await import("xo-connect");
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
 * Priority: XO Connect (1st) > localStorage (2nd) > timestamp (3rd)
 * Only works in browser environment (client-side)
 * @returns A nickname string
 */
export async function getOrGenerateNickname(): Promise<string> {
  // Only access browser APIs in browser environment
  if (typeof window === 'undefined') {
    return generateTimestampNickname();
  }

  // Priority 1: Try XO Connect first
  try {
    const { XOConnect } = await import("xo-connect");
    const client = await XOConnect.getClient();
    
    // Check if client has a valid alias
    if (client?.alias && typeof client.alias === 'string' && client.alias.trim().length > 0) {
      const nickname = client.alias.trim();
      // Save to localStorage for future use
      localStorage.setItem("sudoku_nickname", nickname);
      return nickname;
    }
  } catch (error) {
    // XO Connect not available or error occurred, continue to next priority
    console.log('XO Connect not available, trying localStorage:', error);
  }
  
  // Priority 2: Check localStorage
  const savedNickname = localStorage.getItem("sudoku_nickname");
  if (savedNickname) {
    return savedNickname;
  }
  
  // Priority 3: Generate timestamp-based nickname
  const nickname = generateTimestampNickname();
  localStorage.setItem("sudoku_nickname", nickname);
  return nickname;
}

