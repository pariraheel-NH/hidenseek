/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameRole, Language } from '../types/game';
import { sounds } from '../utils/audio';
import { RotateCcw, Home, Trophy, Skull } from 'lucide-react';

interface GameOverModalProps {
  isVictory: boolean;
  userRole: GameRole;
  caughtCount: number;
  totalHiders: number;
  timeSurvived: number;
  rescuesCount: number;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
  language: Language;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  userRole,
  caughtCount,
  totalHiders,
  timeSurvived,
  rescuesCount,
  onPlayAgain,
  onReturnToMenu,
  language,
}) => {
  const isHindi = language === 'hi';

  const mins = Math.floor(timeSurvived / 60);
  const secs = Math.floor(timeSurvived % 60);
  const timeFormatted = `${mins}m ${secs}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-center">
        {/* Victory/Defeat Icon */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl border ${
              isVictory
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-400'
                : 'bg-red-950/80 border-red-500/80 text-red-500'
            }`}
          >
            {isVictory ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
          </div>
        </div>

        {/* Title & Reason */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-3xl font-black font-display tracking-wide text-white">
            {isVictory
              ? isHindi
                ? 'विजय! (VICTORY)'
                : 'VICTORY!'
              : isHindi
              ? 'हार! (DEFEAT)'
              : 'GAME OVER'}
          </h2>
          <p className="text-sm text-slate-300">
            {userRole === 'KILLER'
              ? isVictory
                ? isHindi
                  ? 'शाबाश! आपने सभी 9 छुपने वालों को ढूंढ कर पकड़ लिया!'
                  : 'Brilliant hunting! You eliminated all 9 Hiders before time ran out.'
                : isHindi
                ? 'समय समाप्त! कुछ छुपने वाले बच निकलने में सफल रहे।'
                : 'Time expired! Some hiders managed to stay hidden and survived.'
              : isVictory
              ? isHindi
                ? 'अद्भुत! आप 120 सेकंड तक KILLER से बचकर जीवित रहे!'
                : 'Incredible stealth! You survived the full duration against the KILLER.'
              : isHindi
              ? 'ओह! KILLER ने आपको पकड़ लिया और पिंजरे में डाल दिया।'
              : 'The KILLER hunted you down and threw you in the cage!'}
          </p>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-slate-300">
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">
              {isHindi ? 'पकड़े गए' : 'Caught'}
            </span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">
              {caughtCount}/{totalHiders}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">
              {isHindi ? 'समय' : 'Time'}
            </span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">
              {timeFormatted}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">
              {isHindi ? 'बचाव' : 'Rescues'}
            </span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">
              {rescuesCount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isHindi ? 'फिर से खेलें (Play Again)' : 'Play Again'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onReturnToMenu();
            }}
            className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            <Home className="w-4 h-4" />
            <span>{isHindi ? 'मुख्य मेनू' : 'Main Menu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
