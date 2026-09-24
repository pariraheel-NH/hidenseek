/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, GameRole, Language } from '../types/game';
import { Volume2, VolumeX, Pause, Play, HelpCircle, Shield, Flame } from 'lucide-react';

interface HUDProps {
  players: Player[];
  userRole: GameRole;
  timeRemaining: number;
  isPaused: boolean;
  onTogglePause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenHelp: () => void;
  killerDistance: number;
}

export const HUD: React.FC<HUDProps> = ({
  players,
  userRole,
  timeRemaining,
  isPaused,
  onTogglePause,
  soundEnabled,
  onToggleSound,
  language,
  onToggleLanguage,
  onOpenHelp,
  killerDistance,
}) => {
  const killer = players.find((p) => p.isKiller);
  const hiders = players.filter((p) => !p.isKiller);
  const caughtCount = hiders.filter((p) => p.isCaught).length;
  const aliveCount = hiders.length - caughtCount;

  // Format timer
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrdu = language === 'ur';

  // Killer closeness alert
  const isKillerClose = userRole === 'HIDER' && killerDistance < 350;

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 md:p-4 flex flex-col gap-2">
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <div className="flex items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-xl shadow-xl pointer-events-auto">
        {/* Zone 1: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-lg md:text-xl tracking-wider text-rose-500">
              HIDE & SEEK
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {isUrdu ? '10 Khilari Survival Game' : '10-Player Survival'}
            </span>
          </div>

          {/* User Role Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-700">
            {userRole === 'KILLER' ? (
              <>
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-400">YOU: KILLER</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">YOU: HIDER</span>
              </>
            )}
          </div>
        </div>

        {/* Zone 2: Timer & Objective */}
        <div className="flex items-center gap-4">
          {/* Match Countdown */}
          <div className="flex items-center gap-2">
            <div className={`font-mono text-xl md:text-2xl font-bold tracking-wider tabular-nums ${timeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-slate-100'}`}>
              {timeFormatted}
            </div>
          </div>

          {/* Objective Summary */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300">
            {userRole === 'KILLER' ? (
              <span>
                {isUrdu
                  ? `Tamam 9 chupne walon ko pakrein! (${caughtCount}/9 pakre gaye)`
                  : `Hunt all 9 Hiders! (${caughtCount}/9 Caught)`}
              </span>
            ) : (
              <span>
                {isUrdu
                  ? `Waqt khatam hone tak zinda rahein! (${aliveCount}/9 zinda)`
                  : `Survive until time expires! (${aliveCount}/9 Free)`}
              </span>
            )}
          </div>
        </div>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2">
          {/* Proximity Heartbeat Indicator (When Hider) */}
          {userRole === 'HIDER' && (
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                isKillerClose
                  ? 'bg-red-950/80 border-red-500/80 text-red-300 animate-pulse'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <span className={`text-sm ${isKillerClose ? 'text-red-500 animate-bounce' : 'text-slate-500'}`}>
                ♥
              </span>
              <span className="hidden sm:inline font-mono">
                {isKillerClose
                  ? isUrdu
                    ? 'Khatra! KILLER qareeb hai!'
                    : 'DANGER! KILLER NEAR!'
                  : isUrdu
                  ? 'Mehfooz'
                  : 'SAFE'}
              </span>
            </div>
          )}

          {/* Roman Urdu / English Toggle */}
          <button
            onClick={onToggleLanguage}
            title="Toggle Language"
            className="px-2 py-1 text-xs font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            {language.toUpperCase()}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Pause */}
          <button
            onClick={onTogglePause}
            title={isPaused ? 'Resume' : 'Pause'}
            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Help */}
          <button
            onClick={onOpenHelp}
            title="Game Rules"
            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Second Row: 10 Players Roster Strip (Total 10: 1 Killer + 9 Hiders) */}
      <div className="bg-slate-950/75 backdrop-blur-sm border border-slate-800/60 px-3 py-1.5 rounded-lg shadow-md flex items-center justify-between gap-2 overflow-x-auto pointer-events-auto">
        {/* Killer Badge (prominent) */}
        {killer && (
          <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-800">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/90 border border-red-500/70 text-red-300 shadow-sm animate-killer-glow">
              <span className="text-xs">☠</span>
              <span className="text-xs font-black tracking-wide font-display">KILLER</span>
              {killer.isPlayer && (
                <span className="text-[10px] bg-red-500 text-slate-950 font-bold px-1 rounded">
                  YOU
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 tabular-nums">
              {caughtCount}/9 {isUrdu ? 'Shikar' : 'Caught'}
            </span>
          </div>
        )}

        {/* 9 Hiders Status Badges */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] text-slate-500 uppercase font-semibold shrink-0">
            {isUrdu ? 'Chupne wale (9):' : 'Hiders (9):'}
          </span>
          {hiders.map((hider, idx) => (
            <div
              key={hider.id}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-opacity shrink-0 border ${
                hider.isCaught
                  ? 'bg-slate-900/60 text-slate-500 border-slate-800 line-through opacity-60'
                  : hider.isHidingInLocker
                  ? 'bg-blue-950/70 text-blue-300 border-blue-600/50'
                  : hider.isHidingInBush
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50'
                  : 'bg-slate-900 text-slate-200 border-slate-700/60'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: hider.isCaught ? '#64748b' : hider.color }}
              />
              <span className="font-medium truncate max-w-[65px]">
                {hider.isPlayer ? 'YOU' : hider.name}
              </span>
              {hider.isCaught && <span className="text-[9px] text-red-400 ml-0.5">⛓</span>}
              {hider.isHidingInBush && !hider.isCaught && (
                <span className="text-[9px] text-emerald-400">🌿</span>
              )}
              {hider.isHidingInLocker && !hider.isCaught && (
                <span className="text-[9px] text-blue-400">🚪</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};
