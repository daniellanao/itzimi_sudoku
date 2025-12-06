"use client";

interface ControlsProps {
  onNumberClick?: (number: number) => void;
  onDelete?: () => void;
}

export default function Controls({ 
  onNumberClick, 
  onDelete 
}: ControlsProps) {
  return (
    <div className="w-full flex flex-col gap-3 px-2">
      {/* First Row: 1, 2, 3, 4, 5 */}
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick?.(num)}
            className="flex-1 h-14 rounded-xl font-bold text-xl text-[#FFFFFF] tracking-wide transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #8F5EFF 0%, #6D41E2 100%)',
              boxShadow: '0 4px 15px rgba(143, 94, 255, 0.3)'
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Second Row: 6, 7, 8, 9, X */}
      <div className="flex gap-3">
        {[6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick?.(num)}
            className="flex-1 h-14 rounded-xl font-bold text-xl text-[#FFFFFF] tracking-wide transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #8F5EFF 0%, #6D41E2 100%)',
              boxShadow: '0 4px 15px rgba(143, 94, 255, 0.3)'
            }}
          >
            {num}
          </button>
        ))}
        <button
          onClick={onDelete}
          className="flex-1 h-14 rounded-xl font-bold text-xl text-[#FFFFFF] tracking-wide bg-[#111111] border border-[rgba(255,255,255,0.08)] transition-all hover:bg-[#151515] active:scale-95"
        >
          X
        </button>
      </div>
    </div>
  );
}

