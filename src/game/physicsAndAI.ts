/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Obstacle, Bush, Locker, Collectible, NoiseRipple, BloodParticle, RescueCage } from '../types/game';
import { sounds } from '../utils/audio';
import { MAP_WIDTH, MAP_HEIGHT } from './mapData';
import { resetPlayerToCage } from './playerInit';

// Check circle vs AABB collision
export function resolveCircleAABB(
  px: number,
  py: number,
  radius: number,
  box: { x: number; y: number; width: number; height: number }
): { x: number; y: number; collided: boolean } {
  // Find closest point on box to circle center
  const closestX = Math.max(box.x, Math.min(px, box.x + box.width));
  const closestY = Math.max(box.y, Math.min(py, box.y + box.height));

  const distX = px - closestX;
  const distY = py - closestY;
  const distanceSquared = distX * distX + distY * distY;

  if (distanceSquared < radius * radius && distanceSquared > 0) {
    const distance = Math.sqrt(distanceSquared);
    const overlap = radius - distance;
    const nx = distX / distance;
    const ny = distY / distance;
    return {
      x: px + nx * overlap,
      y: py + ny * overlap,
      collided: true,
    };
  } else if (distanceSquared === 0) {
    // Exactly inside box center
    return { x: px + radius, y: py, collided: true };
  }

  return { x: px, y: py, collided: false };
}

// Distance helper
export function getDist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Check line of sight (simple raycast between two points blocked by solid obstacles)
export function hasLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  obstacles: Obstacle[]
): boolean {
  for (const obs of obstacles) {
    if (obs.type === 'cage_fence') continue; // fence allows vision
    if (lineIntersectsRect(x1, y1, x2, y2, obs.x, obs.y, obs.width, obs.height)) {
      return false;
    }
  }
  return true;
}

function lineIntersectsRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  // Check if line intersects any of the 4 edges
  return (
    lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
    lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
    lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) ||
    lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx, ry)
  );
}

function lineIntersectsLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): boolean {
  const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (den === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

export interface UpdateGameParams {
  players: Player[];
  obstacles: Obstacle[];
  bushes: Bush[];
  lockers: Locker[];
  collectibles: Collectible[];
  noiseRipples: NoiseRipple[];
  bloodParticles: BloodParticle[];
  rescueCage: RescueCage;
  dt: number;
  inputVector: { x: number; y: number };
  isSprintingInput: boolean;
  onTagHider: (killer: Player, hider: Player) => void;
  onRescueHiders: () => void;
  onLockerEnter: (player: Player, locker: Locker) => void;
}

export function updateGameState({
  players,
  obstacles,
  bushes,
  lockers,
  collectibles,
  noiseRipples,
  bloodParticles,
  rescueCage,
  dt,
  inputVector,
  isSprintingInput,
  onTagHider,
  onRescueHiders,
}: UpdateGameParams) {
  const killer = players.find((p) => p.isKiller);
  if (!killer) return;

  // 1. Update noise ripples
  for (let i = noiseRipples.length - 1; i >= 0; i--) {
    const ripple = noiseRipples[i];
    ripple.radius += 120 * dt;
    ripple.alpha -= 0.8 * dt;
    if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
      noiseRipples.splice(i, 1);
    }
  }

  // 2. Update blood / sparkle particles
  for (let i = bloodParticles.length - 1; i >= 0; i--) {
    const p = bloodParticles[i];
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= dt;
    if (p.life <= 0) {
      bloodParticles.splice(i, 1);
    }
  }

  // 3. Update each player
  for (const player of players) {
    if (player.isDead) continue;

    // Stamina recovery
    if (!player.isSprinting && player.sprintStamina < 100) {
      player.staminaRegenCooldown -= dt;
      if (player.staminaRegenCooldown <= 0) {
        player.sprintStamina = Math.min(100, player.sprintStamina + 25 * dt);
      }
    }

    if (player.actionCooldown > 0) {
      player.actionCooldown -= dt;
    }

    // A. Player Controlled Movement
    if (player.isPlayer) {
      if (player.isCaught) {
        // Caged player cannot freely move outside cage bounds
        player.vx = 0;
        player.vy = 0;
      } else if (player.isHidingInLocker) {
        // Locked inside
        player.vx = 0;
        player.vy = 0;
      } else {
        // Standard user input
        const len = Math.hypot(inputVector.x, inputVector.y);
        const moving = len > 0.1;

        if (moving) {
          const wantSprint = isSprintingInput && player.sprintStamina > 5;
          player.isSprinting = wantSprint;

          let speed = player.baseSpeed;
          if (wantSprint) {
            speed *= 1.45;
            player.sprintStamina = Math.max(0, player.sprintStamina - 28 * dt);
            player.staminaRegenCooldown = 1.0;
          }

          const nx = inputVector.x / len;
          const ny = inputVector.y / len;
          player.vx = nx * speed;
          player.vy = ny * speed;
          player.angle = Math.atan2(ny, nx);

          // Footstep audio & noise ripples
          player.footstepTimer = (player.footstepTimer || 0) + dt;
          const stepInterval = wantSprint ? 0.22 : 0.36;
          if (player.footstepTimer > stepInterval) {
            player.footstepTimer = 0;
            sounds.playFootstep(wantSprint);

            if (wantSprint) {
              noiseRipples.push({
                x: player.x,
                y: player.y,
                radius: 12,
                maxRadius: 75,
                alpha: 0.6,
                source: 'footstep',
              });
            }
          }
        } else {
          player.vx = 0;
          player.vy = 0;
          player.isSprinting = false;
        }
      }
    } else {
      // B. AI Controlled Logic
      if (player.isKiller) {
        updateKillerAI(player, players, obstacles, dt, noiseRipples);
      } else {
        updateHiderAI(player, killer, players, bushes, lockers, rescueCage, dt, noiseRipples);
      }
    }

    // Apply movement if not in locker or caught
    if (!player.isHidingInLocker && !player.isCaught) {
      let nextX = player.x + player.vx * (dt * 60);
      let nextY = player.y + player.vy * (dt * 60);

      // Collide with map obstacles
      for (const obs of obstacles) {
        const resolved = resolveCircleAABB(nextX, nextY, player.radius, obs);
        if (resolved.collided) {
          nextX = resolved.x;
          nextY = resolved.y;
        }
      }

      // Keep inside map bounds
      nextX = Math.max(player.radius + 40, Math.min(MAP_WIDTH - player.radius - 40, nextX));
      nextY = Math.max(player.radius + 40, Math.min(MAP_HEIGHT - player.radius - 40, nextY));

      player.x = nextX;
      player.y = nextY;

      // Bush concealment check
      let inAnyBush = false;
      for (const bush of bushes) {
        const dist = getDist(player.x, player.y, bush.x, bush.y);
        if (dist < bush.radius + player.radius * 0.4) {
          inAnyBush = true;
          break;
        }
      }

      if (inAnyBush && !player.isHidingInBush && player.isPlayer) {
        sounds.playRustle();
      }
      player.isHidingInBush = inAnyBush;
    }

    // Check Collectibles
    if (!player.isCaught && !player.isHidingInLocker) {
      for (const item of collectibles) {
        if (!item.collected && getDist(player.x, player.y, item.x, item.y) < player.radius + 15) {
          item.collected = true;
          sounds.playPickup();
          if (item.type === 'energy_drink') {
            player.sprintStamina = 100;
            player.baseSpeed *= 1.25;
            setTimeout(() => {
              player.baseSpeed /= 1.25;
            }, 6000);
          } else if (item.type === 'whistle') {
            sounds.playWhistle();
            // Emit loud decoy noise to distract killer!
            noiseRipples.push({
              x: player.x,
              y: player.y,
              radius: 20,
              maxRadius: 280,
              alpha: 0.9,
              source: 'whistle',
            });
            if (!killer.isPlayer) {
              killer.aiTargetX = player.x;
              killer.aiTargetY = player.y;
              killer.aiState = 'search';
            }
          }
        }
      }
    }
  }

  // 4. Killer Hunting / Tagging Logic
  // Check if killer hits any hider
  for (const hider of players) {
    if (hider.isKiller || hider.isCaught || hider.isDead) continue;

    // If hider is hiding in locker, killer only catches if killer inspects/touches the locker
    if (hider.isHidingInLocker) continue;

    const distToKiller = getDist(killer.x, killer.y, hider.x, hider.y);
    const tagRange = killer.radius + hider.radius + 12;

    if (distToKiller <= tagRange) {
      // TAGGED! Hider is captured!
      sounds.playAttack();
      onTagHider(killer, hider);

      // Spawn blood/capture burst
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5 + 2;
        bloodParticles.push({
          x: hider.x,
          y: hider.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: Math.random() * 4 + 2,
          color: '#EF4444',
          life: 0.8,
          maxLife: 0.8,
        });
      }

      // Reset to cage
      const currentCaughtCount = players.filter((p) => p.isCaught && !p.isKiller).length;
      resetPlayerToCage(hider, currentCaughtCount);
    }
  }

  // 5. Rescue Cage Unlocking Mechanism
  // Check if any free hider is standing near cage gate to unlock companions
  const cageGateX = rescueCage.x + rescueCage.width / 2;
  const cageGateY = rescueCage.y + rescueCage.height + 25;
  let someoneUnlocking = false;

  const caughtHiders = players.filter((p) => !p.isKiller && p.isCaught);

  if (caughtHiders.length > 0) {
    for (const hider of players) {
      if (hider.isKiller || hider.isCaught || hider.isHidingInLocker) continue;

      const distToGate = getDist(hider.x, hider.y, cageGateX, cageGateY);
      if (distToGate < 55) {
        someoneUnlocking = true;
        rescueCage.unlockProgress += dt * 38; // ~2.6 seconds to rescue
        if (rescueCage.unlockProgress >= 100) {
          // Free all captured players!
          rescueCage.unlockProgress = 0;
          sounds.playVictory();
          onRescueHiders();

          for (const trapped of caughtHiders) {
            trapped.isCaught = false;
            // Scatter them outside cage
            trapped.x = rescueCage.x + rescueCage.width / 2 + (Math.random() * 140 - 70);
            trapped.y = rescueCage.y + rescueCage.height + 60;
            trapped.aiState = 'flee';
            trapped.aiWaitTimer = 0;
          }

          noiseRipples.push({
            x: cageGateX,
            y: cageGateY,
            radius: 10,
            maxRadius: 200,
            alpha: 0.8,
            source: 'cage_break',
          });
        }
        break;
      }
    }
  }

  rescueCage.isUnlocking = someoneUnlocking;
  if (!someoneUnlocking && rescueCage.unlockProgress > 0) {
    rescueCage.unlockProgress = Math.max(0, rescueCage.unlockProgress - dt * 25);
  }
}

// Killer AI
function updateKillerAI(
  killer: Player,
  players: Player[],
  obstacles: Obstacle[],
  dt: number,
  noiseRipples: NoiseRipple[]
) {
  // Check if killer sees any hider
  let closestTarget: Player | null = null;
  let closestDist = Infinity;

  for (const p of players) {
    if (p.isKiller || p.isCaught || p.isDead || p.isHidingInLocker) continue;

    const dist = getDist(killer.x, killer.y, p.x, p.y);
    if (dist > 440) continue;

    // Angle check for flashlight cone (75 degrees = 1.3 rad)
    const angleToTarget = Math.atan2(p.y - killer.y, p.x - killer.x);
    let angleDiff = Math.abs(angleToTarget - killer.angle);
    while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

    const isInFront = angleDiff < 0.65;
    const isVeryClose = dist < 70; // 360 degree close sensing

    if (isInFront || isVeryClose) {
      // If target is in bush, killer only sees them if within 60px
      if (p.isHidingInBush && dist > 60) continue;

      if (hasLineOfSight(killer.x, killer.y, p.x, p.y, obstacles)) {
        if (dist < closestDist) {
          closestDist = dist;
          closestTarget = p;
        }
      }
    }
  }

  // Also listen for noise ripples (footsteps / whistle / breaking cage)
  let noiseTarget: NoiseRipple | null = null;
  for (const ripple of noiseRipples) {
    if (getDist(killer.x, killer.y, ripple.x, ripple.y) < 650) {
      noiseTarget = ripple;
      break;
    }
  }

  if (closestTarget) {
    // CHASE MODE!
    if (killer.aiState !== 'chase') {
      sounds.playAlert();
    }
    killer.aiState = 'chase';
    killer.aiTargetX = closestTarget.x;
    killer.aiTargetY = closestTarget.y;

    const angle = Math.atan2(closestTarget.y - killer.y, closestTarget.x - killer.x);
    killer.angle = angle;
    killer.isSprinting = killer.sprintStamina > 10;
    const speed = killer.baseSpeed * (killer.isSprinting ? 1.35 : 1.0);
    killer.vx = Math.cos(angle) * speed;
    killer.vy = Math.sin(angle) * speed;
    if (killer.isSprinting) {
      killer.sprintStamina = Math.max(0, killer.sprintStamina - 20 * dt);
    }
  } else if (noiseTarget && killer.aiState !== 'chase') {
    // SEARCH NOISE!
    killer.aiState = 'search';
    killer.aiTargetX = noiseTarget.x;
    killer.aiTargetY = noiseTarget.y;

    const angle = Math.atan2(noiseTarget.y - killer.y, noiseTarget.x - killer.x);
    killer.angle = angle;
    killer.isSprinting = false;
    killer.vx = Math.cos(angle) * killer.baseSpeed * 1.1;
    killer.vy = Math.sin(angle) * killer.baseSpeed * 1.1;
  } else {
    // PATROL MODE
    killer.aiState = 'patrol';
    killer.isSprinting = false;

    if (!killer.aiTargetX || !killer.aiTargetY || getDist(killer.x, killer.y, killer.aiTargetX, killer.aiTargetY) < 50) {
      killer.aiWaitTimer = (killer.aiWaitTimer || 0) + dt;
      killer.vx = 0;
      killer.vy = 0;

      if (killer.aiWaitTimer > 1.2) {
        killer.aiWaitTimer = 0;
        // Pick new strategic room waypoint
        const waypoints = [
          { x: 300, y: 300 },   // Dining
          { x: 400, y: 800 },   // Kitchen
          { x: 1100, y: 250 },  // Great Foyer
          { x: 1100, y: 750 },  // Gazebo
          { x: 1800, y: 300 },  // Library North
          { x: 1800, y: 900 },  // Library South
          { x: 1100, y: 1200 }, // Prison Yard
          { x: 350, y: 1350 },  // Greenhouse
          { x: 1800, y: 1400 }, // Storage
        ];
        const nextWp = waypoints[Math.floor(Math.random() * waypoints.length)];
        killer.aiTargetX = nextWp.x;
        killer.aiTargetY = nextWp.y;
      }
    } else {
      const angle = Math.atan2(killer.aiTargetY - killer.y, killer.aiTargetX - killer.x);
      killer.angle = angle;
      killer.vx = Math.cos(angle) * (killer.baseSpeed * 0.85);
      killer.vy = Math.sin(angle) * (killer.baseSpeed * 0.85);
    }
  }
}

// Hider AI
function updateHiderAI(
  hider: Player,
  killer: Player,
  players: Player[],
  bushes: Bush[],
  lockers: Locker[],
  rescueCage: RescueCage,
  dt: number,
  _noiseRipples: NoiseRipple[]
) {
  if (hider.isCaught) {
    hider.vx = 0;
    hider.vy = 0;
    return;
  }

  const distToKiller = getDist(hider.x, hider.y, killer.x, killer.y);

  // 1. If killer is very close, panic and FLEE!
  if (distToKiller < 260) {
    hider.aiState = 'flee';
    hider.isSprinting = hider.sprintStamina > 15;

    // Run directly away from killer
    const awayAngle = Math.atan2(hider.y - killer.y, hider.x - killer.x);
    // Add small random jitter so they don't move in rigid straight lines
    const jitter = (Math.random() - 0.5) * 0.4;
    const finalAngle = awayAngle + jitter;

    hider.angle = finalAngle;
    const speed = hider.baseSpeed * (hider.isSprinting ? 1.4 : 1.0);
    hider.vx = Math.cos(finalAngle) * speed;
    hider.vy = Math.sin(finalAngle) * speed;
    if (hider.isSprinting) {
      hider.sprintStamina = Math.max(0, hider.sprintStamina - 25 * dt);
    }
    return;
  }

  // 2. If already safely in a bush and killer is not right on top of it, stay still!
  if (hider.isHidingInBush && distToKiller > 140) {
    hider.aiState = 'hide';
    hider.vx = 0;
    hider.vy = 0;
    return;
  }

  // 3. If there are captured friends and killer is far away, consider rescuing!
  const hasPrisoners = players.some((p) => !p.isKiller && p.isCaught);
  if (hasPrisoners && distToKiller > 500 && Math.random() < 0.35) {
    hider.aiState = 'rescue';
    const gateX = rescueCage.x + rescueCage.width / 2;
    const gateY = rescueCage.y + rescueCage.height + 25;
    const angle = Math.atan2(gateY - hider.y, gateX - hider.x);
    hider.angle = angle;
    hider.vx = Math.cos(angle) * hider.baseSpeed * 0.9;
    hider.vy = Math.sin(angle) * hider.baseSpeed * 0.9;
    return;
  }

  // 4. Otherwise, seek nearest bush or sneak to safe spot
  if (hider.aiState !== 'hide' || !hider.isHidingInBush) {
    // Find closest bush
    let closestBush: Bush | null = null;
    let closestBushDist = Infinity;
    for (const b of bushes) {
      const d = getDist(hider.x, hider.y, b.x, b.y);
      if (d < closestBushDist) {
        closestBushDist = d;
        closestBush = b;
      }
    }

    if (closestBush && closestBushDist > 20) {
      const angle = Math.atan2(closestBush.y - hider.y, closestBush.x - hider.x);
      hider.angle = angle;
      hider.vx = Math.cos(angle) * (hider.baseSpeed * 0.8);
      hider.vy = Math.sin(angle) * (hider.baseSpeed * 0.8);
    } else {
      hider.vx = 0;
      hider.vy = 0;
      hider.aiState = 'hide';
    }
  }
}
