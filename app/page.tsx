"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import SudokuGrid from "./components/SudokuGrid";
import Controls from "./components/Controls";
import puzzleData from "./data/sudoku-puzzle.json";

export default function Home() {
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

  return (
    <div className="flex h-screen items-center justify-center bg-[#000000] font-sans overflow-hidden">
      <main className="flex h-full w-full flex-col items-center justify-center px-4 py-4 mx-auto">
        <div className="flex flex-col items-center justify-between h-full w-full max-w-sm gap-3">
          <Header />
          
          <div className="flex-1 flex items-center justify-center w-full">
            <SudokuGrid 
              grid={grid}
              initialClues={initialClues}
              errorCells={errorCells}
              onCellClick={handleCellClick}
              selectedCell={selectedCell}
            />
          </div>

          <Controls
            onNumberClick={handleNumberClick}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}
