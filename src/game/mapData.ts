/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Obstacle, Bush, Locker, Collectible, RescueCage } from '../types/game';

export const MAP_WIDTH = 2200;
export const MAP_HEIGHT = 1600;

export const RESCUE_CAGE: RescueCage = {
  x: 1000,
  y: 1250,
  width: 200,
  height: 150,
  unlockProgress: 0,
  isUnlocking: false,
};

export const INITIAL_OBSTACLES: Obstacle[] = [
  // Outer perimeter boundaries
  { id: 'bound-top', x: 0, y: 0, width: MAP_WIDTH, height: 40, type: 'wall' },
  { id: 'bound-bottom', x: 0, y: MAP_HEIGHT - 40, width: MAP_WIDTH, height: 40, type: 'wall' },
  { id: 'bound-left', x: 0, y: 0, width: 40, height: MAP_HEIGHT, type: 'wall' },
  { id: 'bound-right', x: MAP_WIDTH - 40, y: 0, width: 40, height: MAP_HEIGHT, type: 'wall' },

  // Center Hall & Courtyard Divide Walls
  { id: 'wall-c1', x: 300, y: 450, width: 380, height: 30, type: 'wall' },
  { id: 'wall-c2', x: 800, y: 450, width: 600, height: 30, type: 'wall' },
  { id: 'wall-c3', x: 1520, y: 450, width: 380, height: 30, type: 'wall' },

  { id: 'wall-v1', x: 680, y: 40, width: 30, height: 410, type: 'wall' },
  { id: 'wall-v2', x: 1520, y: 40, width: 30, height: 410, type: 'wall' },

  // East Wing (Library)
  { id: 'wall-lib-divide', x: 1520, y: 600, width: 30, height: 500, type: 'wall' },
  { id: 'lib-shelf-1', x: 1650, y: 150, width: 200, height: 40, type: 'bookshelf', label: 'Bookshelf' },
  { id: 'lib-shelf-2', x: 1650, y: 280, width: 200, height: 40, type: 'bookshelf', label: 'Bookshelf' },
  { id: 'lib-shelf-3', x: 1950, y: 150, width: 140, height: 40, type: 'bookshelf', label: 'Bookshelf' },
  { id: 'lib-shelf-4', x: 1950, y: 280, width: 140, height: 40, type: 'bookshelf', label: 'Bookshelf' },
  { id: 'lib-shelf-5', x: 1650, y: 700, width: 220, height: 45, type: 'bookshelf', label: 'Bookshelf' },
  { id: 'lib-shelf-6', x: 1650, y: 850, width: 220, height: 45, type: 'bookshelf', label: 'Bookshelf' },
  { id: 'lib-shelf-7', x: 1650, y: 1000, width: 220, height: 45, type: 'bookshelf', label: 'Bookshelf' },
  { id: 'lib-desk', x: 1950, y: 800, width: 120, height: 160, type: 'table', label: 'Study Table' },

  // West Wing (Dining & Kitchen)
  { id: 'wall-west-divide', x: 680, y: 600, width: 30, height: 500, type: 'wall' },
  { id: 'dine-table-1', x: 180, y: 160, width: 240, height: 80, type: 'table', label: 'Banquet Table' },
  { id: 'dine-table-2', x: 180, y: 320, width: 240, height: 80, type: 'table', label: 'Banquet Table' },
  { id: 'kitchen-island', x: 180, y: 680, width: 180, height: 180, type: 'table', label: 'Kitchen Counter' },
  { id: 'kitchen-counter-2', x: 420, y: 800, width: 160, height: 70, type: 'table' },
  { id: 'wine-rack', x: 120, y: 980, width: 320, height: 45, type: 'bookshelf' },

  // Central Pillars in Grand Foyer
  { id: 'pillar-1', x: 920, y: 200, width: 50, height: 50, type: 'pillar' },
  { id: 'pillar-2', x: 1230, y: 200, width: 50, height: 50, type: 'pillar' },
  { id: 'pillar-3', x: 920, y: 350, width: 50, height: 50, type: 'pillar' },
  { id: 'pillar-4', x: 1230, y: 350, width: 50, height: 50, type: 'pillar' },
  { id: 'foyer-fountain', x: 1040, y: 260, width: 120, height: 80, type: 'pillar', label: 'Marble Fountain' },

  // South Yard & Prison Cage Borders
  { id: 'wall-south-w', x: 40, y: 1150, width: 800, height: 30, type: 'wall' },
  { id: 'wall-south-e', x: 1360, y: 1150, width: 800, height: 30, type: 'wall' },

  // Cage Fence perimeter around cage
  { id: 'cage-top', x: 1000, y: 1250, width: 200, height: 15, type: 'cage_fence' },
  { id: 'cage-left', x: 1000, y: 1250, width: 15, height: 150, type: 'cage_fence' },
  { id: 'cage-right', x: 1185, y: 1250, width: 15, height: 150, type: 'cage_fence' },
  // Bottom has cage door opening (x: 1060 to 1140 is open)
  { id: 'cage-bot-l', x: 1000, y: 1385, width: 60, height: 15, type: 'cage_fence' },
  { id: 'cage-bot-r', x: 1140, y: 1385, width: 60, height: 15, type: 'cage_fence' },

  // Courtyard Gazebo
  { id: 'gazebo-pillar-1', x: 1000, y: 700, width: 40, height: 40, type: 'pillar' },
  { id: 'gazebo-pillar-2', x: 1160, y: 700, width: 40, height: 40, type: 'pillar' },
  { id: 'gazebo-pillar-3', x: 1000, y: 860, width: 40, height: 40, type: 'pillar' },
  { id: 'gazebo-pillar-4', x: 1160, y: 860, width: 40, height: 40, type: 'pillar' },
  { id: 'gazebo-table', x: 1055, y: 755, width: 90, height: 90, type: 'table' },

  // Storage Room Dividers (Far South-East)
  { id: 'storage-wall-1', x: 1650, y: 1280, width: 30, height: 280, type: 'wall' },
  { id: 'storage-wall-2', x: 1650, y: 1280, width: 300, height: 30, type: 'wall' },

  // Greenhouse Room (Far South-West)
  { id: 'green-wall-1', x: 500, y: 1280, width: 30, height: 280, type: 'wall' },
  { id: 'green-wall-2', x: 200, y: 1280, width: 300, height: 30, type: 'wall' },
];

export const INITIAL_BUSHES: Bush[] = [
  // Courtyard bushes (rich clump)
  { id: 'bush-1', x: 860, y: 640, radius: 50 },
  { id: 'bush-2', x: 920, y: 680, radius: 45 },
  { id: 'bush-3', x: 1240, y: 650, radius: 52 },
  { id: 'bush-4', x: 1300, y: 710, radius: 46 },
  { id: 'bush-5', x: 880, y: 920, radius: 55 },
  { id: 'bush-6', x: 1280, y: 910, radius: 50 },
  { id: 'bush-7', x: 1080, y: 1000, radius: 60 },

  // Garden / West Yard bushes
  { id: 'bush-w1', x: 220, y: 1240, radius: 55 },
  { id: 'bush-w2', x: 340, y: 1380, radius: 50 },
  { id: 'bush-w3', x: 440, y: 1450, radius: 52 },
  { id: 'bush-w4', x: 580, y: 900, radius: 45 },

  // East Yard bushes
  { id: 'bush-e1', x: 1800, y: 1220, radius: 55 },
  { id: 'bush-e2', x: 1950, y: 1350, radius: 50 },
  { id: 'bush-e3', x: 1720, y: 1450, radius: 48 },
  { id: 'bush-e4', x: 1600, y: 900, radius: 45 },

  // Library alcove bush
  { id: 'bush-lib-1', x: 2050, y: 460, radius: 44 },
  { id: 'bush-dine-1', x: 120, y: 460, radius: 44 },
];

export const INITIAL_LOCKERS: Locker[] = [
  // Foyer Lockers
  { id: 'locker-f1', x: 740, y: 420, width: 45, height: 30, occupiedByPlayerId: null },
  { id: 'locker-f2', x: 1420, y: 420, width: 45, height: 30, occupiedByPlayerId: null },

  // West Dorm / Dining
  { id: 'locker-w1', x: 630, y: 100, width: 45, height: 30, occupiedByPlayerId: null },
  { id: 'locker-w2', x: 630, y: 160, width: 45, height: 30, occupiedByPlayerId: null },
  { id: 'locker-w3', x: 70, y: 780, width: 45, height: 30, occupiedByPlayerId: null },

  // East Library Lockers
  { id: 'locker-e1', x: 1560, y: 100, width: 45, height: 30, occupiedByPlayerId: null },
  { id: 'locker-e2', x: 1560, y: 160, width: 45, height: 30, occupiedByPlayerId: null },
  { id: 'locker-e3', x: 2100, y: 750, width: 45, height: 30, occupiedByPlayerId: null },

  // South Storage Lockers
  { id: 'locker-s1', x: 1720, y: 1320, width: 45, height: 30, occupiedByPlayerId: null },
  { id: 'locker-s2', x: 1780, y: 1320, width: 45, height: 30, occupiedByPlayerId: null },
  { id: 'locker-s3', x: 280, y: 1320, width: 45, height: 30, occupiedByPlayerId: null },
];

export const INITIAL_COLLECTIBLES: Collectible[] = [
  { id: 'item-spd-1', x: 1080, y: 800, type: 'energy_drink', collected: false },
  { id: 'item-spd-2', x: 1850, y: 350, type: 'energy_drink', collected: false },
  { id: 'item-spd-3', x: 350, y: 750, type: 'energy_drink', collected: false },
  { id: 'item-whistle-1', x: 1100, y: 1500, type: 'whistle', collected: false },
  { id: 'item-whistle-2', x: 1400, y: 180, type: 'whistle', collected: false },
  { id: 'item-coin-1', x: 1980, y: 950, type: 'coin', collected: false },
  { id: 'item-coin-2', x: 180, y: 950, type: 'coin', collected: false },
  { id: 'item-coin-3', x: 1080, y: 120, type: 'coin', collected: false },
];
