import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  Globe, 
  User, 
  Skull, 
  Radio, 
  Zap, 
  Info,
  Trophy,
  Sparkles,
  Crosshair,
  Compass,
  Flame
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    title: "Hide & Seek: Stealth Arena",
    subtitle: "1 Killer vs 9 Hiders. Dynamic vision cones, bush stealth, noise waves & tactical audio radar.",
    playAsHider: "Play as Hider",
    playAsKiller: "Play as Killer",
    language: "Language",
    english: "English",
    romanUrdu: "Roman Urdu",
    hidersRemaining: "Hiders Left",
    caughtHiders: "Caught",
    timeRemaining: "Time Left",
    victory: "VICTORY!",
    defeat: "DEFEAT!",
    hiderWinMsg: "Time ran out! You successfully survived the hunt!",
    killerWinMsg: "Ruthless Hunt! You caught all 9 hiders in record time!",
    hiderLoseMsg: "The Killer spotted and captured you!",
    killerLoseMsg: "Time's up! Hiders managed to escape into the shadows!",
    controls: "WASD / Arrows = Move | SHIFT = Sprint | SPACE = Radar Pulse",
    stamina: "Stamina",
    stealthStatus: "Status",
    hidden: "HIDDEN IN BUSH",
    exposed: "EXPOSED",
    spotted: "SPOTTED BY KILLER!",
    radarPulse: "Radar Pulse",
    restart: "Play Again",
    mainMenu: "Main Menu",
    soundOn: "Sound On",
    soundOff: "Sound Off",
    difficulty: "AI Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    howToPlay: "Tactical Guide",
    rule1: "Avoid the Killer's red vision cone at all costs.",
    rule2: "Stepping into green bushes renders you invisible to normal vision.",
    rule3: "Sprinting creates sound rings that reveal your position to AI.",
    rule4: "Use Radar Pulse to ping hidden targets across the map.",
    roleDescriptionHider: "Blend into shadows, move silently, and survive for 2 minutes.",
    roleDescriptionKiller: "Patrol the arena, check bushes, and hunt all 9 hiders before time expires.",
    aiOperator: "Gemini Tactical AI",
    analyzing: "Analyzing match performance...",
    sprintBtn: "SPRINT",
    radarBtn: "RADAR"
  },
  ur: {
    title: "Chupam Chupai: Stealth Arena",
    subtitle: "1 Qaatil vs 9 Chupne Wale. Vision cones, bush stealth, noise waves aur audio radar k saath.",
    playAsHider: "Chupne Wala (Hider) Bano",
    playAsKiller: "Qaatil (Killer) Bano",
    language: "Zaban (Language)",
    english: "English",
    romanUrdu: "Roman Urdu",
    hidersRemaining: "Baqi Hiders",
    caughtHiders: "Pakde Gaye",
    timeRemaining: "Waqt Baqi",
    victory: "JEET GAYE!",
    defeat: "HAAR GAYE!",
    hiderWinMsg: "Waqt khatam ho gaya! Aap ne kamyabi se jaan bacha li!",
    killerWinMsg: "Zabardast! Aap ne tamaam 9 hiders ko waqt par pakad liya!",
    hiderLoseMsg: "Qaatil ne aap ko dekh liya aur pakad liya!",
    killerLoseMsg: "Waqt khatam ho gaya aur baqi hiders bach nikle!",
    controls: "WASD / Teer = Chalo | SHIFT = Tez Bhaago | SPACE = Radar Pulse",
    stamina: "Taqat (Stamina)",
    stealthStatus: "Status",
    hidden: "JHARI MEIN CHUPA HUA",
    exposed: "KHULA / ZAHER",
    spotted: "QAATIL NE DEKH LIYA!",
    radarPulse: "Radar Pulse",
    restart: "Dobara Khelein",
    mainMenu: "Main Menu",
    soundOn: "Aawaz On",
    soundOff: "Aawaz Off",
    difficulty: "Mushkiliat",
    easy: "Aasan",
    medium: "Normal",
    hard: "Mushkil",
    howToPlay: "Kaise Khelein",
    rule1: "Qaatil k laal vision cone se har keemat par bachna hai.",
    rule2: "Hari jhariyon (bushes) mein jaane se aap poori tarah ghaib ho jate hain.",
    rule3: "Tez bhaagne se aawaz ke rings bante hain jo AI ko aapka pata batate hain.",
    rule4: "Aas paas k logo ko dhoondne k liye Radar Pulse ka istemal karein.",
    roleDescriptionHider: "Saye mein chupo, khamoshi se chalo, 2 minute tak zinda raho.",
    roleDescriptionKiller: "Jhaadiyan check karo, hiders ko dhoondo aur 2 minute se pehle sab ko pakdo.",
    aiOperator: "Gemini Tactical AI",
    analyzing: "Match ka tajziya ho raha hai...",
    sprintBtn: "BHAAGO",
    radarBtn: "RADAR"
  }
};

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lastHeartbeat = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFootstep(isSprinting = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      
      const pitch = isSprinting ? 120 : 80;
      const dur = isSprinting ? 0.05 : 0.08;
      const vol = isSprinting ? 0.15 : 0.05;

      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + dur);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch (e) {
      // Audio fallback handling
    }
  }

  playCatch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  playRadar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  playHeartbeat(distance) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = Date.now();
    // Frequency increases as distance drops below 250px
    const interval = Math.max(200, Math.min(1000, distance * 3.5));

    if (now - this.lastHeartbeat > interval) {
      this.lastHeartbeat = now;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.12);
        
        const vol = Math.min(0.4, Math.max(0.05, (300 - distance) / 300));
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch (e) {}
    }
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.12);
        osc.stop(this.ctx.currentTime + idx * 0.12 + 0.35);
      } catch (e) {}
    });
  }

  playDefeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [320, 260, 200, 140];
    notes.forEach((freq, idx) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.15 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.15);
        osc.stop(this.ctx.currentTime + idx * 0.15 + 0.35);
      } catch (e) {}
    });
  }
}

const audio = new SoundEngine();

async function fetchGeminiCommentary(role, result, stats, lang) {
  try {
    const prompt = lang === 'ur'
      ? `Aap ek gaming commentator hain. Match result: Role=${role}, Result=${result}, Caught Hiders=${stats.caught}/9, Time Left=${stats.timeLeft}s.
         Roman Urdu mein 2 short energetic tactical lines dein player ki performance par.`
      : `You are a stealth game tactical commentator. Match summary: Role=${role}, Result=${result}, Caught Hiders=${stats.caught}/9, Time Left=${stats.timeLeft}s.
         Provide 2 brief, punchy, tactical commentary lines summarizing the player's performance.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: "Keep responses brief, engaging, and directly related to hide-and-seek stealth gameplay." }] }
      })
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    return null;
  }
}

export default function App() {
  const [lang, setLang] = useState('ur');
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [playerRole, setPlayerRole] = useState('hider'); // 'hider', 'killer'
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [muted, setMuted] = useState(false);
  const [gameResult, setGameResult] = useState(null); // 'win', 'lose'

  // Game Metrics
  const [timeLeft, setTimeLeft] = useState(120);
  const [hidersRemaining, setHidersRemaining] = useState(9);
  const [caughtCount, setCaughtCount] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [isPlayerHidden, setIsPlayerHidden] = useState(false);
  const [isPlayerSpotted, setIsPlayerSpotted] = useState(false);
  const [radarCooldown, setRadarCooldown] = useState(0); // 0 to 100%

  // Commentary state
  const [aiCommentary, setAiCommentary] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Mobile Touch States
  const [mobileTouchDir, setMobileTouchDir] = useState({ x: 0, y: 0 });
  const [isMobileSprinting, setIsMobileSprinting] = useState(false);

  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const gameLoopRef = useRef(null);
  const gameTimeRef = useRef(120);

  const t = TRANSLATIONS[lang];

  const toggleSound = () => {
    audio.muted = !muted;
    setMuted(!muted);
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ur' : 'en'));
  };

  const startGame = (role) => {
    setPlayerRole(role);
    setGameState('playing');
    setTimeLeft(120);
    gameTimeRef.current = 120;
    setHidersRemaining(9);
    setCaughtCount(0);
    setStamina(100);
    setIsPlayerHidden(false);
    setIsPlayerSpotted(false);
    setRadarCooldown(0);
    setGameResult(null);
    setAiCommentary("");
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Fixed canvas coordinates system
    const width = 1000;
    const height = 650;
    canvas.width = width;
    canvas.height = height;

    // Arena map obstacles
    const obstacles = [
      { x: 150, y: 120, w: 120, h: 100 },
      { x: 400, y: 80, w: 200, h: 60 },
      { x: 720, y: 140, w: 100, h: 160 },
      { x: 180, y: 380, w: 140, h: 140 },
      { x: 450, y: 300, w: 100, h: 100 },
      { x: 680, y: 420, w: 160, h: 100 },
      { x: 380, y: 500, w: 180, h: 70 }
    ];

    // Arena map bushes
    const bushes = [
      { x: 80, y: 80, r: 42 },
      { x: 320, y: 150, r: 45 },
      { x: 630, y: 90, r: 38 },
      { x: 880, y: 220, r: 52 },
      { x: 100, y: 300, r: 45 },
      { x: 580, y: 220, r: 40 },
      { x: 860, y: 380, r: 42 },
      { x: 120, y: 550, r: 50 },
      { x: 600, y: 550, r: 45 },
      { x: 880, y: 560, r: 40 }
    ];

    // Entities Setup
    let entities = [];
    let radarWaves = [];
    let noiseRings = [];
    let lastPulseTime = 0;
    let localStamina = 100;
    let localRadarCooldown = 0;

    // Difficulty params
    const diffMultipliers = {
      easy: { speed: 2.2, visionAngle: 60, visionRadius: 210 },
      medium: { speed: 2.7, visionAngle: 75, visionRadius: 240 },
      hard: { speed: 3.2, visionAngle: 90, visionRadius: 280 }
    };
    const currentDiff = diffMultipliers[difficulty];

    // Player Initialization
    const playerObj = {
      id: 'player',
      isPlayer: true,
      role: playerRole,
      x: playerRole === 'killer' ? 500 : 90 + Math.random() * 800,
      y: playerRole === 'killer' ? 325 : 90 + Math.random() * 450,
      r: 12,
      angle: 0,
      caught: false,
      hidden: false,
      spotted: false,
      color: playerRole === 'killer' ? '#ef4444' : '#3b82f6'
    };

    entities.push(playerObj);

    // AI Entities Setup
    if (playerRole === 'hider') {
      // 1 AI Killer
      entities.push({
        id: 'killer',
        isPlayer: false,
        role: 'killer',
        x: 500,
        y: 325,
        r: 14,
        angle: 0,
        targetX: 500,
        targetY: 325,
        color: '#ef4444',
        state: 'patrol',
        patrolTimer: 0,
        speed: currentDiff.speed,
        visionAngle: currentDiff.visionAngle,
        visionRadius: currentDiff.visionRadius
      });

      // 8 AI Hiders
      for (let i = 0; i < 8; i++) {
        let sx, sy;
        do {
          sx = 60 + Math.random() * (width - 120);
          sy = 60 + Math.random() * (height - 120);
        } while (Math.hypot(sx - 500, sy - 325) < 200);

        entities.push({
          id: `hider_${i}`,
          isPlayer: false,
          role: 'hider',
          x: sx,
          y: sy,
          r: 11,
          angle: Math.random() * Math.PI * 2,
          caught: false,
          hidden: false,
          targetX: sx,
          targetY: sy,
          color: '#3b82f6',
          speed: 2.2
        });
      }
    } else {
      // Player is Killer -> 9 AI Hiders
      for (let i = 0; i < 9; i++) {
        let sx, sy;
        do {
          sx = 60 + Math.random() * (width - 120);
          sy = 60 + Math.random() * (height - 120);
        } while (Math.hypot(sx - 500, sy - 325) < 200);

        entities.push({
          id: `hider_${i}`,
          isPlayer: false,
          role: 'hider',
          x: sx,
          y: sy,
          r: 11,
          angle: Math.random() * Math.PI * 2,
          caught: false,
          hidden: false,
          targetX: sx,
          targetY: sy,
          color: '#3b82f6',
          speed: 2.2
        });
      }
    }

    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.code === 'Space') {
        triggerRadarPulse();
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const checkObstacleCollision = (nx, ny, radius) => {
      if (nx - radius < 0 || nx + radius > width || ny - radius < 0 || ny + radius > height) {
        return true;
      }
      for (let obs of obstacles) {
        if (
          nx + radius > obs.x &&
          nx - radius < obs.x + obs.w &&
          ny + radius > obs.y &&
          ny - radius < obs.y + obs.h
        ) {
          return true;
        }
      }
      return false;
    };

    const checkBushHidden = (x, y) => {
      for (let bush of bushes) {
        const dist = Math.hypot(x - bush.x, y - bush.y);
        if (dist < bush.r * 0.7) {
          return true;
        }
      }
      return false;
    };

    const triggerRadarPulse = () => {
      const now = Date.now();
      if (now - lastPulseTime > 8000) {
        lastPulseTime = now;
        audio.playRadar();
        const p = entities.find(e => e.isPlayer);
        radarWaves.push({ x: p.x, y: p.y, r: 0, maxR: 700, alpha: 1 });
        localRadarCooldown = 100;
      }
    };

    // Timer Interval
    const timerInterval = setInterval(() => {
      gameTimeRef.current -= 1;
      setTimeLeft(gameTimeRef.current);

      if (gameTimeRef.current <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }, 1000);

    const endGame = (forcedResult) => {
      let result = 'lose';
      const aliveHiders = entities.filter(e => e.role === 'hider' && !e.caught).length;

      if (forcedResult) {
        result = forcedResult;
      } else {
        if (playerRole === 'hider') {
          result = playerObj.caught ? 'lose' : 'win';
        } else {
          result = aliveHiders === 0 ? 'win' : 'lose';
        }
      }

      setGameResult(result);
      setGameState('gameover');

      if (result === 'win') audio.playVictory();
      else audio.playDefeat();

      // Trigger AI Commentary
      setIsAiLoading(true);
      fetchGeminiCommentary(playerRole, result, {
        caught: 9 - aliveHiders,
        timeLeft: gameTimeRef.current
      }, lang).then(commentary => {
        setAiCommentary(commentary || (result === 'win' ? "Masterclass in stealth tactics!" : "Defeated! Sharpen your reflexes next time."));
        setIsAiLoading(false);
      });
    };

    let footstepFrame = 0;

    const updateAndRender = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Grid Ground
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Render Obstacles
      obstacles.forEach(obs => {
        ctx.fillStyle = '#334155';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      });

      // 3. Update Player Movement
      let dx = 0;
      let dy = 0;

      if (keysRef.current['w'] || keysRef.current['arrowup']) dy -= 1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) dy += 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) dx -= 1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) dx += 1;

      // Mobile Touch overrides
      if (mobileTouchDir.x !== 0 || mobileTouchDir.y !== 0) {
        dx = mobileTouchDir.x;
        dy = mobileTouchDir.y;
      }

      const isSprinting = (keysRef.current['shift'] || isMobileSprinting) && localStamina > 5;
      
      if (isSprinting && (dx !== 0 || dy !== 0)) {
        localStamina = Math.max(0, localStamina - 0.4);
      } else {
        localStamina = Math.min(100, localStamina + 0.25);
      }
      setStamina(Math.round(localStamina));

      // Radar Cooldown decay
      if (localRadarCooldown > 0) {
        localRadarCooldown = Math.max(0, localRadarCooldown - 0.25);
        setRadarCooldown(Math.round(localRadarCooldown));
      }

      const moveSpeed = isSprinting ? 4.2 : 2.4;

      if ((dx !== 0 || dy !== 0) && !playerObj.caught) {
        const angle = Math.atan2(dy, dx);
        playerObj.angle = angle;

        const moveX = Math.cos(angle) * moveSpeed;
        const moveY = Math.sin(angle) * moveSpeed;

        if (!checkObstacleCollision(playerObj.x + moveX, playerObj.y, playerObj.r)) {
          playerObj.x += moveX;
        }
        if (!checkObstacleCollision(playerObj.x, playerObj.y + moveY, playerObj.r)) {
          playerObj.y += moveY;
        }

        // Footsteps & Noise Rings
        footstepFrame++;
        if (footstepFrame % (isSprinting ? 12 : 22) === 0) {
          audio.playFootstep(isSprinting);
          if (isSprinting) {
            noiseRings.push({ x: playerObj.x, y: playerObj.y, r: 10, maxR: 120, alpha: 0.6 });
          }
        }
      }

      // 4. Update Hiding Status
      entities.forEach(ent => {
        ent.hidden = checkBushHidden(ent.x, ent.y);
      });

      if (playerObj.isPlayer) {
        setIsPlayerHidden(playerObj.hidden);
      }

      // 5. Update AI Behavior
      const killer = entities.find(e => e.role === 'killer');

      entities.forEach(ent => {
        if (ent.isPlayer || ent.caught) return;

        if (ent.role === 'hider') {
          // Hider AI Logic
          const distToKiller = killer ? Math.hypot(ent.x - killer.x, ent.y - killer.y) : 999;

          if (distToKiller < 180 && !ent.hidden) {
            // Flee from killer
            const fleeAngle = Math.atan2(ent.y - killer.y, ent.x - killer.x);
            const moveX = Math.cos(fleeAngle) * 3.0;
            const moveY = Math.sin(fleeAngle) * 3.0;
            if (!checkObstacleCollision(ent.x + moveX, ent.y + moveY, ent.r)) {
              ent.x += moveX;
              ent.y += moveY;
              ent.angle = fleeAngle;
            }
          } else if (!ent.hidden && Math.random() < 0.03) {
            // Seek nearest bush
            let nearestBush = bushes[0];
            let minDist = 9999;
            bushes.forEach(b => {
              const d = Math.hypot(ent.x - b.x, ent.y - b.y);
              if (d < minDist) {
                minDist = d;
                nearestBush = b;
              }
            });
            const angle = Math.atan2(nearestBush.y - ent.y, nearestBush.x - ent.x);
            const moveX = Math.cos(angle) * ent.speed;
            const moveY = Math.sin(angle) * ent.speed;
            if (!checkObstacleCollision(ent.x + moveX, ent.y + moveY, ent.r)) {
              ent.x += moveX;
              ent.y += moveY;
              ent.angle = angle;
            }
          }
        } else if (ent.role === 'killer') {
          // Killer AI Logic
          if (ent.state === 'patrol') {
            const distToTarget = Math.hypot(ent.x - ent.targetX, ent.y - ent.targetY);
            if (distToTarget < 20 || ent.patrolTimer <= 0) {
              ent.targetX = 80 + Math.random() * (width - 160);
              ent.targetY = 80 + Math.random() * (height - 160);
              ent.patrolTimer = 180 + Math.random() * 120;
            }
            ent.patrolTimer--;

            // Move towards target
            const angle = Math.atan2(ent.targetY - ent.y, ent.targetX - ent.x);
            ent.angle = angle;
            const moveX = Math.cos(angle) * ent.speed;
            const moveY = Math.sin(angle) * ent.speed;
            if (!checkObstacleCollision(ent.x + moveX, ent.y + moveY, ent.r)) {
              ent.x += moveX;
              ent.y += moveY;
            }

            // Check if any exposed hider is in sight or hearing range
            entities.forEach(target => {
              if (target.role === 'hider' && !target.caught) {
                const dist = Math.hypot(target.x - ent.x, target.y - ent.y);
                if (dist < ent.visionRadius && !target.hidden) {
                  ent.state = 'hunt';
                  ent.huntTarget = target;
                }
              }
            });
          } else if (ent.state === 'hunt') {
            const target = ent.huntTarget;
            if (!target || target.caught || (target.hidden && Math.hypot(target.x - ent.x, target.y - ent.y) > 40)) {
              ent.state = 'patrol';
            } else {
              const angle = Math.atan2(target.y - ent.y, target.x - ent.x);
              ent.angle = angle;
              const moveX = Math.cos(angle) * (ent.speed * 1.25);
              const moveY = Math.sin(angle) * (ent.speed * 1.25);
              if (!checkObstacleCollision(ent.x + moveX, ent.y + moveY, ent.r)) {
                ent.x += moveX;
                ent.y += moveY;
              }
            }
          }
        }
      });

      // Heartbeat audio trigger for player hider
      if (playerRole === 'hider' && killer) {
        const distToKiller = Math.hypot(playerObj.x - killer.x, playerObj.y - killer.y);
        if (distToKiller < 280) {
          audio.playHeartbeat(distToKiller);
        }
      }

      // Killer Vision Cone Rendering & Catch logic
      if (killer) {
        const fovRad = (killer.visionAngle || 75) * (Math.PI / 180);
        const startAngle = killer.angle - fovRad / 2;
        const endAngle = killer.angle + fovRad / 2;
        const visRadius = killer.visionRadius || 240;

        // Vision Cone Polygon
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(killer.x, killer.y);
        ctx.arc(killer.x, killer.y, visRadius, startAngle, endAngle);
        ctx.closePath();

        const grad = ctx.createRadialGradient(killer.x, killer.y, 20, killer.x, killer.y, visRadius);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // Check catches
        entities.forEach(ent => {
          if (ent.role === 'hider' && !ent.caught) {
            const dist = Math.hypot(ent.x - killer.x, ent.y - killer.y);
            const angleToEnt = Math.atan2(ent.y - killer.y, ent.x - killer.x);
            let angleDiff = Math.abs(angleToEnt - killer.angle);
            if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

            const inCone = angleDiff < fovRad / 2 && dist < visRadius;

            if (ent.isPlayer) {
              setIsPlayerSpotted(inCone && !ent.hidden);
            }

            // Catch Condition: Close contact OR spotted outside bush
            if (dist < 22 || (inCone && !ent.hidden && dist < 120)) {
              ent.caught = true;
              audio.playCatch();

              if (ent.isPlayer && playerRole === 'hider') {
                endGame('lose');
              }
            }
          }
        });
      }

      // Update remaining counter
      const activeHiders = entities.filter(e => e.role === 'hider' && !e.caught).length;
      setHidersRemaining(activeHiders);
      setCaughtCount(9 - activeHiders);

      if (playerRole === 'killer' && activeHiders === 0) {
        endGame('win');
      }

      // 6. Render Noise Rings
      noiseRings.forEach((ring, idx) => {
        ring.r += 3;
        ring.alpha -= 0.02;
        if (ring.alpha <= 0) {
          noiseRings.splice(idx, 1);
        } else {
          ctx.strokeStyle = `rgba(239, 68, 68, ${ring.alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 7. Render Radar Waves
      radarWaves.forEach((wave, idx) => {
        wave.r += 12;
        wave.alpha -= 0.015;
        if (wave.alpha <= 0) {
          radarWaves.splice(idx, 1);
        } else {
          ctx.strokeStyle = `rgba(6, 182, 212, ${wave.alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, wave.r, 0, Math.PI * 2);
          ctx.stroke();

          // Radar Ping Dots
          entities.forEach(ent => {
            if (!ent.caught) {
              const d = Math.hypot(ent.x - wave.x, ent.y - wave.y);
              if (Math.abs(d - wave.r) < 20) {
                ctx.fillStyle = ent.role === 'killer' ? '#ef4444' : '#22c55e';
                ctx.beginPath();
                ctx.arc(ent.x, ent.y, 8, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
        }
      });

      // 8. Render Entities
      entities.forEach(ent => {
        if (ent.caught) return;

        // Skip rendering hidden hiders if player is killer (unless close or radar active)
        if (ent.role === 'hider' && ent.hidden && !ent.isPlayer && playerRole === 'killer') {
          return;
        }

        ctx.save();
        ctx.translate(ent.x, ent.y);
        ctx.rotate(ent.angle);

        // Character Body
        ctx.fillStyle = ent.hidden ? '#10b981' : ent.color;
        ctx.beginPath();
        ctx.arc(0, 0, ent.r, 0, Math.PI * 2);
        ctx.fill();

        // Direction Pointer / Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ent.r * 0.5, -3, 3, 0, Math.PI * 2);
        ctx.arc(ent.r * 0.5, 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 9. Render Bushes (Top Layer for Stealth Depth)
      bushes.forEach(bush => {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.75)';
        ctx.beginPath();
        ctx.arc(bush.x, bush.y, bush.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      gameLoopRef.current = requestAnimationFrame(updateAndRender);
    };

    gameLoopRef.current = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(gameLoopRef.current);
      clearInterval(timerInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, playerRole, difficulty]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 font-sans p-2 sm:p-4 selection:bg-cyan-500 selection:text-black">
      
      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 px-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl mb-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h1 className="text-lg font-bold tracking-wide text-cyan-300 hidden sm:block">Chupam Chupai</h1>
          <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">v2.0 Stealth</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'Urdu' : 'English'}</span>
          </button>

          <button 
            onClick={toggleSound}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition text-slate-300"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* GAMEPLAY HUD */}
        {gameState === 'playing' && (
          <div className="flex flex-wrap items-center justify-between bg-slate-950/90 border-b border-slate-800 px-4 py-2 text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" />
                <span>{t.hidersRemaining}: <strong className="text-blue-400 text-sm">{hidersRemaining}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-red-400" />
                <span>{t.caughtHiders}: <strong className="text-red-400 text-sm">{caughtCount}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              <Compass className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-slate-400">{t.timeRemaining}:</span>
              <strong className="text-amber-400 text-base">{timeLeft}s</strong>
            </div>

            <div className="flex items-center gap-4">
              {/* Stealth Status Indicator */}
              <div className="flex items-center gap-1.5">
                {isPlayerSpotted ? (
                  <span className="flex items-center gap-1 bg-red-950/80 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] animate-bounce">
                    <Eye className="w-3 h-3" /> {t.spotted}
                  </span>
                ) : isPlayerHidden ? (
                  <span className="flex items-center gap-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                    <EyeOff className="w-3 h-3" /> {t.hidden}
                  </span>
                ) : (
                  <span className="text-slate-500 text-[10px]">{t.exposed}</span>
                )}
              </div>

              {/* Stamina Bar */}
              <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all duration-150 ${stamina < 20 ? 'bg-red-500' : 'bg-cyan-400'}`}
                  style={{ width: `${stamina}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* CANVAS DISPLAY */}
        <div className="relative aspect-[10/6.5] w-full bg-slate-950 flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />

          {/* MAIN MENU OVERLAY */}
          {gameState === 'menu' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 px-3 py-1 rounded-full text-xs font-mono mb-4">
                <Sparkles className="w-3.5 h-3.5" /> 10-Player Stealth Arena Simulation
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 mb-2">
                {t.title}
              </h2>
              <p className="text-slate-400 max-w-lg text-xs sm:text-sm mb-6">
                {t.subtitle}
              </p>

              {/* Role Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-6">
                <button
                  onClick={() => startGame('hider')}
                  className="group relative flex flex-col items-start p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <User className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">SURVIVAL</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{t.playAsHider}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.roleDescriptionHider}</p>
                </button>

                <button
                  onClick={() => startGame('killer')}
                  className="group relative flex flex-col items-start p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-red-500/50 rounded-xl text-left transition-all shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Skull className="w-6 h-6 text-red-500 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800">HUNTER</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{t.playAsKiller}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.roleDescriptionKiller}</p>
                </button>
              </div>

              {/* AI Difficulty Selector */}
              <div className="flex items-center gap-2 mb-6 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">{t.difficulty}:</span>
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold transition capitalize ${
                      difficulty === level 
                        ? 'bg-cyan-500 text-slate-950 shadow-md' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {t[level]}
                  </button>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 max-w-xl text-left text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                  <Info className="w-3.5 h-3.5" /> {t.howToPlay}
                </div>
                <p>• {t.rule1}</p>
                <p>• {t.rule2}</p>
                <p>• {t.rule3}</p>
                <p>• {t.rule4}</p>
              </div>
            </div>
          )}

          {/* GAME OVER OVERLAY */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="p-3 rounded-full bg-slate-900 border border-slate-800 mb-3 shadow-xl">
                {gameResult === 'win' ? (
                  <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
                ) : (
                  <Skull className="w-12 h-12 text-red-500 animate-pulse" />
                )}
              </div>

              <h2 className={`text-3xl sm:text-5xl font-black mb-2 tracking-tight ${gameResult === 'win' ? 'text-amber-400' : 'text-red-500'}`}>
                {gameResult === 'win' ? t.victory : t.defeat}
              </h2>

              <p className="text-slate-300 text-sm max-w-md mb-4">
                {gameResult === 'win'
                  ? (playerRole === 'hider' ? t.hiderWinMsg : t.killerWinMsg)
                  : (playerRole === 'hider' ? t.hiderLoseMsg : t.killerLoseMsg)}
              </p>

              {/* Gemini AI Commentary Box */}
              <div className="bg-slate-900 border border-cyan-900/50 rounded-xl p-4 max-w-md w-full mb-6 text-left relative overflow-hidden">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold mb-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> {t.aiOperator}
                </div>
                {isAiLoading ? (
                  <p className="text-xs text-slate-500 italic animate-pulse">{t.analyzing}</p>
                ) : (
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">{aiCommentary}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startGame(playerRole)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg transition"
                >
                  <RotateCcw className="w-4 h-4" /> {t.restart}
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition"
                >
                  {t.mainMenu}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM MOBILE CONTROLS & DESKTOP CONTROLS FOOTER */}
        {gameState === 'playing' && (
          <div className="bg-slate-950 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2">
            
            {/* On-screen D-Pad for Mobile Touch Controls */}
            <div className="flex items-center gap-1 sm:hidden">
              <div className="grid grid-cols-3 gap-1 w-28 h-28 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <div />
                <button 
                  onTouchStart={() => setMobileTouchDir({ x: 0, y: -1 })} 
                  onTouchEnd={() => setMobileTouchDir({ x: 0, y: 0 })}
                  className="bg-slate-800 active:bg-cyan-500 rounded flex items-center justify-center text-xs font-bold"
                >▲</button>
                <div />
                <button 
                  onTouchStart={() => setMobileTouchDir({ x: -1, y: 0 })} 
                  onTouchEnd={() => setMobileTouchDir({ x: 0, y: 0 })}
                  className="bg-slate-800 active:bg-cyan-500 rounded flex items-center justify-center text-xs font-bold"
                >◄</button>
                <div className="bg-slate-950 rounded flex items-center justify-center text-[8px] text-slate-600 font-mono">PAD</div>
                <button 
                  onTouchStart={() => setMobileTouchDir({ x: 1, y: 0 })} 
                  onTouchEnd={() => setMobileTouchDir({ x: 0, y: 0 })}
                  className="bg-slate-800 active:bg-cyan-500 rounded flex items-center justify-center text-xs font-bold"
                >►</button>
                <div />
                <button 
                  onTouchStart={() => setMobileTouchDir({ x: 0, y: 1 })} 
                  onTouchEnd={() => setMobileTouchDir({ x: 0, y: 0 })}
                  className="bg-slate-800 active:bg-cyan-500 rounded flex items-center justify-center text-xs font-bold"
                >▼</button>
                <div />
              </div>
            </div>

            <div className="hidden sm:block text-xs font-mono text-slate-400">
              {t.controls}
            </div>

            {/* Tactical Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onTouchStart={() => setIsMobileSprinting(true)}
                onTouchEnd={() => setIsMobileSprinting(false)}
                onMouseDown={() => setIsMobileSprinting(true)}
                onMouseUp={() => setIsMobileSprinting(false)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs transition ${
                  isMobileSprinting 
                    ? 'bg-amber-500 text-slate-950 border-amber-400' 
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>{t.sprintBtn}</span>
              </button>

              <button
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { code: 'Space' });
                  window.dispatchEvent(event);
                }}
                disabled={radarCooldown > 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs transition ${
                  radarCooldown === 0
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 shadow-md'
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{t.radarBtn} {radarCooldown > 0 && `(${Math.ceil(radarCooldown / 10)}s)`}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}