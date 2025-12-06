"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import SudokuGrid from "./components/SudokuGrid";
import Controls from "./components/Controls";
import StartModal from "./components/StartModal";
import Ranking from "./components/Ranking";
import puzzleData from "./data/sudoku-puzzle.json";

export default function Home() {
  // Track if game has started
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0); // Timer in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
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
  const [solution] = useState<number[][]>(puzzleData.solution);

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

  // Load puzzle on mount
  useEffect(() => {
    const loadPuzzle = () => {
      const puzzle = puzzleData.puzzle;
      const clues: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
      
      // Set initial grid and track which cells are clues
      const newGrid = puzzle.map((row, r) =>
        row.map((cell, c) => {
          if (cell !== 0) {
            clues[r][c] = true;
          }
          return cell;
        })
      );
      
      setGrid(newGrid);
      setInitialClues(clues);
      setErrorCells(calculateErrors(newGrid));
    };

    loadPuzzle();
  }, []);

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
    
    // Check if grid matches solution
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] !== solution[r][c]) {
          return false;
        }
      }
    }
    
    return true;
  }, [solution, calculateErrors]);

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

  const handleStart = () => {
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

  // Generate mock ranking data
  const generateMockRanking = useCallback((userTime: number) => {
    // Generate mock top players with varied times
    const mockPlayers = [
      { nickname: "SudokuMaster", time: Math.max(45, userTime * 0.3), improved: true },
      { nickname: "PuzzlePro", time: Math.max(60, userTime * 0.4), improved: false },
      { nickname: "GridGuru", time: Math.max(75, userTime * 0.5), improved: true },
      { nickname: "NumberNinja", time: Math.max(90, userTime * 0.6), improved: false },
      { nickname: "LogicLegend", time: Math.max(105, userTime * 0.7), improved: true },
      { nickname: "BrainBox", time: Math.max(120, userTime * 0.8), improved: false },
      { nickname: "MindMaster", time: Math.max(135, userTime * 0.9), improved: true },
      { nickname: "QuickSolve", time: Math.max(150, userTime * 1.0), improved: false },
    ];

    // Add user to the list
    const allPlayers = [...mockPlayers, { nickname: "You", time: userTime, improved: true }];

    // Sort by time (ascending - lower is better)
    allPlayers.sort((a, b) => a.time - b.time);

    // Find user position
    const userIndex = allPlayers.findIndex(p => p.nickname === "You");
    const userPosition = userIndex + 1;

    // Get top 6 (excluding user if they're in top 6)
    const top6 = allPlayers
      .filter((p, idx) => p.nickname !== "You" || idx >= 6)
      .slice(0, 6)
      .map((p, idx) => ({
        position: idx + 1,
        nickname: p.nickname,
        time: p.time,
        improved: p.improved,
      }));

    // If user is in top 6, replace the 6th player
    if (userPosition <= 6) {
      top6[userPosition - 1] = {
        position: userPosition,
        nickname: "You",
        time: userTime,
        improved: true,
      };
    }

    return {
      topPlayers: top6,
      currentUser: {
        position: userPosition,
        nickname: "You",
        time: userTime,
        improved: true,
      },
    };
  }, []);

  // Generate ranking data when completed
  const rankingData = isCompleted ? generateMockRanking(timer) : null;

  return (
    <div className="flex h-screen items-center justify-center bg-[#000000] font-sans overflow-hidden">
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

      {gameStarted && isCompleted && rankingData && (
        <div className="w-full h-full overflow-y-auto">
          <Ranking
            topPlayers={rankingData.topPlayers}
            currentUser={rankingData.currentUser}
          />
        </div>
      )}
    </div>
  );
}
