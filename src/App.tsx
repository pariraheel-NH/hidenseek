/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameRole,
  GameStatus,
  Difficulty,
  Language,
  Player,
  Obstacle,
  Bush,
  Locker,
  Collectible,
  NoiseRipple,
  BloodParticle,
  RescueCage,
} from './types/game';
import {
  INITIAL_OBSTACLES,
  INITIAL_BUSHES,
  INITIAL_LOCKERS,
  INITIAL_COLLECTIBLES,
  RESCUE_CAGE,
} from './game/mapData';
import { createInitialPlayers } from './game/playerInit';
import { updateGameState, getDist } from './game/physicsAndAI';
import { sounds } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';

export default function App() {
  // Game lifecycle
  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE_MENU');
  const [userRole, setUserRole] = useState<GameRole>('HIDER');
  const [userName, setUserName] = useState('Rohan');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [language, setLanguage] = useState<Language>('hi'); // Default to Hindi since user requested in Hindi!
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  // Match State
  const [players, setPlayers] = useState<Player[]>([]);
  const [obstacles] = useState<Obstacle[]>(INITIAL_OBSTACLES);
  const [bushes] = useState<Bush[]>(INITIAL_BUSHES);
  const [lockers, setLockers] = useState<Locker[]>(INITIAL_LOCKERS);
  const [collectibles, setCollectibles] = useState<Collectible[]>(INITIAL_COLLECTIBLES);
  const [noiseRipples, setNoiseRipples] = useState<NoiseRipple[]>([]);
  const [bloodParticles, setBloodParticles] = useState<BloodParticle[]>([]);
  const [rescueCage, setRescueCage] = useState<RescueCage>({ ...RESCUE_CAGE });

  // Timers & Stats
  const MATCH_DURATION = 120; // 2 minutes
  const [timeRemaining, setTimeRemaining] = useState(MATCH_DURATION);
  const [isVictory, setIsVictory] = useState(false);
  const [rescuesCount, setRescuesCount] = useState(0);

  // References for smooth animation loop
  const playersRef = useRef<Player[]>([]);
  const noiseRipplesRef = useRef<NoiseRipple[]>([]);
  const bloodParticlesRef = useRef<BloodParticle[]>([]);
  const rescueCageRef = useRef<RescueCage>({ ...RESCUE_CAGE });
  const lockersRef = useRef<Locker[]>(INITIAL_LOCKERS);
  const collectiblesRef = useRef<Collectible[]>(INITIAL_COLLECTIBLES);

  // Input states
  const inputVectorRef = useRef({ x: 0, y: 0 });
  const isSprintingRef = useRef(false);
  const lastTimeRef = useRef(performance.now());

  // Proximity to closest locker
  const [canInteractLocker, setCanInteractLocker] = useState(false);
  const [canInteractCage, setCanInteractCage] = useState(false);
  const [activeLockerId, setActiveLockerId] = useState<string | null>(null);

  // Start new match
  const handleStartGame = (role: GameRole, name: string, diff: Difficulty) => {
    setUserRole(role);
    setUserName(name);
    setDifficulty(diff);

    const initialPlayers = createInitialPlayers(role, name, diff);
    setPlayers(initialPlayers);
    playersRef.current = initialPlayers;

    // Reset map entities
    const freshLockers = INITIAL_LOCKERS.map((l) => ({ ...l, occupiedByPlayerId: null }));
    const freshCollectibles = INITIAL_COLLECTIBLES.map((c) => ({ ...c, collected: false }));
    const freshCage = { ...RESCUE_CAGE, unlockProgress: 0, isUnlocking: false };

    setLockers(freshLockers);
    lockersRef.current = freshLockers;
    setCollectibles(freshCollectibles);
    collectiblesRef.current = freshCollectibles;
    setRescueCage(freshCage);
    rescueCageRef.current = freshCage;
    setNoiseRipples([]);
    noiseRipplesRef.current = [];
    setBloodParticles([]);
    bloodParticlesRef.current = [];

    setTimeRemaining(MATCH_DURATION);
    setActiveLockerId(null);
    setRescuesCount(0);
    setGameStatus('PLAYING');

    if (soundEnabled) {
      sounds.startAmbience();
    }
  };

  // Play Again restart handler
  const handlePlayAgain = () => {
    handleStartGame(userRole, userName, difficulty);
  };

  // Return to Menu
  const handleReturnToMenu = () => {
    sounds.stopAmbience();
    setGameStatus('TITLE_MENU');
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setMuted(!next);
    if (!next) {
      sounds.stopAmbience();
    } else if (gameStatus === 'PLAYING') {
      sounds.startAmbience();
    }
  };

  // Language toggle
  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  // Locker interaction (Hide / Exit)
  const handleLockerToggle = useCallback(() => {
    const user = playersRef.current.find((p) => p.isPlayer);
    if (!user) return;

    if (user.isHidingInLocker) {
      // Exit locker
      user.isHidingInLocker = false;
      const locker = lockersRef.current.find((l) => l.id === user.lockerId);
      if (locker) {
        locker.occupiedByPlayerId = null;
        user.x = locker.x + locker.width / 2;
        user.y = locker.y + locker.height + 25;
      }
      user.lockerId = null;
      setActiveLockerId(null);
      sounds.playLocker(false);
    } else {
      // Try to enter closest unoccupied locker
      for (const locker of lockersRef.current) {
        if (!locker.occupiedByPlayerId) {
          const dist = getDist(user.x, user.y, locker.x + locker.width / 2, locker.y + locker.height / 2);
          if (dist < 55) {
            locker.occupiedByPlayerId = user.id;
            user.isHidingInLocker = true;
            user.lockerId = locker.id;
            setActiveLockerId(locker.id);
            sounds.playLocker(true);
            break;
          }
        }
      }
    }
  }, []);

  // Movement input callback from canvas
  const handleMoveInput = useCallback((vector: { x: number; y: number }, isSprinting: boolean) => {
    inputVectorRef.current = vector;
    isSprintingRef.current = isSprinting;
  }, []);

  // Main Game Loop (60 FPS)
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    let animId: number;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      // 1. Advance Match Countdown Timer
      setTimeRemaining((prev) => {
        const nextTime = Math.max(0, prev - dt);
        if (nextTime <= 0) {
          // Time expired! Evaluate match end
          const caught = playersRef.current.filter((p) => !p.isKiller && p.isCaught).length;
          if (userRole === 'KILLER') {
            // Killer loses if timer runs out before catching all 9
            setIsVictory(caught === 9);
            if (caught === 9) sounds.playVictory();
            else sounds.playDefeat();
          } else {
            // Hider wins if time runs out and player survived
            const userP = playersRef.current.find((p) => p.isPlayer);
            const userAlive = userP && !userP.isCaught;
            setIsVictory(!!userAlive);
            if (userAlive) sounds.playVictory();
            else sounds.playDefeat();
          }
          setGameStatus('GAME_OVER');
          sounds.stopAmbience();
        }
        return nextTime;
      });

      // 2. Physics & AI Tick
      updateGameState({
        players: playersRef.current,
        obstacles,
        bushes,
        lockers: lockersRef.current,
        collectibles: collectiblesRef.current,
        noiseRipples: noiseRipplesRef.current,
        bloodParticles: bloodParticlesRef.current,
        rescueCage: rescueCageRef.current,
        dt,
        inputVector: inputVectorRef.current,
        isSprintingInput: isSprintingRef.current,
        onTagHider: (killer, hider) => {
          if (killer.killsCount !== undefined) {
            killer.killsCount += 1;
          }

          // Check if user hider was caught
          if (hider.isPlayer) {
            // Alert user that they were captured
            sounds.playAttack();
          }

          // If user is Killer, check if all 9 caught!
          const allCaught = playersRef.current.filter((p) => !p.isKiller && p.isCaught).length + 1 >= 9;
          if (allCaught && userRole === 'KILLER') {
            setIsVictory(true);
            sounds.playVictory();
            sounds.stopAmbience();
            setGameStatus('GAME_OVER');
          }
        },
        onRescueHiders: () => {
          setRescuesCount((prev) => prev + 1);
        },
        onLockerEnter: () => {},
      });

      // Check proximity for interaction prompts
      const user = playersRef.current.find((p) => p.isPlayer);
      if (user) {
        if (user.isHidingInLocker) {
          setCanInteractLocker(true);
        } else {
          let nearLocker = false;
          for (const l of lockersRef.current) {
            if (!l.occupiedByPlayerId) {
              if (getDist(user.x, user.y, l.x + l.width / 2, l.y + l.height / 2) < 55) {
                nearLocker = true;
                break;
              }
            }
          }
          setCanInteractLocker(nearLocker);
        }

        // Check proximity to cage gate
        const gateX = rescueCageRef.current.x + rescueCageRef.current.width / 2;
        const gateY = rescueCageRef.current.y + rescueCageRef.current.height + 25;
        const nearGate = !user.isKiller && !user.isCaught && getDist(user.x, user.y, gateX, gateY) < 60;
        setCanInteractCage(nearGate && rescueCageRef.current.unlockProgress > 0);
      }

      // Sync state for React UI periodically
      setPlayers([...playersRef.current]);
      setNoiseRipples([...noiseRipplesRef.current]);
      setBloodParticles([...bloodParticlesRef.current]);
      setRescueCage({ ...rescueCageRef.current });

      animId = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStatus, userRole, obstacles, bushes]);

  // Compute killer distance for heartbeat
  const userPlayer = players.find((p) => p.isPlayer);
  const killerPlayer = players.find((p) => p.isKiller);
  let killerDistance = Infinity;
  if (userPlayer && killerPlayer && !userPlayer.isKiller) {
    killerDistance = getDist(userPlayer.x, userPlayer.y, killerPlayer.x, killerPlayer.y);
  }

  const caughtCount = players.filter((p) => !p.isKiller && p.isCaught).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Title Menu Screen */}
      {gameStatus === 'TITLE_MENU' && (
        <TitleScreen
          onStartGame={handleStartGame}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* 2. Active Game Screen */}
      {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED' || gameStatus === 'GAME_OVER') && (
        <>
          {/* Top HUD */}
          <HUD
            players={players}
            userRole={userRole}
            timeRemaining={timeRemaining}
            isPaused={gameStatus === 'PAUSED'}
            onTogglePause={() => {
              sounds.playClick();
              setGameStatus((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
            }}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            onOpenHelp={() => setShowRules(true)}
            killerDistance={killerDistance}
          />

          {/* Interactive Game Canvas with Map, Players, & KILLER label */}
          <GameCanvas
            players={players}
            obstacles={obstacles}
            bushes={bushes}
            lockers={lockers}
            collectibles={collectibles}
            noiseRipples={noiseRipples}
            bloodParticles={bloodParticles}
            rescueCage={rescueCage}
            userRole={userRole}
            isPaused={gameStatus === 'PAUSED'}
            onLockerToggle={handleLockerToggle}
            canInteractLocker={canInteractLocker}
            canInteractCage={canInteractCage}
            activeLockerId={activeLockerId}
            onMoveInput={handleMoveInput}
          />

          {/* Pause Overlay */}
          {gameStatus === 'PAUSED' && (
            <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl flex flex-col gap-4">
                <h3 className="text-xl font-bold font-display text-white">
                  {language === 'hi' ? 'खेल रुका हुआ है (PAUSED)' : 'GAME PAUSED'}
                </h3>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setGameStatus('PLAYING');
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-sm"
                >
                  {language === 'hi' ? 'जारी रखें (Resume)' : 'Resume'}
                </button>
                <button
                  onClick={handleReturnToMenu}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  {language === 'hi' ? 'मुख्य मेनू पर जाएं' : 'Main Menu'}
                </button>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {gameStatus === 'GAME_OVER' && (
            <GameOverModal
              isVictory={isVictory}
              userRole={userRole}
              caughtCount={caughtCount}
              totalHiders={9}
              timeSurvived={MATCH_DURATION - timeRemaining}
              rescuesCount={rescuesCount}
              onPlayAgain={handlePlayAgain}
              onReturnToMenu={handleReturnToMenu}
              language={language}
            />
          )}
        </>
      )}

      {/* Rules / Help Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} language={language} />}
    </div>
  );
}
