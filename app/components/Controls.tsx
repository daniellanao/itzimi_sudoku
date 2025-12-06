"use client";

interface ControlsProps {
  onNumberClick?: (number: number) => void;
  onDelete?: () => void;
}

export default function Controls({ 
  onNumberClick, 
  onDelete 
}: ControlsProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full flex gap-2 px-2">
      {/* Numbers 1-9 */}
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick?.(num)}
          className="flex-1 aspect-square rounded-xl font-semibold text-base text-[#FFFFFF] tracking-wide transition-all hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #8F5EFF 0%, #6D41E2 100%)',
            boxShadow: '0 4px 15px rgba(143, 94, 255, 0.3)'
          }}
        >
          {num}
        </button>
      ))}
      
      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="flex-1 aspect-square rounded-xl font-semibold text-base text-[#FFFFFF] tracking-wide bg-[#111111] border border-[rgba(255,255,255,0.08)] transition-all hover:bg-[#151515] active:scale-95"
      >
        X
      </button>
    </div>
  );
}

