"use client";

import { useState, useEffect, useCallback } from "react";

// Mark page as dynamic to prevent prerendering
export const dynamic = 'force-dynamic';
import Header from "./components/Header";
import SudokuGrid from "./components/SudokuGrid";
import Controls from "./components/Controls";
import StartModal from "./components/StartModal";
import Ranking from "./components/Ranking";
import { 
  getTodaySudoku, 
  getSudokuScores, 
  getPlayerScore,
  saveScore, 
  generateRankingData 
} from "../lib/sudokuService";
import { getOrGenerateNickname } from "../lib/nicknameUtils";

export default function Home() {
  // Track if game has started
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0); // Timer in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with empty grid
  const [grid, setGrid] = useState<number[][]>(
    Array(9).fill(null).map(() => Array(9).fill(0))
  );
  // Track which cells are initial clues (cannot be edited)
  const [initialClues, setInitialClues] = useState<boolean[][]>(
    Array(9).fill(null).map(() => Array(9).fill(false))
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errorCells, setErrorCells] = useState<boolean[][]>(
    Array(9).fill(null).map(() => Array(9).fill(false))
  );
  const [solution, setSolution] = useState<number[][]>(
    Array(9).fill(null).map(() => Array(9).fill(0))
  );
  const [hasSolution, setHasSolution] = useState(false);
  const [sudokuId, setSudokuId] = useState<number | null>(null);
  const [playerNickname, setPlayerNickname] = useState<string>("");
  const [rankingData, setRankingData] = useState<{
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
  } | null>(null);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [hasAlreadyPlayed, setHasAlreadyPlayed] = useState(false);

  // Function to check for conflicts in row, column, and 3x3 box
  const checkConflicts = (grid: number[][], row: number, col: number): boolean => {
    const value = grid[row][col];
    if (value === 0) return false;

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === value) {
        return true;
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === value) {
        return true;
      }
    }

    // Check 3x3 box
    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    for (let r = boxRowStart; r < boxRowStart + 3; r++) {
      for (let c = boxColStart; c < boxColStart + 3; c++) {
        if (r !== row && c !== col && grid[r][c] === value) {
          return true;
        }
      }
    }

    return false;
  };

  // Function to calculate all errors in the grid
  const calculateErrors = useCallback((grid: number[][]): boolean[][] => {
    const errors: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
    
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) {
          errors[r][c] = checkConflicts(grid, r, c);
        }
      }
    }
    
    return errors;
  }, []);

  // Load puzzle from Supabase on mount and check if player has already played
  useEffect(() => {
    const loadPuzzleAndCheckPlayed = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get or generate player nickname (tries XO Connect first, then fallback)
        const nickname = await getOrGenerateNickname();
        setPlayerNickname(nickname);
        
        // Load today's puzzle
        const sudokuData = await getTodaySudoku();
        setSudokuId(sudokuData.id);
        
        // Check if player has already played today
        const playerScore = await getPlayerScore(sudokuData.id, nickname);
        
        if (playerScore) {
          // Player has already played, show leaderboard directly
          setHasAlreadyPlayed(true);
          setIsLoadingRanking(true);
          
          try {
            // Fetch all scores for this sudoku
            const scores = await getSudokuScores(sudokuData.id);
            
            // Generate ranking data
            const ranking = generateRankingData(scores, nickname, playerScore.time_seconds);
            setRankingData(ranking);
          } catch (err) {
            console.error('Error loading ranking:', err);
            setError(err instanceof Error ? err.message : 'Failed to load ranking');
          } finally {
            setIsLoadingRanking(false);
          }
        } else {
          // Player hasn't played yet, load puzzle for game
          const clues: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
          
          // Set initial grid and track which cells are clues
          const newGrid = sudokuData.puzzle.map((row, r) =>
            row.map((cell, c) => {
              if (cell !== 0) {
                clues[r][c] = true;
              }
              return cell;
            })
          );
          
          setGrid(newGrid);
          setInitialClues(clues);
          setSolution(sudokuData.solution);
          // Check if solution is valid (not all zeros)
          const hasValidSolution = sudokuData.solution.some(row => 
            row.some(cell => cell !== 0)
          );
          setHasSolution(hasValidSolution);
          setErrorCells(calculateErrors(newGrid));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load puzzle');
        console.error('Error loading puzzle:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPuzzleAndCheckPlayed();
  }, [calculateErrors]);

  // Recalculate errors whenever grid changes
  useEffect(() => {
    setErrorCells(calculateErrors(grid));
  }, [grid, calculateErrors]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, isCompleted]);

  // Check if puzzle is completed correctly
  const checkCompletion = useCallback((currentGrid: number[][]) => {
    // Check if all cells are filled
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] === 0) {
          return false;
        }
      }
    }
    
    // Check if there are any errors (conflicts)
    const errors = calculateErrors(currentGrid);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (errors[r][c]) {
          return false;
        }
      }
    }
    
    // Only check against solution if we have a valid solution
    // If no solution is available, completion is valid if all cells are filled and no errors
    if (hasSolution) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (currentGrid[r][c] !== solution[r][c]) {
            return false;
          }
        }
      }
    }
    
    return true;
  }, [solution, calculateErrors, hasSolution]);

  // Check completion whenever grid changes
  useEffect(() => {
    if (gameStarted && !isCompleted) {
      const completed = checkCompletion(grid);
      if (completed) {
        setIsCompleted(true);
        setIsTimerRunning(false);
      }
    }
  }, [grid, gameStarted, isCompleted, checkCompletion]);

  const handleCellClick = (row: number, col: number) => {
    // Only allow selection of non-clue cells
    if (!initialClues[row][col]) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberClick = (number: number) => {
    if (selectedCell && !initialClues[selectedCell.row][selectedCell.col]) {
      const newGrid = grid.map((row, r) =>
        row.map((cell, c) => {
          if (r === selectedCell.row && c === selectedCell.col) {
            return number;
          }
          return cell;
        })
      );
      setGrid(newGrid);
    }
  };

  const handleDelete = () => {
    if (selectedCell && !initialClues[selectedCell.row][selectedCell.col]) {
      const newGrid = grid.map((row, r) =>
        row.map((cell, c) => {
          if (r === selectedCell.row && c === selectedCell.col) {
            return 0;
          }
          return cell;
        })
      );
      setGrid(newGrid);
    }
  };

  const handleStart = (nickname: string) => {
    setPlayerNickname(nickname);
    setGameStarted(true);
    setIsTimerRunning(true);
    setTimer(0);
  };

  // Format timer as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save score and load ranking data when game is completed
  useEffect(() => {
    const saveScoreAndLoadRanking = async () => {
      if (isCompleted && sudokuId && playerNickname) {
        setIsLoadingRanking(true);
        
        // Save the player's score first (critical operation)
        try {
          await saveScore(sudokuId, playerNickname, timer);
          console.log('Score saved successfully:', { sudokuId, playerNickname, timeSeconds: timer });
        } catch (saveError) {
          console.error('Error saving score:', saveError);
          setError(`Failed to save score: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
          setIsLoadingRanking(false);
          return; // Don't continue if score save fails
        }
        
        // Fetch all scores for this sudoku and load ranking
        try {
          const scores = await getSudokuScores(sudokuId);
          
          // Generate ranking data
          const ranking = generateRankingData(scores, playerNickname, timer);
          setRankingData(ranking);
        } catch (err) {
          console.error('Error loading ranking:', err);
          // Score was saved successfully, so just show a warning
          setError(`Score saved, but failed to load ranking: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setIsLoadingRanking(false);
        }
      }
    };

    saveScoreAndLoadRanking();
  }, [isCompleted, sudokuId, playerNickname, timer]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#000000] font-sans">
        <div className="text-white text-xl">Loading puzzle...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#000000] font-sans">
        <div className="text-red-500 text-xl text-center px-4">
          <p className="mb-2">Error loading puzzle</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#000000] font-sans overflow-hidden">
      {/* Show leaderboard if player has already played today */}
      {hasAlreadyPlayed && (
        <div className="w-full h-full overflow-y-auto">
          {isLoadingRanking ? (
            <div className="flex h-screen items-center justify-center bg-[#000000] font-sans">
              <div className="text-white text-xl">Loading leaderboard...</div>
            </div>
          ) : rankingData ? (
            <Ranking
              topPlayers={rankingData.topPlayers}
              currentUser={rankingData.currentUser}
            />
          ) : (
            <div className="flex h-screen items-center justify-center bg-[#000000] font-sans">
              <div className="text-red-500 text-xl text-center px-4">
                <p>Error loading leaderboard</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Show game interface if player hasn't played yet */}
      {!hasAlreadyPlayed && (
        <>
          {!gameStarted && <StartModal onStart={handleStart} />}
          
          {gameStarted && !isCompleted && (
        <main className="flex h-full w-full flex-col items-center justify-center px-4 py-1 mx-auto">
          <div className="flex flex-col items-center justify-between h-full w-full max-w-sm gap-0">
            <Header timer={formatTime(timer)} isCompleted={isCompleted} />
            
            <div className="flex-1 flex flex-col items-start justify-start w-full min-h-0">
              <SudokuGrid 
                grid={grid}
                initialClues={initialClues}
                errorCells={errorCells}
                onCellClick={handleCellClick}
                selectedCell={selectedCell}
              />

            <Controls
              onNumberClick={handleNumberClick}
              onDelete={handleDelete}
            />
            </div>

            
          </div>
        </main>
      )}

            {gameStarted && isCompleted && (
              <div className="w-full h-full overflow-y-auto">
                {isLoadingRanking ? (
                  <div className="flex h-screen items-center justify-center bg-[#000000] font-sans">
                    <div className="text-white text-xl">Loading leaderboard...</div>
                  </div>
                ) : rankingData ? (
                  <Ranking
                    topPlayers={rankingData.topPlayers}
                    currentUser={rankingData.currentUser}
                  />
                ) : (
                  <div className="flex h-screen items-center justify-center bg-[#000000] font-sans">
                    <div className="text-red-500 text-xl text-center px-4">
                      <p>Error loading leaderboard</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
    </div>
  );
}
