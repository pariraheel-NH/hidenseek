/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameRole = 'KILLER' | 'HIDER';

export type GameStatus = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Difficulty = 'EASY' | 'NORMAL' | 'NIGHTMARE';

export type Language = 'en' | 'hi';

export interface Player {
  id: string;
  name: string;
  isKiller: boolean;
  isPlayer: boolean; // controlled by user
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  speed: number;
  baseSpeed: number;
  color: string;
  avatarColor: string;
  isDead: boolean;
  isCaught: boolean;
  isHidingInLocker: boolean;
  isHidingInBush: boolean;
  lockerId: string | null;
  sprintStamina: number; // 0 - 100
  isSprinting: boolean;
  staminaRegenCooldown: number;
  actionCooldown: number;
  aiState?: 'patrol' | 'chase' | 'search' | 'flee' | 'hide' | 'rescue' | 'idle';
  aiTargetX?: number;
  aiTargetY?: number;
  aiWaitTimer?: number;
  scaredTimer?: number;
  footstepTimer?: number;
  killsCount?: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'table' | 'bookshelf' | 'pillar' | 'cage_fence';
  color?: string;
  label?: string;
}

export interface Bush {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface Locker {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  occupiedByPlayerId: string | null;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'energy_drink' | 'coin' | 'whistle';
  collected: boolean;
  respawnTime?: number;
}

export interface NoiseRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  source: 'footstep' | 'whistle' | 'cage_break' | 'locker';
}

export interface BloodParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface RescueCage {
  x: number;
  y: number;
  width: number;
  height: number;
  unlockProgress: number; // 0 to 100
  isUnlocking: boolean;
}

export interface GameSettings {
  language: Language;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  difficulty: Difficulty;
  playerName: string;
  selectedRole: GameRole;
  showMinimap: boolean;
}
