"use client";

import { getOrGenerateNickname } from "../../lib/nicknameUtils";

interface StartModalProps {
  onStart: (nickname: string) => void;
}

export default function StartModal({ onStart }: StartModalProps) {
  const handleStart = () => {
    // Automatically generate or get nickname from localStorage
    const nickname = getOrGenerateNickname();
    onStart(nickname);
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/95 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#FFFFFF] tracking-tight mb-2">
            ITZIMI's Sudoku
          </h2>
          <p className="text-base text-[#8A8A8A] tracking-wide">
            Daily Challenge
          </p>
        </div>
        
        <button
          onClick={handleStart}
          className="w-full px-8 py-6 rounded-2xl font-bold text-xl text-white tracking-wide transition-all hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #8F5EFF 0%, #6D41E2 100%)',
            boxShadow: '0 8px 30px rgba(143, 94, 255, 0.4)'
          }}
        >
          START
        </button>
      </div>
    </div>
  );
}

