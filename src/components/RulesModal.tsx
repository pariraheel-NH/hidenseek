/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types/game';
import { sounds } from '../utils/audio';
import { X, Keyboard, Shield, Flame, Trees, DoorClosed, HeartHandshake } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
  language: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose, language }) => {
  const isHindi = language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xl font-bold font-display text-white">
            {isHindi ? 'खेल के नियम और नियंत्रण' : 'Rules & Controls'}
          </h3>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10 Players Rule Clarification */}
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3.5 flex items-start gap-3">
          <span className="text-2xl mt-0.5">☠</span>
          <div className="text-xs text-slate-300 flex flex-col gap-1">
            <span className="font-bold text-red-400 text-sm">
              {isHindi ? '10 लोग और 1 KILLER:' : '10 People & 1 KILLER:'}
            </span>
            <p>
              {isHindi
                ? 'इस गेम में कुल 10 लोग होते हैं: 1 Killer और 9 Hiders। जो Killer होगा उसके सिर के ऊपर "KILLER" का लाल चमकता हुआ बैज लगा होता है ताकि आप उसे पहचान सकें!'
                : 'Exactly 10 players participate in every match: 1 Killer and 9 Hiders. Whoever is the Killer has "KILLER" written boldly in red above their head!'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-rose-500" />
            <span>{isHindi ? 'नियंत्रण (Controls)' : 'Game Controls'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-white">WASD / Arrow Keys</span>
              <span className="text-slate-400">
                {isHindi ? 'चलना / मुड़ना (Move)' : 'Move character'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-white">SHIFT Key / RUN Button</span>
              <span className="text-slate-400">
                {isHindi ? 'तेज़ दौड़ना (Sprint)' : 'Sprint boost'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-white">SPACE / E Key</span>
              <span className="text-slate-400">
                {isHindi ? 'लॉकर में छुपना / बाहर निकलना' : 'Enter / Exit Locker'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
              <span className="font-bold text-white">Touch / Drag</span>
              <span className="text-slate-400">
                {isHindi ? 'मोबाइल पर जॉयस्टिक' : 'Mobile on-screen joystick'}
              </span>
            </div>
          </div>
        </div>

        {/* Gameplay Mechanics */}
        <div className="flex flex-col gap-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Trees className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{isHindi ? 'हरी झाड़ियाँ (Bushes):' : 'Green Bushes:'}</strong>{' '}
              {isHindi
                ? 'झाड़ियों में घुसते ही आप Killer की नज़र से छुप जाते हैं।'
                : 'Walking into bushes makes you invisible to the Killer.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DoorClosed className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>{isHindi ? 'लॉकर (Lockers):' : 'Metal Lockers:'}</strong>{' '}
              {isHindi
                ? 'लॉकर के पास जाकर SPACE दबाएं और अंदर छुप जाएं।'
                : 'Stand near a locker and press Space to hide inside.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>{isHindi ? 'कैद और बचाव (Rescue):' : 'Prison Cage:'}</strong>{' '}
              {isHindi
                ? 'पकड़े गए साथियों को छुड़ाने के लिए पिंजरे के गेट के पास 2.5 सेकंड खड़े रहें!'
                : 'Free captured teammates by standing at the cage gate for 2.5s!'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
        >
          {isHindi ? 'समझ गया (Got it)' : 'Got it'}
        </button>
      </div>
    </div>
  );
};
