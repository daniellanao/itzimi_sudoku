"use client";

import { useState } from "react";
import { getOrGenerateNickname } from "../../lib/nicknameUtils";
import Image from "next/image";
interface StartModalProps {
  onStart: (nickname: string) => void;
}

export default function StartModal({ onStart }: StartModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      // Automatically generate or get nickname (tries XO Connect first, then fallback)
      const nickname = await getOrGenerateNickname();
      onStart(nickname);
    } catch (error) {
      console.error('Error getting nickname:', error);
      // Fallback to timestamp-based nickname
      const { generateTimestampNickname } = await import("../../lib/nicknameUtils");
      const fallbackNickname = generateTimestampNickname();
      localStorage.setItem("sudoku_nickname", fallbackNickname);
      onStart(fallbackNickname);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/95 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#FFFFFF] tracking-tight mb-2">
            ITZIMI's Sudoku
          </h2>

          <div className="flex justify-center">
            <Image src="/itzimi_sudoku.png" alt="Itzimi's Sudoku" width={200} height={200} className="mb-4" />
          </div>

          
          <p className="text-base font-bold mb-1">
            ¡Nuevo reto diario disponible!
          </p>
          <p className="text-base text-[#8A8A8A] tracking-wide mb-1">
            Solo puedes jugar una vez al día.<br/> ¿Listo para intentarlo?
          </p>
          <p className="text-xs text-[#8A8A8A] tracking-wide">
            ⏱️ Tu tiempo comienza al iniciar el juego y se detiene al completarlo correctamente.<br />
            🏆 Compite por un lugar en el ranking diario y semanal!
          </p>
        </div>
        
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full px-8 py-6 rounded-2xl font-bold text-xl text-white tracking-wide transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #8F5EFF 0%, #6D41E2 100%)',
            boxShadow: '0 8px 30px rgba(143, 94, 255, 0.4)'
          }}
        >
          {isLoading ? 'Loading...' : 'START'}
        </button>
      </div>
    </div>
  );
}

