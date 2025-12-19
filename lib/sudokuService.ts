import { supabase } from './supabaseClient';
import { parsePuzzleString } from './puzzleUtils';

export interface SudokuData {
  id: number;
  puzzle: number[][];
  solution: number[][];
  playDate: string;
}

export interface Score {
  id: number;
  sudoku_id: number;
  player_nickname: string;
  time_seconds: number;
  created_at: string;
}

export interface RankingData {
  topPlayers: Array<{
    position: number;
    nickname: string;
    time: number;
    improved?: boolean;
  }>;
  currentUser: {
    position: number;
    nickname: string;
    time: number;
    improved?: boolean;
  };
}

/**
 * Fetches the sudoku puzzle for today's date
 * @returns SudokuData with puzzle and solution grids
 */
export async function getTodaySudoku(): Promise<SudokuData> {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('sudokus')
    .select('id, play_date, puzzle, solution')
    .eq('play_date', today)
    .single();

  if (error) {
    throw new Error(`Failed to fetch sudoku: ${error.message}`);
  }

  if (!data) {
    throw new Error(`No sudoku found for date: ${today}`);
  }

  if (!data.puzzle) {
    throw new Error('Puzzle data is missing');
  }

  // Parse puzzle string into 9x9 grid
  const puzzle = parsePuzzleString(data.puzzle);
  
  // Parse solution if available, otherwise return empty grid
  let solution: number[][];
  if (data.solution) {
    solution = parsePuzzleString(data.solution);
  } else {
    // If no solution provided, create empty grid (you might want to handle this differently)
    solution = Array(9).fill(null).map(() => Array(9).fill(0));
  }

  return {
    id: data.id,
    puzzle,
    solution,
    playDate: data.play_date,
  };
}

/**
 * Checks if a player has already played a specific sudoku
 * @param sudokuId - The ID of the sudoku puzzle
 * @param playerNickname - The player's nickname
 * @returns The player's score if they have played, null otherwise
 */
export async function getPlayerScore(
  sudokuId: number,
  playerNickname: string
): Promise<Score | null> {
  const { data, error } = await supabase
    .from('sudoku_scores')
    .select('id, sudoku_id, player_nickname, time_seconds, created_at')
    .eq('sudoku_id', sudokuId)
    .eq('player_nickname', playerNickname)
    .single();

  if (error) {
    // If no row found, return null (player hasn't played)
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to check player score: ${error.message}`);
  }

  return data;
}

/**
 * Fetches the leaderboard scores for a specific sudoku
 * @param sudokuId - The ID of the sudoku puzzle
 * @returns Array of scores sorted by time (ascending)
 */
export async function getSudokuScores(sudokuId: number): Promise<Score[]> {
  const { data, error } = await supabase
    .from('sudoku_scores')
    .select('id, sudoku_id, player_nickname, time_seconds, created_at')
    .eq('sudoku_id', sudokuId)
    .order('time_seconds', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch scores: ${error.message}`);
  }

  return data || [];
}

/**
 * Saves a player's score to the database
 * @param sudokuId - The ID of the sudoku puzzle
 * @param playerNickname - The player's nickname
 * @param timeSeconds - The time taken in seconds
 * @returns The saved score
 */
export async function saveScore(
  sudokuId: number,
  playerNickname: string,
  timeSeconds: number
): Promise<Score> {
  // Check if player already has a score for this sudoku
  const { data: existingScore } = await supabase
    .from('sudoku_scores')
    .select('id, sudoku_id, player_nickname, time_seconds, created_at')
    .eq('sudoku_id', sudokuId)
    .eq('player_nickname', playerNickname)
    .single();

  if (existingScore) {
    // Update if new time is better (lower)
    if (timeSeconds < existingScore.time_seconds) {
      const { data, error } = await supabase
        .from('sudoku_scores')
        .update({ time_seconds: timeSeconds })
        .eq('id', existingScore.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update score: ${error.message}`);
      }

      return data;
    } else {
      // Return existing score if it's better
      return existingScore as Score;
    }
  } else {
    // Insert new score
    const { data, error } = await supabase
      .from('sudoku_scores')
      .insert({
        sudoku_id: sudokuId,
        player_nickname: playerNickname,
        time_seconds: timeSeconds,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save score: ${error.message}`);
    }

    return data;
  }
}

/**
 * Generates ranking data from scores
 * @param scores - Array of scores from the database
 * @param currentPlayerNickname - The current player's nickname
 * @param currentPlayerTime - The current player's time
 * @returns RankingData with top players and current user info
 */
export function generateRankingData(
  scores: Score[],
  currentPlayerNickname: string,
  currentPlayerTime: number
): RankingData {
  // Find current player's position in the sorted scores
  const currentPlayerIndex = scores.findIndex(
    (s) => s.player_nickname === currentPlayerNickname
  );
  
  // Calculate position (1-indexed)
  // If player is found, use their index + 1
  // If not found, calculate where they would be based on their time
  let currentPlayerPosition: number;
  if (currentPlayerIndex >= 0) {
    currentPlayerPosition = currentPlayerIndex + 1;
  } else {
    // Player not in list, find where they would rank
    const betterScores = scores.filter(s => s.time_seconds < currentPlayerTime).length;
    currentPlayerPosition = betterScores + 1;
  }

  // Get top 6 players
  const top6 = scores.slice(0, 6).map((score, index) => ({
    position: index + 1,
    nickname: score.player_nickname,
    time: score.time_seconds,
    improved: false, // Could be enhanced to track improvements
  }));

  // If current player is in top 6, replace their position in the list
  if (currentPlayerPosition <= 6 && currentPlayerIndex >= 0) {
    top6[currentPlayerPosition - 1] = {
      position: currentPlayerPosition,
      nickname: currentPlayerNickname,
      time: currentPlayerTime,
      improved: true,
    };
  }

  return {
    topPlayers: top6,
    currentUser: {
      position: currentPlayerPosition,
      nickname: currentPlayerNickname,
      time: currentPlayerTime,
      improved: true,
    },
  };
}

