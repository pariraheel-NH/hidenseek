/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameRole, Difficulty, Language } from '../types/game';
import { sounds } from '../utils/audio';
import { Shield, Flame, Play, Volume2, VolumeX, Sparkles, User } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (role: GameRole, name: string, difficulty: Difficulty) => void;
  language: Language;
  onToggleLanguage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedRole, setSelectedRole] = useState<GameRole>('HIDER');
  const [playerName, setPlayerName] = useState('Player 1');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');

  const isHindi = language === 'hi';

  const handleStart = () => {
    sounds.playClick();
    onStartGame(selectedRole, playerName.trim() || 'Player 1', difficulty);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      {/* Background Cover Image with atmospheric overlay scrim */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/src/assets/images/hide_and_seek_cover_1790253583613.jpg"
          alt="Hide and Seek Game Cover"
          className="w-full h-full object-cover opacity-35 scale-105 filter blur-[1px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-6 md:p-8 flex flex-col gap-6 my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black font-display tracking-wider text-rose-500">
              HIDE & SEEK
            </span>
            <span className="text-xs text-slate-400 border-l border-slate-700 pl-3">
              {isHindi ? '10 खिलाड़ियों का अस्तित्व खेल' : '10-Player Stealth Survival'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLanguage}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {isHindi ? 'English' : 'हिंदी (Hindi)'}
            </button>
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
          </div>
        </div>

        {/* Hero Concept Banner */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight text-white">
            {isHindi ? 'लुका छुपी: 10 खिलाड़ी, 1 किलर' : 'Hide and Seek: 10 Players, 1 Killer'}
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            {isHindi
              ? 'इस खेल में कुल 10 लोग होंगे: 1 Killer (जिसके सिर के ऊपर "KILLER" लिखा होगा) और 9 छुपने वाले। अपनी भूमिका चुनें और जीवित रहें!'
              : 'Match consists of exactly 10 players: 1 Killer (with "KILLER" written boldly over their head!) and 9 Hiders sneaking through mansion corridors, bushes, and lockers.'}
          </p>
        </div>

        {/* Highlight Rule Box */}
        <div className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center gap-3 text-red-200 text-xs md:text-sm">
          <span className="text-2xl">☠</span>
          <div>
            <span className="font-bold text-red-400">
              {isHindi ? 'मुख्य नियम:' : 'Core Rule:'}
            </span>{' '}
            {isHindi
              ? 'जो Killer होगा, उसके सिर के ऊपर लाल रंग में "KILLER" लिखा दिखाई देगा ताकि आप उसे दूर से पहचान सकें!'
              : 'Whoever is the Killer has "KILLER" written prominently in glowing red above their head so everyone can identify the danger!'}
          </div>
        </div>

        {/* Setup Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isHindi ? 'अपनी भूमिका चुनें (Select Your Role)' : 'Select Your Role'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Play as Hider */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('HIDER');
                  sounds.playClick();
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                  selectedRole === 'HIDER'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-900/60 flex items-center justify-center text-emerald-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {isHindi ? 'HIDER (छुपने वाला)' : 'PLAY AS HIDER'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {isHindi
                      ? 'Killer से छुपें, झाड़ियों व लॉकर का उपयोग करें'
                      : 'Evade Killer, hide in bushes & lockers'}
                  </div>
                </div>
              </button>

              {/* Play as Killer */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('KILLER');
                  sounds.playClick();
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                  selectedRole === 'KILLER'
                    ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg shadow-rose-950/50'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-rose-900/60 flex items-center justify-center text-rose-400">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {isHindi ? 'KILLER (हत्यारा)' : 'PLAY AS KILLER'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {isHindi
                      ? 'सिर पर "KILLER" बैज लेकर 9 लोगों को पकड़ें'
                      : 'Hunt down all 9 Hiders with KILLER badge'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Name & Difficulty */}
          <div className="flex flex-col gap-4">
            {/* Player Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {isHindi ? 'आपका नाम (Your Name)' : 'Your Name'}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="Enter player name"
              />
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHindi ? 'कठिनाई स्तर (Difficulty)' : 'Difficulty Level'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'NORMAL', 'NIGHTMARE'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setDifficulty(level);
                      sounds.playClick();
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      difficulty === level
                        ? 'bg-rose-900/50 border-rose-500 text-rose-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features / Quick Rules Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="text-base text-rose-500">10</span>
            <div>
              <p className="font-semibold text-white">10 Players Total</p>
              <p className="text-slate-400 text-[11px]">1 Killer + 9 Hiders</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-base text-emerald-400">🌿</span>
            <div>
              <p className="font-semibold text-white">Stealth Bushes</p>
              <p className="text-slate-400 text-[11px]">Conceals from sight</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-base text-blue-400">🚪</span>
            <div>
              <p className="font-semibold text-white">Metal Lockers</p>
              <p className="text-slate-400 text-[11px]">Jump in to hide (Space)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-base text-amber-400">⚡</span>
            <div>
              <p className="font-semibold text-white">Sprint & Items</p>
              <p className="text-slate-400 text-[11px]">Energy drinks & Decoys</p>
            </div>
          </div>
        </div>

        {/* Start Game Action Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-xl font-display font-black text-lg md:text-xl tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-xl shadow-red-950/80 border border-red-500/50 flex items-center justify-center gap-3 transition-transform active:scale-[0.99] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>{isHindi ? 'खेल शुरू करें (START GAME)' : 'START GAME'}</span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
};
