"use client";

interface SudokuGridProps {
  grid: number[][];
  initialClues?: boolean[][];
  errorCells?: boolean[][];
  onCellClick?: (row: number, col: number) => void;
  selectedCell?: { row: number; col: number } | null;
}

export default function SudokuGrid({ 
  grid, 
  initialClues,
  errorCells,
  onCellClick, 
  selectedCell 
}: SudokuGridProps) {
  return (
    <div className="w-full px-2">
      <div 
        className="grid grid-cols-9 rounded-xl overflow-hidden bg-[#111111] p-1" 
        style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)' }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Determine border classes for 3x3 boxes
            const isRightBorder = colIndex === 2 || colIndex === 5;
            const isBottomBorder = rowIndex === 2 || rowIndex === 5;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isInSelectedRow = selectedCell && selectedCell.row === rowIndex;
            const isInSelectedColumn = selectedCell && selectedCell.col === colIndex;
            const isClue = initialClues?.[rowIndex]?.[colIndex] ?? false;
            const hasError = errorCells?.[rowIndex]?.[colIndex] ?? false;
            
            // Determine background color (error takes priority)
            let bgColor = 'bg-[#111111]';
            if (hasError) {
              bgColor = 'bg-[#FF4444]/20';
            } else if (isSelected) {
              bgColor = 'bg-[#6D41E2]/20';
            } else if (isInSelectedRow || isInSelectedColumn) {
              bgColor = 'bg-[#6D41E2]/10';
            }
            
            // Determine text color (error takes priority)
            let textColor = '';
            if (hasError) {
              textColor = 'text-2xl font-semibold text-[#FF4444]';
            } else if (isClue) {
              textColor = 'text-2xl font-bold text-[#FFFFFF]';
            } else {
              textColor = 'text-2xl font-semibold text-[#8F5EFF]';
            }
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick?.(rowIndex, colIndex)}
                className={`
                  aspect-square flex items-center justify-center
                  border border-[rgba(255,255,255,0.08)]
                  ${isRightBorder ? 'border-r-2 border-r-[rgba(255,255,255,0.15)]' : ''}
                  ${isBottomBorder ? 'border-b-2 border-b-[rgba(255,255,255,0.15)]' : ''}
                  ${bgColor}
                  ${textColor}
                  tracking-wide
                  ${isClue ? 'cursor-not-allowed opacity-90' : 'hover:bg-[#151515] cursor-pointer'}
                  transition-colors
                `}
              >
                {cell === 0 ? '' : cell}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

