interface HeaderProps {
  timer?: string;
  isCompleted?: boolean;
}

export default function Header({ timer, isCompleted }: HeaderProps) {
  return (
    <header className="w-full flex flex-col items-center gap-0 pb-1">
      <h1 className="text-xl font-bold text-[#FFFFFF] tracking-tight">
        ITZIMI Sudoku
      </h1>
      <div className="flex items-center gap-2">
        <p className="text-xs text-[#8A8A8A] tracking-wide">
          Daily Challenge
        </p>
        {timer && (
          <p className={`text-xs font-semibold tracking-wide ${isCompleted ? 'text-[#00D26A]' : 'text-[#8F5EFF]'}`}>
            {timer}
          </p>
        )}
      </div>
    </header>
  );
}

