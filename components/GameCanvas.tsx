/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player, Obstacle, Bush, Locker, Collectible, NoiseRipple, BloodParticle, RescueCage, GameRole } from '../types/game';
import { MAP_WIDTH, MAP_HEIGHT } from '../game/mapData';
import { getDist } from '../game/physicsAndAI';
import { sounds } from '../utils/audio';

interface GameCanvasProps {
  players: Player[];
  obstacles: Obstacle[];
  bushes: Bush[];
  lockers: Locker[];
  collectibles: Collectible[];
  noiseRipples: NoiseRipple[];
  bloodParticles: BloodParticle[];
  rescueCage: RescueCage;
  userRole: GameRole;
  isPaused: boolean;
  onLockerToggle: () => void;
  canInteractLocker: boolean;
  canInteractCage: boolean;
  activeLockerId: string | null;
  onMoveInput: (vector: { x: number; y: number }, isSprinting: boolean) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  players,
  obstacles,
  bushes,
  lockers,
  collectibles,
  noiseRipples,
  bloodParticles,
  rescueCage,
  userRole,
  isPaused,
  onLockerToggle,
  canInteractLocker,
  canInteractCage,
  activeLockerId,
  onMoveInput,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keyboard state
  const keysDown = useRef<{ [key: string]: boolean }>({});
  const isSprintingKey = useRef(false);

  // Touch virtual joystick
  const [touchActive, setTouchActive] = useState(false);
  const [touchOrigin, setTouchOrigin] = useState<{ x: number; y: number } | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [mobileSprint, setMobileSprint] = useState(false);

  // Proximity to killer for heartbeat
  const userPlayer = players.find((p) => p.isPlayer) || players[0];
  const killerPlayer = players.find((p) => p.isKiller);

  let killerDistance = Infinity;
  if (userPlayer && killerPlayer && !userPlayer.isKiller) {
    killerDistance = getDist(userPlayer.x, userPlayer.y, killerPlayer.x, killerPlayer.y);
  }

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = true;
      if (e.key === 'Shift') {
        isSprintingKey.current = true;
      }
      if (e.key === ' ' || e.key.toLowerCase() === 'e') {
        if (canInteractLocker) {
          onLockerToggle();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
      if (e.key === 'Shift') {
        isSprintingKey.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canInteractLocker, onLockerToggle]);

  // Compute movement input
  const updateInput = useCallback(() => {
    let dx = 0;
    let dy = 0;

    // 1. Keyboard
    const kd = keysDown.current;
    if (kd['w'] || kd['arrowup']) dy -= 1;
    if (kd['s'] || kd['arrowdown']) dy += 1;
    if (kd['a'] || kd['arrowleft']) dx -= 1;
    if (kd['d'] || kd['arrowright']) dx += 1;

    let sprinting = isSprintingKey.current || mobileSprint;

    // 2. Touch joystick override if active
    if (touchOrigin && touchPos) {
      const jx = touchPos.x - touchOrigin.x;
      const jy = touchPos.y - touchOrigin.y;
      const len = Math.hypot(jx, jy);
      if (len > 10) {
        dx = jx / len;
        dy = jy / len;
      }
    }

    onMoveInput({ x: dx, y: dy }, sprinting);
  }, [touchOrigin, touchPos, mobileSprint, onMoveInput]);

  useEffect(() => {
    const interval = setInterval(updateInput, 1000 / 60);
    return () => clearInterval(interval);
  }, [updateInput]);

  // Heartbeat sound loop based on distance
  useEffect(() => {
    if (isPaused || userRole === 'KILLER' || userPlayer?.isCaught) return;

    if (killerDistance < 360) {
      const urgency = 1 - killerDistance / 360;
      sounds.playHeartbeat(urgency);
    }
  }, [killerDistance, isPaused, userRole, userPlayer?.isCaught]);

  // Canvas render animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animTime = 0;

    const render = () => {
      animTime += 0.016;

      // Resize canvas to match display size
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Camera centered on user's player
      const target = userPlayer || { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
      const camX = width / 2 - target.x;
      const camY = height / 2 - target.y;

      ctx.translate(camX, camY);

      // 1. Draw Map Floor Tiles
      drawFloor(ctx);

      // 2. Draw Obstacles (Walls, Bookshelves, Tables, Pillars)
      for (const obs of obstacles) {
        drawObstacle(ctx, obs);
      }

      // 3. Draw Rescue Cage
      drawRescueCage(ctx, rescueCage, animTime);

      // 4. Draw Lockers
      for (const locker of lockers) {
        drawLocker(ctx, locker, activeLockerId === locker.id);
      }

      // 5. Draw Collectibles
      for (const item of collectibles) {
        if (!item.collected) {
          drawCollectible(ctx, item, animTime);
        }
      }

      // 6. Draw Noise Ripples
      for (const ripple of noiseRipples) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${ripple.alpha * 0.7})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      // 7. Draw Blood Particles
      for (const p of bloodParticles) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fill();
        ctx.restore();
      }

      // 8. Draw Flashlight Beam (if Killer)
      if (killerPlayer) {
        drawFlashlightCone(ctx, killerPlayer, animTime);
      }

      // 9. Draw Players (Hiders & Killer)
      for (const p of players) {
        drawPlayer(ctx, p, animTime, userPlayer);
      }

      // 10. Draw Bushes on top (so players hiding inside are under the leaves!)
      for (const bush of bushes) {
        drawBush(ctx, bush, animTime);
      }

      ctx.restore();

      // Screen border heartbeat vignette if Killer is nearby
      if (userRole === 'HIDER' && killerDistance < 360 && !userPlayer?.isCaught) {
        const intensity = (1 - killerDistance / 360) * (0.3 + 0.25 * Math.sin(animTime * 12));
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.35,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.7
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, `rgba(220, 38, 38, ${Math.min(0.7, intensity)})`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    players,
    obstacles,
    bushes,
    lockers,
    collectibles,
    noiseRipples,
    bloodParticles,
    rescueCage,
    userRole,
    activeLockerId,
    userPlayer,
    killerPlayer,
    killerDistance,
  ]);

  // Touch Joystick handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Only activate joystick on left 65% of screen
    if (x < rect.width * 0.65) {
      setTouchActive(true);
      setTouchOrigin({ x, y });
      setTouchPos({ x, y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchActive || !touchOrigin) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Cap stick distance at 50px
    const dx = x - touchOrigin.x;
    const dy = y - touchOrigin.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 50;
    if (dist > maxRadius) {
      setTouchPos({
        x: touchOrigin.x + (dx / dist) * maxRadius,
        y: touchOrigin.y + (dy / dist) * maxRadius,
      });
    } else {
      setTouchPos({ x, y });
    }
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
    setTouchOrigin(null);
    setTouchPos(null);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Interactive In-Game HUD Prompts */}
      {canInteractLocker && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 border border-amber-500/40 px-5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
          <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-xs">
            SPACE / TAP
          </span>
          <span className="text-sm font-semibold">
            {activeLockerId ? 'Exit Locker (Bahar Niklein)' : 'Hide in Locker (Locker mein Chupein)'}
          </span>
        </div>
      )}

      {canInteractCage && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold">
            Unlocking Prison Cage... ({Math.floor(rescueCage.unlockProgress)}%)
          </span>
        </div>
      )}

      {/* Mobile Touch Controls */}
      <div className="md:hidden pointer-events-none absolute inset-0 p-4 flex flex-col justify-end">
        {/* Virtual Joystick Visual Indicator */}
        {touchOrigin && touchPos && (
          <div
            className="absolute rounded-full border-2 border-white/30 bg-white/10 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: touchOrigin.x,
              top: touchOrigin.y,
              width: 100,
              height: 100,
            }}
          >
            <div
              className="absolute w-8 h-8 rounded-full bg-white/70 shadow-lg -translate-x-1/2 -translate-y-1/2"
              style={{
                left: 50 + (touchPos.x - touchOrigin.x),
                top: 50 + (touchPos.y - touchOrigin.y),
              }}
            />
          </div>
        )}

        {/* Mobile Action Buttons (Right side) */}
        <div className="pointer-events-auto self-end flex flex-col gap-3 items-end mb-6 mr-2">
          {canInteractLocker && (
            <button
              onClick={onLockerToggle}
              className="w-14 h-14 rounded-full bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-xl flex items-center justify-center border-2 border-amber-300/50"
            >
              {activeLockerId ? 'EXIT' : 'HIDE'}
            </button>
          )}

          <button
            onTouchStart={() => setMobileSprint(true)}
            onTouchEnd={() => setMobileSprint(false)}
            onMouseDown={() => setMobileSprint(true)}
            onMouseUp={() => setMobileSprint(false)}
            className={`w-16 h-16 rounded-full font-bold text-xs shadow-2xl flex flex-col items-center justify-center border-2 transition-all ${
              mobileSprint
                ? 'bg-rose-600 border-rose-300 text-white scale-95'
                : 'bg-slate-800/90 border-slate-600 text-slate-200'
            }`}
          >
            <span className="text-lg">⚡</span>
            <span>RUN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------- DRAWING HELPERS ----------------- //

function drawFloor(ctx: CanvasRenderingContext2D) {
  // Base dark background
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Courtyard Grass zone (center 700 to 1400, y 500 to 1100)
  ctx.fillStyle = '#064e3b'; // emerald-900 / dark garden grass
  ctx.fillRect(720, 480, 760, 640);

  // Library Wooden Planks (East)
  ctx.fillStyle = '#1c1917'; // stone-900 dark oak
  ctx.fillRect(1550, 40, 610, 1100);

  // Dining Hall Checkered Tiles (West)
  ctx.fillStyle = '#1e1b4b'; // indigo-950
  ctx.fillRect(40, 40, 640, 1100);

  // Grid lines for tactical top-down style
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x <= MAP_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, MAP_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= MAP_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(MAP_WIDTH, y);
    ctx.stroke();
  }
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(obs.x + 4, obs.y + 4, obs.width, obs.height);

  if (obs.type === 'wall') {
    ctx.fillStyle = '#334155'; // slate-700
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    // Wall top highlight
    ctx.fillStyle = '#475569';
    ctx.fillRect(obs.x, obs.y, obs.width, Math.min(6, obs.height / 2));
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
  } else if (obs.type === 'bookshelf') {
    ctx.fillStyle = '#78350f'; // amber-900 wood
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    // Bookshelf spines
    ctx.fillStyle = '#92400e';
    ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);
    // Draw book colors
    const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea'];
    const count = Math.floor(obs.width / 14);
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = bookColors[i % bookColors.length];
      ctx.fillRect(obs.x + 4 + i * 14, obs.y + 4, 10, obs.height - 8);
    }
  } else if (obs.type === 'table') {
    ctx.fillStyle = '#b45309'; // warm mahogany table
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

    // White tablecloth center
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(obs.x + 8, obs.y + 8, obs.width - 16, obs.height - 16);
  } else if (obs.type === 'pillar') {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 12);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (obs.type === 'cage_fence') {
    // Metal bars
    ctx.fillStyle = '#475569';
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
  }

  ctx.restore();
}

function drawRescueCage(ctx: CanvasRenderingContext2D, cage: RescueCage, animTime: number) {
  ctx.save();
  // Cage floor (jail cell stone)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(cage.x, cage.y, cage.width, cage.height);

  // Bars grid
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  for (let x = cage.x + 20; x < cage.x + cage.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, cage.y);
    ctx.lineTo(x, cage.y + cage.height);
    ctx.stroke();
  }

  // Label PRISON CAGE / RESCUE
  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RESCUE CAGE (Bachao Pinjra)', cage.x + cage.width / 2, cage.y - 10);

  // Unlocking ring if being rescued
  if (cage.unlockProgress > 0) {
    const gateX = cage.x + cage.width / 2;
    const gateY = cage.y + cage.height + 25;

    ctx.beginPath();
    ctx.arc(gateX, gateY, 24, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(gateX, gateY, 24, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (cage.unlockProgress / 100)));
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.fillText(`${Math.floor(cage.unlockProgress)}%`, gateX, gateY + 4);
  }

  ctx.restore();
}

function drawLocker(ctx: CanvasRenderingContext2D, locker: Locker, isUserInside: boolean) {
  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(locker.x + 3, locker.y + 3, locker.width, locker.height);

  // Locker metal body
  ctx.fillStyle = isUserInside ? '#1e3a8a' : '#334155';
  ctx.fillRect(locker.x, locker.y, locker.width, locker.height);

  // Slats / vents
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(locker.x, locker.y, locker.width, locker.height);

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(locker.x + 8, locker.y + 7 + i * 5);
    ctx.lineTo(locker.x + locker.width - 8, locker.y + 7 + i * 5);
    ctx.stroke();
  }

  // Handle
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(locker.x + locker.width - 8, locker.y + locker.height / 2 - 4, 3, 8);

  if (isUserInside) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText('PEEKING', locker.x + locker.width / 2, locker.y - 6);
  }

  ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, bush: Bush, animTime: number) {
  ctx.save();

  // Foliage cluster
  const pulse = Math.sin(animTime * 2 + bush.x) * 1.5;
  const radius = bush.radius + pulse;

  // Base shadow
  ctx.fillStyle = 'rgba(2, 44, 34, 0.4)';
  ctx.beginPath();
  ctx.arc(bush.x + 3, bush.y + 3, radius, 0, Math.PI * 2);
  ctx.fill();

  // Dark green base
  ctx.fillStyle = '#065f46'; // emerald-800
  ctx.beginPath();
  ctx.arc(bush.x, bush.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner vibrant leaf clumps
  ctx.fillStyle = '#059669'; // emerald-600
  const clumpOffsets = [
    { dx: -12, dy: -10, r: radius * 0.5 },
    { dx: 14, dy: -8, r: radius * 0.48 },
    { dx: 0, dy: 14, r: radius * 0.52 },
    { dx: -10, dy: 8, r: radius * 0.45 },
  ];
  for (const c of clumpOffsets) {
    ctx.beginPath();
    ctx.arc(bush.x + c.dx, bush.y + c.dy, c.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Highlight spots
  ctx.fillStyle = '#10b981'; // emerald-500
  ctx.beginPath();
  ctx.arc(bush.x - 6, bush.y - 12, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCollectible(ctx: CanvasRenderingContext2D, item: Collectible, animTime: number) {
  ctx.save();
  const floatY = Math.sin(animTime * 4 + item.x) * 3;

  ctx.translate(item.x, item.y + floatY);

  if (item.type === 'energy_drink') {
    // Can
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-6, -10, 12, 20);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4, -6, 8, 12);
  } else if (item.type === 'coin') {
    // Gold coin
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (item.type === 'whistle') {
    // Whistle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(0, -3, 9, 6);
  }

  ctx.restore();
}

function drawFlashlightCone(ctx: CanvasRenderingContext2D, killer: Player, _animTime: number) {
  ctx.save();
  ctx.translate(killer.x, killer.y);
  ctx.rotate(killer.angle);

  const coneLength = 400;
  const halfAngle = 0.65; // ~37 degrees

  const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, coneLength);
  grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)'); // Red menace flashlight
  grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.18)');
  grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, coneLength, -halfAngle, halfAngle);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  animTime: number,
  userPlayer: Player | undefined
) {
  // If hiding in locker, don't render on map
  if (player.isHidingInLocker) return;

  ctx.save();

  // If in bush, adjust opacity so hiders are stealthy!
  if (player.isHidingInBush && !player.isKiller) {
    // User sees themselves slightly more clearly than enemies do
    ctx.globalAlpha = player.isPlayer ? 0.45 : 0.2;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + player.radius * 0.7, player.radius * 0.9, player.radius * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Player Body with Direction Rotation
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  if (player.isKiller) {
    // --- KILLER CHARACTER --- //
    // Menacing Dark Cloak / Body
    ctx.fillStyle = '#7f1d1d'; // dark red-900
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Red glowing core aura
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, player.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Shoulders
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -player.radius * 0.4, player.radius * 0.4, 0, Math.PI * 2);
    ctx.arc(0, player.radius * 0.4, player.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Killer's weapon (cleaver/blade) in front hand
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(player.radius * 0.6, -player.radius * 0.8, player.radius * 0.9, 5);
    ctx.fillStyle = '#dc2626'; // blood tip
    ctx.fillRect(player.radius * 1.2, -player.radius * 0.8, player.radius * 0.3, 5);

    // Glowing Crimson Eyes looking forward
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.radius * 0.5, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(player.radius * 0.5, 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(player.radius * 0.6, -4, 1.5, 0, Math.PI * 2);
    ctx.arc(player.radius * 0.6, 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // --- HIDER CHARACTER --- //
    // Body / Hoodie
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Clothes detail
    ctx.fillStyle = player.avatarColor;
    ctx.beginPath();
    ctx.arc(-player.radius * 0.2, 0, player.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Hands/Feet
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(player.radius * 0.5, -player.radius * 0.6, 3.5, 0, Math.PI * 2);
    ctx.arc(player.radius * 0.5, player.radius * 0.6, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes looking forward
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(player.radius * 0.4, -3.5, 2, 0, Math.PI * 2);
    ctx.arc(player.radius * 0.4, 3.5, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // restore rotation

  // -------------------------------------------------------------------------
  // CRITICAL REQUIREMENT:
  // "go killer hoga us ka sur ka oper killer lika hoga"
  // PROMINENT "KILLER" BANNER OVER KILLER'S HEAD!
  // -------------------------------------------------------------------------
  if (player.isKiller) {
    const pulse = Math.sin(animTime * 6) * 1.5;
    const badgeY = player.y - player.radius - 22 + pulse;

    // Glowing Red Badge Container
    const badgeWidth = 74;
    const badgeHeight = 22;

    // Outer Red Glow
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 14;

    ctx.fillStyle = '#7f1d1d'; // deep crimson background
    ctx.beginPath();
    ctx.roundRect(player.x - badgeWidth / 2, badgeY, badgeWidth, badgeHeight, 5);
    ctx.fill();

    // Glowing border
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.shadowBlur = 0; // reset shadow for text

    // Skull icon + "KILLER" in bold uppercase
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px "Cinzel", "Plus Jakarta Sans", serif';
    ctx.textAlign = 'center';
    ctx.fillText('☠ KILLER', player.x, badgeY + 15);

    // Downward warning pointer triangle pointing at the killer's head
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(player.x - 5, badgeY + badgeHeight);
    ctx.lineTo(player.x + 5, badgeY + badgeHeight);
    ctx.lineTo(player.x, badgeY + badgeHeight + 5);
    ctx.closePath();
    ctx.fill();
  } else {
    // Regular Hider name label
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';

    if (player.isPlayer) {
      // User highlight
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${player.name} (YOU)`, player.x, player.y - player.radius - 8);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(player.name, player.x, player.y - player.radius - 8);
    }

    if (player.isCaught) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText('CAUGHT', player.x, player.y + player.radius + 12);
    }
  }

  // Stamina bar if sprinting or low stamina
  if (player.sprintStamina < 98) {
    const barWidth = 32;
    const barHeight = 4;
    const barX = player.x - barWidth / 2;
    const barY = player.y + player.radius + 6;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = player.sprintStamina > 30 ? '#10b981' : '#f59e0b';
    ctx.fillRect(barX, barY, (barWidth * player.sprintStamina) / 100, barHeight);
  }

  ctx.restore();
}
