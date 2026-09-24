/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, GameRole, Difficulty } from '../types/game';
import { RESCUE_CAGE } from './mapData';

export const BOT_NAMES = [
  'Alex',
  'Maya',
  'Leo',
  'Zara',
  'Elena',
  'Kabir',
  'Lucas',
  'Neha',
  'Rohan',
];

export const CHARACTER_COLORS = [
  { body: '#3B82F6', clothes: '#1D4ED8' }, // Blue
  { body: '#10B981', clothes: '#047857' }, // Emerald
  { body: '#F59E0B', clothes: '#D97706' }, // Amber
  { body: '#8B5CF6', clothes: '#6D28D9' }, // Violet
  { body: '#EC4899', clothes: '#BE185D' }, // Pink
  { body: '#06B6D4', clothes: '#0E7490' }, // Cyan
  { body: '#84CC16', clothes: '#4D7C0F' }, // Lime
  { body: '#F97316', clothes: '#C2410C' }, // Orange
  { body: '#6366F1', clothes: '#4338CA' }, // Indigo
];

export function createInitialPlayers(
  userRole: GameRole,
  userName: string,
  difficulty: Difficulty
): Player[] {
  const players: Player[] = [];

  // Difficulty speed modifiers
  let killerBaseSpeed = 3.6;
  let hiderBaseSpeed = 3.3;

  if (difficulty === 'EASY') {
    killerBaseSpeed = userRole === 'KILLER' ? 4.0 : 3.0;
    hiderBaseSpeed = 3.4;
  } else if (difficulty === 'NIGHTMARE') {
    killerBaseSpeed = userRole === 'KILLER' ? 3.8 : 4.1;
    hiderBaseSpeed = 3.2;
  }

  // 1. The Killer (1 of the 10 players)
  const isUserKiller = userRole === 'KILLER';
  players.push({
    id: 'player-killer',
    name: isUserKiller ? `${userName} (You)` : 'Vicious Killer',
    isKiller: true,
    isPlayer: isUserKiller,
    x: 1100,
    y: 280, // Spawns near Grand Foyer
    vx: 0,
    vy: 0,
    radius: 20,
    angle: Math.PI / 2, // facing down
    speed: killerBaseSpeed,
    baseSpeed: killerBaseSpeed,
    color: '#DC2626', // Crimson red
    avatarColor: '#991B1B',
    isDead: false,
    isCaught: false,
    isHidingInLocker: false,
    isHidingInBush: false,
    lockerId: null,
    sprintStamina: 100,
    isSprinting: false,
    staminaRegenCooldown: 0,
    actionCooldown: 0,
    aiState: 'patrol',
    aiTargetX: 1100,
    aiTargetY: 700,
    aiWaitTimer: 0,
    killsCount: 0,
  });

  // 2. The 9 Hiders (Total = 1 Killer + 9 Hiders = 10 People)
  // Scatter them in various safe zones across the mansion & grounds
  const spawnPoints = [
    { x: 300, y: 250 },   // Dining Hall
    { x: 450, y: 750 },   // Kitchen area
    { x: 1800, y: 220 },  // Library North
    { x: 1850, y: 880 },  // Library South
    { x: 880, y: 640 },   // Courtyard Bush area
    { x: 1250, y: 920 },  // Courtyard South
    { x: 300, y: 1350 },  // Greenhouse
    { x: 1850, y: 1380 }, // Storage Yard
    { x: 1080, y: 950 },  // Garden Walkway
  ];

  for (let i = 0; i < 9; i++) {
    const isThisUser = !isUserKiller && i === 0;
    const hiderName = isThisUser ? `${userName} (You)` : BOT_NAMES[i];
    const spawn = spawnPoints[i] || { x: 500 + i * 120, y: 500 };
    const palette = CHARACTER_COLORS[i % CHARACTER_COLORS.length];

    players.push({
      id: `hider-${i + 1}`,
      name: hiderName,
      isKiller: false,
      isPlayer: isThisUser,
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      radius: 17,
      angle: Math.random() * Math.PI * 2,
      speed: hiderBaseSpeed,
      baseSpeed: hiderBaseSpeed,
      color: palette.body,
      avatarColor: palette.clothes,
      isDead: false,
      isCaught: false,
      isHidingInLocker: false,
      isHidingInBush: false,
      lockerId: null,
      sprintStamina: 100,
      isSprinting: false,
      staminaRegenCooldown: 0,
      actionCooldown: 0,
      aiState: 'hide',
      aiTargetX: spawn.x + (Math.random() * 80 - 40),
      aiTargetY: spawn.y + (Math.random() * 80 - 40),
      aiWaitTimer: Math.random() * 3 + 1,
      scaredTimer: 0,
      killsCount: 0,
    });
  }

  return players;
}

export function resetPlayerToCage(player: Player, cageIndex: number) {
  // Place caught player neatly inside the rescue cage
  const row = Math.floor(cageIndex / 3);
  const col = cageIndex % 3;
  player.x = RESCUE_CAGE.x + 40 + col * 55;
  player.y = RESCUE_CAGE.y + 40 + row * 45;
  player.vx = 0;
  player.vy = 0;
  player.isCaught = true;
  player.isHidingInBush = false;
  player.isHidingInLocker = false;
  player.lockerId = null;
}
