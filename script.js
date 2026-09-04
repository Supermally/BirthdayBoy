/**
 * ==========================================================================
 * SPLATFEST: OUR STORY — COMPLETE ENGINE WITH REFINED GAMEPLAY & BOSS MECHANICS
 * Includes Deltarune Vessel Maker Intro (§21)
 * ==========================================================================
 */

// Hardcoded target date/time (§16): September 8, 2026, 12:00 AM Eastern Time (EDT / UTC-4)
const UNLOCK_DATE = new Date('2026-09-08T00:00:00-04:00');

const MUSIC_PLAYLIST = [
  { title: 'Born2Run - Penelope Scott', src: './music/born2run.mp3' },
  { title: 'Hammerhead - Penelope Scott', src: './music/hammerhead.mp3' },
  { title: 'Rät - Penelope Scott', src: './music/rat.mp3' },
];

const GRAND_FINALE_TRACK = {
  title: "7 O'Clock",
  src: './music/7_OClock.mp3'
};
let finaleAudio = null;

function playGrandFinaleMusic() {
  sound.stopBattleMusic();
  sound.stopAmbientSynth();
  if (playlist) {
    playlist.stop();
  }

  if (!finaleAudio) {
    finaleAudio = new Audio(GRAND_FINALE_TRACK.src);
    finaleAudio.loop = true;
    finaleAudio.volume = 0.55;
  }

  const tickerEl = document.getElementById('audio-ticker');
  const tickerText = document.getElementById('ticker-text');
  if (tickerText) tickerText.textContent = `♪ ${GRAND_FINALE_TRACK.title}`;
  if (tickerEl) tickerEl.removeAttribute('hidden');

  if (sound && !sound.isAmbientMuted) {
    finaleAudio.play().catch(e => {
      console.log('Grand finale audio autoplay waiting for interaction:', e);
    });
  }
}

function stopGrandFinaleMusic() {
  if (finaleAudio) {
    finaleAudio.pause();
    finaleAudio.currentTime = 0;
  }
  const tickerEl = document.getElementById('audio-ticker');
  if (tickerEl) tickerEl.setAttribute('hidden', '');
}

const CONFIG = {
  photoPath1: './photos/photo1.jpg',
  photoPath2: './photos/photo2.jpg',
  playerName: 'Zaman67', // The game decides: Zaman67!
  rivalName: 'THE CLOCK',
  matchDurationSec: 50,
  mvpTitle: 'Zaman67',
};

// In-World Ink Color Swatches (§10)
const INK_SWATCHES = [
  { id: 'reef', name: 'Reef', color: '#ff6b4a' },
  { id: 'bubblegum', name: 'Bubblegum', color: '#ff4081' },
  { id: 'wasabi', name: 'Wasabi', color: '#76ff03' },
  { id: 'abyss', name: 'Abyss', color: '#b388ff' },
  { id: 'cyan', name: 'Cyan', color: '#00e5ff' },
  { id: 'sunburst', name: 'Sunburst', color: '#ffd23f' }
];

// --- 2. MULTI-ROUND SPLATFEST & SESSION MEMORY (§18) ---
const sessionMemory = {
  playthroughCount: 0,
  timesWon: 0,
  easterEggFound: false,
  colorsTried: new Set(['reef']),
  midMatchFightCompleted: false,
  bossDefeated: false,
  vesselCreated: false,
  tilesStolenTotal: 0,
  lastPlayerTurfPct: 0,
  lastRivalTurfPct: 0,
};

// 3 Full Tournament Matches before the Boss Gate!
const ROUNDS_CONFIG = {
  1: {
    title: 'ROUND 1: QUALIFIERS',
    rivalSpeed: 380,
    huntProb: 0.20,
    noteSeal: 'ROUND 1 CLEAR',
    noteText: `Happy Birthday! 🎉

Qualifiers complete! You proved your turf inking instincts are top tier.

Think you can defend the territory when the rival increases their ink output?`,
    buttonText: 'ENTER ROUND 2: CLASH!',
    nextAction: 'round_2',
  },
  2: {
    title: 'ROUND 2: SEMI-FINALS',
    rivalSpeed: 320,
    huntProb: 0.28,
    noteSeal: 'ROUND 2 CLEAR',
    noteText: `INCREDIBLE! 🌟

You held the line through the Semi-Finals! The rival was fast, but your turf coverage took the stage.

Ready for the Championship Finals?`,
    buttonText: 'ENTER ROUND 3: FINALS!',
    nextAction: 'round_3',
  },
  3: {
    title: 'ROUND 3: FINALS',
    rivalSpeed: 270,
    huntProb: 0.35,
    noteSeal: 'CHAMPION',
    noteText: `CHAMPIONSHIP VICTORY! 🏆

You conquered all three rounds! But wait...

The rival drops their Splattershot and refuses to accept defeat! They're mutating into a MEGA RIVAL!`,
    buttonText: 'CONFRONT MEGA RIVAL!',
    nextAction: 'boss_gate',
  },
  4: {
    title: 'GRAND FINALE',
    noteSeal: 'SPECIAL AGENT',
    noteText: `Happy Birthday! 🎉

I hope you enjoyed this little game I put together, and I hope you have an INKY birthday... okay, that was a little corny, but still. HAPPY BIRTHDAYY. 😭

And now, to write everything I love about... you. :)

I love the way you talk about your interests and how you just light up when you do. I love how caring and considerate you are. I love how dedicated you are to your academics, even if sometimes that dedication scares me a little. I love how you always make an effort, even in the little things.

And most of all, I love you.

Happy birthday, Zaman. ❤️

— Malachi`,
    buttonText: 'OUR NEXT ADVENTURE ❤️',
    nextAction: 'forward',
  }
};

// --- 3. PIXEL SPRITE MATRICES ---
const PLAYER_SPRITE_PIXELS = [
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1],
  [1, 1, 2, 3, 1, 1, 1, 1, 3, 2, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
  [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const RIVAL_SPRITE_PIXELS = [
  [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1],
  [1, 1, 3, 2, 1, 1, 1, 1, 2, 3, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
  [1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Fake Vessel Silhouettes for Deltarune Intro
const VESSEL_KRAKEN_PIXELS = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 0],
  [0, 1, 3, 2, 1, 1, 1, 1, 2, 3, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
  [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const VESSEL_OCTO_PIXELS = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1],
  [1, 1, 2, 3, 3, 2, 2, 3, 3, 2, 1, 1],
  [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
  [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const VESSEL_PHANTOM_PIXELS = [
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 0],
  [0, 1, 1, 2, 3, 1, 1, 3, 2, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const MOSQUITO_SPRITE_PIXELS = [
  [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 3, 1, 3, 0, 0, 0, 0, 0],
  [4, 4, 0, 1, 1, 1, 1, 1, 0, 4, 4, 0],
  [4, 4, 4, 1, 1, 1, 1, 1, 4, 4, 4, 0],
  [0, 4, 4, 0, 2, 2, 2, 0, 4, 4, 0, 0],
  [0, 0, 1, 2, 1, 2, 1, 2, 1, 0, 0, 0],
  [0, 1, 0, 2, 2, 2, 2, 2, 0, 1, 0, 0],
  [1, 0, 0, 0, 2, 1, 2, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const MOSQUITO_PALETTE = {
  1: '#374151',
  2: '#ef4444',
  3: '#ff0055',
  4: '#00f0ff',
  5: '#ffd23f'
};

function generateSVGFromMatrix(matrix, primaryColor, customPalette = null) {
  const size = 12;
  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = matrix[r][c];
      if (val !== 0) {
        let fill = primaryColor;
        if (customPalette && customPalette[val]) {
          fill = customPalette[val];
        } else {
          if (val === 2) fill = '#ffffff';
          if (val === 3) fill = 'var(--void)';
        }
        rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="${fill}" />`;
      }
    }
  }
  return `<svg class="sprite-pixel-art" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects}</svg>`;
}

// --- 4. WEB AUDIO SYNTHESIZER ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.battleGain = null;
    this.isAmbientMuted = true;
    this.ambientSynthInterval = null;
    this.ambientChordIndex = 0;
    this.activeBattleLoopInterval = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isAmbientMuted ? 0.0 : 1.0;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.45;
        this.sfxGain.connect(this.masterGain);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = this.isAmbientMuted ? 0.0 : 0.22;
        this.ambientGain.connect(this.masterGain);

        this.battleGain = this.ctx.createGain();
        this.battleGain.gain.value = 0.0;
        this.battleGain.connect(this.masterGain);
      }
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended' && !this.isAmbientMuted) {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleAmbientMute() {
    if (typeof setAudioMute === 'function') {
      setAudioMute(!this.isAmbientMuted);
    } else {
      this.isAmbientMuted = !this.isAmbientMuted;
    }
    return this.isAmbientMuted;
  }

  setAmbientGain(level) {
    if (!this.ambientGain || !this.ctx || this.isAmbientMuted) return;
    const t = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(t);
    this.ambientGain.gain.linearRampToValueAtTime(Math.max(0.01, Math.min(0.4, level)), t + 0.3);
  }

  startAmbientSynth() {
    if (this.ambientSynthInterval || this.isAmbientMuted) return;
    const chords = [
      [261.6, 329.6, 392.0, 493.9],
      [220.0, 261.6, 329.6, 392.0],
      [174.6, 220.0, 261.6, 329.6],
      [196.0, 246.9, 293.7, 349.2],
    ];

    const playChord = () => {
      if (!this.ctx || this.isAmbientMuted) return;
      const t = this.ctx.currentTime;
      const currentChord = chords[this.ambientChordIndex % chords.length];
      this.ambientChordIndex++;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, t);
      filter.connect(this.ambientGain);

      currentChord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.5, t);
        g.gain.setValueAtTime(0.01, t);
        g.gain.linearRampToValueAtTime(0.04, t + 0.8);
        g.gain.linearRampToValueAtTime(0.001, t + 3.8);

        osc.connect(g);
        g.connect(filter);
        osc.start(t);
        osc.stop(t + 4.0);
      });
    };

    playChord();
    this.ambientSynthInterval = setInterval(playChord, 3800);
  }

  stopAmbientSynth() {
    if (this.ambientSynthInterval) {
      clearInterval(this.ambientSynthInterval);
      this.ambientSynthInterval = null;
    }
  }

  playStaticNoise() {
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.18);
      noise.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
    } catch (e) {}
  }

  startBattleMusic(isBoss = false) {
    this.resume();
    if (!this.ctx) return;
    this.stopBattleMusic();

    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    }
    if (this.battleGain) {
      this.battleGain.gain.setValueAtTime(isBoss ? 0.35 : 0.28, this.ctx.currentTime);
    }

    const tempo = isBoss ? 160 : 145;
    const stepTime = (60 / tempo) / 4;
    let step = 0;

    const bassNotes = isBoss 
      ? [130.8, 130.8, 164.8, 196.0, 146.8, 146.8, 174.6, 220.0] 
      : [110.0, 110.0, 130.8, 146.8, 98.0, 98.0, 123.5, 130.8];

    this.activeBattleLoopInterval = setInterval(() => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      const note = bassNotes[step % bassNotes.length];
      osc.type = isBoss ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(note, t);

      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + stepTime * 0.85);

      osc.connect(g);
      g.connect(this.battleGain);
      osc.start(t);
      osc.stop(t + stepTime);

      step++;
    }, stepTime * 1000);
  }

  stopBattleMusic() {
    if (this.activeBattleLoopInterval) {
      clearInterval(this.activeBattleLoopInterval);
      this.activeBattleLoopInterval = null;
    }
    if (this.battleGain && this.ctx) {
      this.battleGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    }
    if (this.ambientGain && this.ctx && !this.isAmbientMuted) {
      this.ambientGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    }
  }

  playPlayerInk() {
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.07);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  playRivalInk() {
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  playContestAlert() {
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(560, t);
      osc.frequency.setValueAtTime(420, t + 0.05);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.13);
    } catch (e) {}
  }

  playCountdownThunk(isGo = false) {
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isGo) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, t);
        osc.frequency.exponentialRampToValueAtTime(640, t + 0.2);
        gain.gain.setValueAtTime(0.45, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.26);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.15);
        gain.gain.setValueAtTime(0.55, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.18);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.19);
      }
    } catch (e) {}
  }

  playTextBlip() {
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(780, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.02);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.025);
    } catch (e) {}
  }

  playDeterminationFanfare() {
    this.resume();
    if (!this.ctx) return;
    try {
      const chords = [261.63, 329.63, 392.00, 523.25];
      const t = this.ctx.currentTime;
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);
        gain.gain.setValueAtTime(0.25, t + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.8);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + idx * 0.06);
        osc.stop(t + 0.85);
      });
    } catch (e) {}
  }
}

function triggerHaptic(pattern) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {}
}

// --- 5. MUSIC PLAYLIST RUNNER ---
class MusicPlaylistManager {
  constructor(soundEngine) {
    this.soundEngine = soundEngine;
    this.audio = new Audio();
    this.audio.volume = 0.35;
    this.currentIndex = 0;
    this.tickerEl = document.getElementById('audio-ticker');
    this.tickerText = document.getElementById('ticker-text');

    this.audio.addEventListener('ended', () => {
      this.playNext();
    });

    this.audio.addEventListener('error', () => {
      if (!this.soundEngine.isAmbientMuted) {
        this.soundEngine.startAmbientSynth();
      }
      if (this.tickerText) this.tickerText.textContent = 'LO-FI AMBIENT';
    });
  }

  start() {
    if (MUSIC_PLAYLIST.length === 0) {
      if (!this.soundEngine.isAmbientMuted) {
        this.soundEngine.startAmbientSynth();
      }
      return;
    }
    if (!this.audio.src) {
      this.loadTrack(0);
    } else if (!this.soundEngine.isAmbientMuted && this.audio.paused) {
      this.audio.play().catch(() => {});
    }
  }

  loadTrack(index) {
    if (index >= MUSIC_PLAYLIST.length) index = 0;
    this.currentIndex = index;
    const track = MUSIC_PLAYLIST[this.currentIndex];
    if (!track) return;

    this.audio.src = track.src;
    if (this.tickerText) {
      this.tickerText.textContent = `♪ ${track.title}`;
    }
    if (this.tickerEl) this.tickerEl.removeAttribute('hidden');

    if (!this.soundEngine.isAmbientMuted) {
      this.audio.play().catch((e) => {
        console.log('Audio autoplay waiting for user interaction:', e);
      });
    }
  }

  playNext() {
    this.loadTrack((this.currentIndex + 1) % MUSIC_PLAYLIST.length);
  }

  stop() {
    try {
      this.audio.pause();
      this.audio.muted = true;
    } catch (e) {}
    if (this.tickerEl) this.tickerEl.setAttribute('hidden', '');
  }

  updateMuteState(isMuted) {
    if (isMuted) {
      try {
        this.audio.pause();
        this.audio.muted = true;
      } catch (e) {}
      this.soundEngine.stopAmbientSynth();
      if (this.tickerEl) this.tickerEl.setAttribute('hidden', '');
    } else {
      this.audio.muted = false;
      if (this.audio.src) {
        this.audio.play().catch(() => {
          this.soundEngine.startAmbientSynth();
        });
      } else {
        this.start();
      }
      if (this.tickerEl) this.tickerEl.removeAttribute('hidden');
    }
  }
}

// --- 6. GAME STATE & MASTER AUDIO CONTROLLER ---
const sound = new SoundEngine();
let playlist = null;

function setAudioMute(muted) {
  sound.isAmbientMuted = !!muted;

  if (sound.isAmbientMuted) {
    // 1. Fully silence & pause HTML5 playlist
    if (playlist && playlist.audio) {
      try {
        playlist.audio.pause();
        playlist.audio.muted = true;
      } catch (e) {}
    }

    // 2. Fully silence & pause finale track
    if (finaleAudio) {
      try {
        finaleAudio.pause();
        finaleAudio.muted = true;
      } catch (e) {}
    }

    // 3. Stop running Web Audio synthesizer intervals
    sound.stopAmbientSynth();
    sound.stopBattleMusic();

    // 4. Zero out all Web Audio gain stages & suspend hardware output
    if (sound.ctx) {
      try {
        const t = sound.ctx.currentTime;
        if (sound.masterGain) {
          sound.masterGain.gain.cancelScheduledValues(t);
          sound.masterGain.gain.setValueAtTime(0.0, t);
        }
        if (sound.ambientGain) {
          sound.ambientGain.gain.cancelScheduledValues(t);
          sound.ambientGain.gain.setValueAtTime(0.0, t);
        }
        if (sound.battleGain) {
          sound.battleGain.gain.cancelScheduledValues(t);
          sound.battleGain.gain.setValueAtTime(0.0, t);
        }
        if (sound.ctx.state === 'running') {
          sound.ctx.suspend().catch(() => {});
        }
      } catch (e) {}
    }

    // 5. Update UI controls
    const iconEl = document.getElementById('audio-icon');
    if (iconEl) iconEl.textContent = '🔇';
    const tickerEl = document.getElementById('audio-ticker');
    if (tickerEl) tickerEl.setAttribute('hidden', '');
  } else {
    // UNMUTE:
    sound.resume();
    if (sound.ctx) {
      try {
        const t = sound.ctx.currentTime;
        if (sound.masterGain) {
          sound.masterGain.gain.cancelScheduledValues(t);
          sound.masterGain.gain.setValueAtTime(1.0, t);
        }
        if (sound.ambientGain) {
          sound.ambientGain.gain.cancelScheduledValues(t);
          sound.ambientGain.gain.setValueAtTime(0.22, t);
        }
      } catch (e) {}
    }

    const iconEl = document.getElementById('audio-icon');
    if (iconEl) iconEl.textContent = '🔊';
    const tickerEl = document.getElementById('audio-ticker');

    // Route to appropriate music depending on current screen
    if ((state.currentScreen === 'NOTE' && state.currentRound === 4) || state.currentScreen === 'ALBUM') {
      if (finaleAudio) {
        finaleAudio.muted = false;
        finaleAudio.play().catch(() => {});
      } else {
        playGrandFinaleMusic();
      }
      if (tickerEl) tickerEl.removeAttribute('hidden');
    } else if (state.currentScreen === 'MATCH') {
      sound.startBattleMusic(false);
      if (playlist) playlist.start();
    } else if (state.currentScreen === 'BOSS') {
      sound.startBattleMusic(true);
      if (playlist) playlist.start();
    } else {
      // LOCKED, TITLE, VESSEL
      if (playlist) {
        playlist.audio.muted = false;
        if (!playlist.audio.src) {
          playlist.loadTrack(0);
        } else {
          playlist.audio.play().catch(() => {
            sound.startAmbientSynth();
          });
        }
      } else {
        sound.startAmbientSynth();
      }
      if (tickerEl) tickerEl.removeAttribute('hidden');
    }
  }
}

const state = {
  currentScreen: 'TITLE',
  currentRound: 1,
  selectedColorIndex: 0,
  selectedColor: INK_SWATCHES[0],
  gridSize: 10,
  totalTiles: 100,
  tileOwnership: new Map(),
  playerPos: { r: 4, c: 4 },
  rivalPos: { r: 0, c: 9 },
  timeRemaining: CONFIG.matchDurationSec,
  timerInterval: null,
  rivalInterval: null,
  isGameActive: false,
  isAutoCompleting: false,
  elapsedTime: 0,
  easterEggTaps: 0,
  midMatchFightTriggered: false,

  lastMoveTimestamp: 0,
  moveCooldownMs: 170,

  // Boss Battle State
  bossHealth: 3,
  bossMaxHealth: 3,
  bossActItemCount: 0,
  bossDodgeActive: false,
  bossSelectedActionIndex: 0,
  bossSoulPos: { x: 50, y: 50 },

  // Vessel Maker State
  selectedVesselIndex: 0,

  strikeCursorPos: 0,
  strikeCursorSpeed: 2.2,
  strikeAnimFrame: null,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  state.reducedMotion = e.matches;
});

function getActivePhoto() {
  return state.currentRound >= 3 ? CONFIG.photoPath2 : CONFIG.photoPath1;
}

// --- 7. DOM ELEMENTS ---
const screens = {
  locked: document.getElementById('screen-locked'),
  title: document.getElementById('screen-title'),
  vessel: document.getElementById('screen-vessel'),
  match: document.getElementById('screen-match'),
  reveal: document.getElementById('screen-reveal'),
  note: document.getElementById('screen-note'),
  boss: document.getElementById('screen-boss'),
  album: document.getElementById('screen-album'),
};

const appContainer = document.getElementById('app');

// Secret Override & 67 Fakeout (§16 Early Unlock)
const btnSecretPeeker = document.getElementById('btn-secret-peeker');
const modalSecretOverride = document.getElementById('modal-secret-override');
const secretPasscodeInput = document.getElementById('secret-passcode-input');
const btnSubmitOverride = document.getElementById('btn-submit-override');
const btnCancelOverride = document.getElementById('btn-cancel-override');
const terminalStatus = document.getElementById('terminal-status');

const modalFakeout67 = document.getElementById('modal-fakeout-67');
const gridFakeout67 = document.getElementById('grid-fakeout-67');
const fakeoutCounter = document.getElementById('fakeout-counter');
const btnFakeoutSurrender = document.getElementById('btn-fakeout-surrender');

// Space Invaders Mosquito Fakeout
const btnBypassPeeker = document.getElementById('btn-bypass-peeker');
const modalInvadersFakeout = document.getElementById('modal-invaders-fakeout');
const invadersCanvas = document.getElementById('invaders-canvas');
const invadersHudScore = document.getElementById('invaders-hud-score');
const invadersHudCount = document.getElementById('invaders-hud-count');
const btnInvaderLeft = document.getElementById('btn-invader-left');
const btnInvaderRight = document.getElementById('btn-invader-right');
const btnInvaderFire = document.getElementById('btn-invader-fire');
const btnInvadersCancel = document.getElementById('btn-invaders-cancel');
const invadersRevealScreen = document.getElementById('invaders-reveal-screen');
const btnInvadersAcceptFakeout = document.getElementById('btn-invaders-accept-fakeout');

// Album Elements (§20 Grand Finale)
const btnAlbumBackNote = document.getElementById('btn-album-back-note');
const btnAlbumReplay = document.getElementById('btn-album-replay');
const playfieldWrapper = document.getElementById('playfield-wrapper');
const btnStart = document.getElementById('btn-start');
const btnOpenNote = document.getElementById('btn-open-note');
const btnReplay = document.getElementById('btn-replay');
const btnAudioToggle = document.getElementById('btn-audio-toggle');

const hudTimer = document.getElementById('hud-timer');
const hudTeamPlayer = document.getElementById('hud-team-player');
const hudTeamRival = document.getElementById('hud-team-rival');
const progressFill = document.getElementById('progress-fill');
const progressRivalFill = document.getElementById('progress-rival-fill');
const progressLabelPlayer = document.getElementById('progress-label-player');
const progressLabelRival = document.getElementById('progress-label-rival');
const gridContainer = document.getElementById('grid-container');
const playerSprite = document.getElementById('player-sprite');
const rivalSprite = document.getElementById('rival-sprite');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownText = document.getElementById('countdown-text');
const determinationOverlay = document.getElementById('determination-overlay');
const revealMosaic = document.getElementById('reveal-mosaic');
const noteMessageBody = document.getElementById('note-message-body');
const noteThumbImg = document.getElementById('note-thumb-img');
const noteSealText = document.getElementById('note-seal-text');
const swatchesContainer = document.getElementById('swatches-container');
const titleSquidHero = document.getElementById('title-squid-hero');

// Stat Card
const statPlayerTurf = document.getElementById('stat-player-turf');
const statRivalTurf = document.getElementById('stat-rival-turf');
const statPlayerLabel = document.getElementById('stat-player-label');
const statTime = document.getElementById('stat-time');
const statMvp = document.getElementById('stat-mvp');

// Dialogue & Interstitial
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const fightInterstitial = document.getElementById('fight-interstitial');
const fightRivalSprite = document.getElementById('fight-rival-sprite');
const fightStrikeCursor = document.getElementById('fight-strike-cursor');
const btnFightStrike = document.getElementById('btn-fight-strike');
const fightResultText = document.getElementById('fight-result-text');
const tvStaticCut = document.getElementById('tv-static-cut');

// Boss
const bossHpFill = document.getElementById('boss-hp-fill');
const bossHpHearts = document.getElementById('boss-hp-hearts');
const bossSpriteLarge = document.getElementById('boss-sprite-large');
const bossNarrativeText = document.getElementById('boss-narrative-text');
const bossStrikeZone = document.getElementById('boss-strike-zone');
const bossStrikeCursor = document.getElementById('boss-strike-cursor');
const bossDodgeArena = document.getElementById('boss-dodge-arena');
const bossSoul = document.getElementById('boss-soul');
const bossBtnMercy = document.getElementById('boss-btn-mercy');
const bossActionButtons = ['fight', 'act', 'item', 'mercy'];

// Vessel Creation Elements
const vesselStepSprite = document.getElementById('vessel-step-sprite');
const vesselStepName = document.getElementById('vessel-step-name');
const vesselStepRejection = document.getElementById('vessel-step-rejection');
const btnVesselNext = document.getElementById('btn-vessel-next');
const btnVesselFinish = document.getElementById('btn-vessel-finish');
const btnVesselAccept = document.getElementById('btn-vessel-accept');
const vesselNameInput = document.getElementById('vessel-name-input');
const vesselRejectionText = document.getElementById('vessel-rejection-text');
const vesselKeyboard = document.getElementById('vessel-keyboard');

// Key Control Info Bar (§17)
const inputHelpIcon = document.getElementById('input-help-icon');
const inputHelpText = document.getElementById('input-help-text');

let currentInputMode = 'keyboard'; // 'keyboard' | 'controller'
let selectedVKeyIndex = 0;
const VIRTUAL_KEYBOARD_LAYOUT = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U',
  'V', 'W', 'X', 'Y', 'Z', 'DEL', 'DONE'
];

// --- 8. SCREEN SWITCHING ---
function showScreen(screenKey) {
  state.currentScreen = screenKey;
  updateControlHint();
  updateControllerKeyboardsVisibility();
  Object.keys(screens).forEach((key) => {
    if (screens[key]) {
      if (key === screenKey.toLowerCase()) {
        screens[key].removeAttribute('hidden');
      } else {
        screens[key].setAttribute('hidden', '');
      }
    }
  });
}

function triggerTVStaticCut(callback, durationMs = 220) {
  sound.playStaticNoise();
  if (tvStaticCut) {
    tvStaticCut.removeAttribute('hidden');
    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        tvStaticCut.setAttribute('hidden', '');
      }, 70);
    }, durationMs);
  } else if (callback) {
    callback();
  }
}

// --- 9. BIRTHDAY GATING COUNTDOWN & ESCALATING TIERS (§16) ---
// Calibrated from current date (September 3, 2026) to midnight September 8, 2026 (~5 days)
function getCountdownTier(timeLeft) {
  if (timeLeft <= 0) return 0;
  if (timeLeft > 3 * 86400000) return 4;   // > 3 days (Sept 3–5)
  if (timeLeft > 1.5 * 86400000) return 3; // 1.5–3 days (Sept 5–6)
  if (timeLeft > 4 * 3600000) return 2;    // 4–36 hours (Sept 7)
  return 1;                                // < 4 hours (Final stretch!)
}

const TIER_CONFIG = {
  4: {
    tierNumber: 4,
    subhead: 'TRANSMISSION ENCRYPTED • T-5 DAYS',
    headline: 'SPLATFEST LOCKED',
    teaser: 'Ink supplies are being ordered. Splatfest arena is locked down tight.',
    subtext: 'Check back as the countdown progresses!',
    lockTag: 'DECRYPTION: 15% COMPLETE',
    blurPx: 20,
    peekBlur: 13,
    pixelGrid: 18,
    pixelOpacity: 0.85,
    ambientGain: 0.05,
    earlyLine: "* You're 5 days early, Zaman! The ink hasn't even finished brewing yet."
  },
  3: {
    tierNumber: 3,
    subhead: 'DECRYPTION PROGRESSING • T-3 DAYS',
    headline: 'SPLATFEST BREWING',
    teaser: 'Arena lights are turning on! Weapon calibrators running diagnostic checks.',
    subtext: 'Gear is being polished! The signal is getting clearer.',
    lockTag: 'DECRYPTION: 50% COMPLETE',
    blurPx: 14,
    peekBlur: 9,
    pixelGrid: 12,
    pixelOpacity: 0.70,
    ambientGain: 0.09,
    earlyLine: "* We're halfway there! The tournament arena is starting to warm up."
  },
  2: {
    tierNumber: 2,
    subhead: 'HIGH PRIORITY BROADCAST • TOMORROW',
    headline: 'ARENA PRIMING',
    teaser: 'Tomorrow is the big day! Turf War battle lines are being painted.',
    subtext: 'The Splatfest gates are almost ready to unlock!',
    lockTag: 'DECRYPTION: 85% COMPLETE',
    blurPx: 9,
    peekBlur: 5.5,
    pixelGrid: 6.5,
    pixelOpacity: 0.55,
    ambientGain: 0.15,
    earlyLine: "* Tomorrow is the day! Can you feel the arena trembling yet?"
  },
  1: {
    tierNumber: 1,
    subhead: 'MAXIMUM HYPE • IMMINENT UNLOCK',
    headline: 'GATES UNLOCKING',
    teaser: 'Splatfest gates opening in mere minutes! Stand by your battle stations!',
    subtext: 'FINAL PREPARATIONS UNDERWAY! COUNT DOWN WITH US!',
    lockTag: 'DECRYPTION: 99% COMPLETE',
    blurPx: 5,
    peekBlur: 2.5,
    pixelGrid: 3.5,
    pixelOpacity: 0.35,
    ambientGain: 0.22,
    earlyLine: "* You're literally in the final countdown! Deep breaths... gates open soon!"
  },
  0: {
    tierNumber: 0,
    subhead: 'SIGNAL DECRYPTED • 100% COMPLETE',
    headline: 'SPLATFEST GATES OPEN!',
    teaser: 'The countdown has struck zero! The arena is open!',
    subtext: 'HAPPY BIRTHDAY, ZAMAN!',
    lockTag: 'DECRYPTION 100% COMPLETE',
    blurPx: 0,
    peekBlur: 0,
    pixelGrid: 0,
    pixelOpacity: 0,
    ambientGain: 0.25,
    earlyLine: "* GATES UNLOCKED! HAPPY BIRTHDAY, ZAMAN! 🎂🎉"
  }
};

const lockedTierDialogueCounts = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
const TIER_DIALOGUES = {
  4: [
    "* You're 5 days early, Zaman! The ink hasn't even finished brewing yet.",
    "* The countdown doesn't tick faster just because you're clicking it! ...Probably.",
    "* 🚨 Unauthorized Squid detected! Please step away from the birthday vault.",
    "* Malachi is still assembling the surprises. Return when the timer drops!",
    "* Fun fact: Clicking early adds 0 extra seconds, but 100 bonus hype points.",
    "* Did you try holding down the little cat mascot? Just saying.",
    "* Error 404: Birthday not arrived yet. Estimated time of party: September 8th!"
  ],
  3: [
    "* We're halfway there! The tournament arena is starting to warm up.",
    "* Decryption at 50%: The photo is starting to take shape... can you tell what it is yet?",
    "* Malachi's DJ playlist is getting calibrated. Only 3 days left!",
    "* The rival Octoling is currently doing push-ups in preparation for you.",
    "* Are you trying to inspect element? There are no cheats in DevTools, Zaman!",
    "* Okay, one little hint: Make sure your controller or keyboard is charged.",
    "* The ink pumps are warming up. Don't worry, your gear is reserved!"
  ],
  2: [
    "* Tomorrow is the big day! Can you feel the arena trembling yet?",
    "* Just 24 hours left, birthday boy! Hang tight, Agent 67!",
    "* Decryption at 85%! The photo is almost completely in focus!",
    "* Shhh... can you hear that? That's the sound of an epic Splatfest approaching.",
    "* The referee Judd is taking his final nap before the tournament begins tomorrow.",
    "* Malachi knew you'd be checking today. Almost time!"
  ],
  1: [
    "* You're literally in the final countdown! Deep breaths... gates open soon!",
    "* Decryption is at 99%! The gates are rattling on their hinges!",
    "* Watch the clock closely now! When it strikes zero, you're in!",
    "* Forever on Team Zaman67. Get ready for your birthday match! ❤️",
    "* 3... 2... almost there! Keep your eyes glued to the timer!",
    "* FINAL PREPARATIONS ACTIVE! The stage lights just flashed ON!"
  ],
  0: [
    "* 🔓 GATES UNLOCKED! HAPPY BIRTHDAY, ZAMAN! 🎂🎉",
    "* Decryption 100% complete! Welcome to your Splatfest!"
  ]
};

function getNextLockedDialogue(tier = currentLockedTier || 4) {
  const safeTier = (tier in TIER_DIALOGUES) ? tier : 4;
  const dialogues = TIER_DIALOGUES[safeTier];
  const count = lockedTierDialogueCounts[safeTier] || 0;
  const line = dialogues[count % dialogues.length];
  lockedTierDialogueCounts[safeTier] = count + 1;
  return line;
}

let lockedCountdownInterval = null;
let currentLockedTier = null;

function initBirthdayGate() {
  const now = Date.now();
  if (now >= UNLOCK_DATE.getTime()) {
    // On/after unlock: load straight into LOCKED and play Tier 0 unlock transition!
    showScreen('LOCKED');
    setupLockedInteractions();
    triggerTier0UnlockTransition();
    return true;
  }

  showScreen('LOCKED');
  setupLockedInteractions();

  const timeLeft = UNLOCK_DATE.getTime() - now;
  const currentTier = getCountdownTier(timeLeft);

  // "Getting closer" beat: compare against stored tier from last visit
  try {
    const storedTierStr = sessionStorage.getItem('splatfest_last_locked_tier');
    if (storedTierStr) {
      const lastTier = parseInt(storedTierStr, 10);
      if (!isNaN(lastTier) && currentTier < lastTier) {
        setTimeout(() => {
          showDialogue("* ...getting closer.");
        }, 500);
      }
    }
    sessionStorage.setItem('splatfest_last_locked_tier', currentTier.toString());
  } catch (e) {
    // sessionStorage fallback safe
  }

  updateLockedCountdown();
  if (!lockedCountdownInterval) {
    lockedCountdownInterval = setInterval(updateLockedCountdown, 1000);
  }
  return true;
}

let devSimulatedDiff = null;
let devSimulatedStartTime = null;

function updateLockedCountdown(forceTier = null) {
  const now = Date.now();
  let diff = UNLOCK_DATE.getTime() - now;

  if (forceTier !== null && forceTier !== undefined) {
    if (forceTier === 4) devSimulatedDiff = 4 * 86400000 + 7 * 3600000 + 14 * 60000 + 20000;
    else if (forceTier === 3) devSimulatedDiff = 2 * 86400000 + 5 * 3600000 + 30 * 60000 + 15000;
    else if (forceTier === 2) devSimulatedDiff = 18 * 3600000 + 45 * 60000 + 30000;
    else if (forceTier === 1) devSimulatedDiff = 42 * 60000 + 45000;
    else if (forceTier === 0) devSimulatedDiff = 0;
    devSimulatedStartTime = now;
  }

  if (devSimulatedDiff !== null && devSimulatedStartTime !== null) {
    const elapsed = now - devSimulatedStartTime;
    diff = Math.max(0, devSimulatedDiff - elapsed);
  }

  if (diff <= 0) {
    if (lockedCountdownInterval) {
      clearInterval(lockedCountdownInterval);
      lockedCountdownInterval = null;
    }
    triggerTier0UnlockTransition();
    return;
  }

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const mins = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  const secs = Math.max(0, Math.floor((diff / 1000) % 60));

  const setDigit = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toString().padStart(2, '0');
  };

  setDigit('lock-days', days);
  setDigit('lock-hours', hours);
  setDigit('lock-mins', mins);
  setDigit('lock-secs', secs);

  const tier = getCountdownTier(diff);
  applyLockedTier(tier, diff);
}

function applyLockedTier(tier, timeLeft) {
  currentLockedTier = tier;
  const config = TIER_CONFIG[tier] || TIER_CONFIG[3];

  const elSubhead = document.getElementById('locked-subhead');
  const elHeadline = document.getElementById('locked-headline');
  const elTeaser = document.getElementById('locked-teaser');
  const elSubtext = document.getElementById('locked-subtext');
  const elLockTag = document.getElementById('lock-tag');
  const photoPeek = document.getElementById('locked-photo-peek');

  if (elSubhead) elSubhead.textContent = config.subhead;
  if (elHeadline) elHeadline.textContent = config.headline;
  if (elTeaser) elTeaser.textContent = config.teaser;
  if (elSubtext) elSubtext.textContent = config.subtext;
  if (elLockTag) elLockTag.textContent = config.lockTag;
  if (photoPeek) photoPeek.dataset.tier = tier;

  // Set CSS variables for blur and pixelation per tier
  const root = document.documentElement;
  root.style.setProperty('--locked-blur', `${config.blurPx}px`);
  root.style.setProperty('--locked-peek-blur', `${config.peekBlur}px`);
  root.style.setProperty('--locked-pixel-grid', `${config.pixelGrid}px`);
  root.style.setProperty('--locked-pixel-opacity', `${config.pixelOpacity}`);

  // Ambient audio build: subtle volume map to tier
  if (sound && !sound.isAmbientMuted) {
    sound.setAmbientGain(config.ambientGain);
  }

  const isPeekActive = photoPeek && photoPeek.classList.contains('peek-active');
  renderLockedPeek(isPeekActive);
}

function renderLockedPeek(isPeekActive = false) {
  const canvas = document.getElementById('locked-peek-canvas');
  const img = document.getElementById('locked-peek-img');
  if (!canvas || !img) return;
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return;

  const w = canvas.width || 160;
  const h = canvas.height || 160;

  if (!img.complete || !img.naturalWidth) {
    img.onload = () => renderLockedPeek(isPeekActive);
    return;
  }

  const tier = currentLockedTier !== null && currentLockedTier !== undefined ? currentLockedTier : 3;

  if (tier === 0) {
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return;
  }

  // Authentic retro pixelation: calculate pixel grid resolution
  let pixelGrid = 20;
  if (tier === 4) pixelGrid = isPeekActive ? 28 : 14;
  else if (tier === 3) pixelGrid = isPeekActive ? 40 : 22;
  else if (tier === 2) pixelGrid = isPeekActive ? 56 : 32;
  else if (tier === 1) pixelGrid = isPeekActive ? 80 : 48;

  let buffer = null;
  if (typeof document !== 'undefined' && document.createElement) {
    buffer = document.createElement('canvas');
    buffer.width = pixelGrid;
    buffer.height = pixelGrid;
    const bctx = buffer.getContext ? buffer.getContext('2d') : null;
    if (bctx) {
      bctx.imageSmoothingEnabled = true;
      bctx.drawImage(img, 0, 0, pixelGrid, pixelGrid);
    }
  }

  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;
  if (buffer) {
    ctx.drawImage(buffer, 0, 0, w, h);
  } else {
    ctx.drawImage(img, 0, 0, w, h);
  }
}

let isTier0Transitioning = false;

function triggerTier0UnlockTransition() {
  if (isTier0Transitioning) return;
  isTier0Transitioning = true;

  if (lockedCountdownInterval) {
    clearInterval(lockedCountdownInterval);
    lockedCountdownInterval = null;
  }

  // Set countdown digits to 00:00:00:00
  const setDigit = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toString().padStart(2, '0');
  };
  setDigit('lock-days', 0);
  setDigit('lock-hours', 0);
  setDigit('lock-mins', 0);
  setDigit('lock-secs', 0);

  // Decryption 100%: 0 blur, 0 pixel grid/opacity
  const root = document.documentElement;
  root.style.setProperty('--locked-blur', '0px');
  root.style.setProperty('--locked-peek-blur', '0px');
  root.style.setProperty('--locked-pixel-grid', '0px');
  root.style.setProperty('--locked-pixel-opacity', '0');

  const photoPeek = document.getElementById('locked-photo-peek');
  if (photoPeek) photoPeek.dataset.tier = '0';
  renderLockedPeek(false);

  const overlay = document.getElementById('unlock-tier0-overlay');

  sound.resume();
  sound.playDeterminationFanfare();
  triggerHaptic([100, 50, 100, 50, 200]);

  if (overlay) {
    overlay.removeAttribute('hidden');
    overlay.classList.remove('fade-out');

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.setAttribute('hidden', '');
        overlay.classList.remove('fade-out');
        triggerTVStaticCut(() => {
          showScreen('TITLE');
          isTier0Transitioning = false;
        });
      }, 300);
    }, 2000);
  } else {
    triggerTVStaticCut(() => {
      showScreen('TITLE');
      isTier0Transitioning = false;
    });
  }
}

function setupLockedInteractions() {
  const catSprite = document.getElementById('locked-cat-sprite');
  const catArt = catSprite ? catSprite.querySelector('.locked-cat-art') : null;
  const photoPeek = document.getElementById('locked-photo-peek');
  const countdownCard = document.getElementById('locked-countdown-card');

  if (catArt && !catArt.hasChildNodes()) {
    catArt.innerHTML = generateSVGFromMatrix(PLAYER_SPRITE_PIXELS, 'var(--ink-coral)');
  }

  renderLockedPeek(false);

  // Hidden peek interaction: holding/tapping cat sprite for ~1-2s temporarily sharpens blur
  if (catSprite && photoPeek && !catSprite.dataset.peekBound) {
    catSprite.dataset.peekBound = 'true';
    let peekHoldTimeout = null;

    const startPeek = () => {
      catSprite.classList.add('holding');
      peekHoldTimeout = setTimeout(() => {
        sound.resume();
        sound.playTextBlip();
        triggerHaptic(20);
        photoPeek.classList.add('peek-active');
        renderLockedPeek(true);
      }, 200);
    };

    const endPeek = () => {
      catSprite.classList.remove('holding');
      if (peekHoldTimeout) {
        clearTimeout(peekHoldTimeout);
        peekHoldTimeout = null;
      }
      photoPeek.classList.remove('peek-active');
      renderLockedPeek(false);
    };

    catSprite.addEventListener('pointerdown', startPeek);
    catSprite.addEventListener('pointerup', endPeek);
    catSprite.addEventListener('pointerleave', endPeek);
    catSprite.addEventListener('pointercancel', endPeek);
  }

  // "You're early" personality: tapping anything gated shows cycling fun lines
  const handleEarlyInteraction = (e) => {
    if (e.target.closest('#btn-audio-toggle') || e.target.closest('#locked-cat-sprite') || e.target.closest('#btn-secret-peeker') || e.target.closest('#btn-bypass-peeker')) return;
    showDialogue(getNextLockedDialogue(currentLockedTier || 4));
  };

  if (countdownCard) countdownCard.onclick = handleEarlyInteraction;
  if (photoPeek) photoPeek.onclick = handleEarlyInteraction;
}

// --- 9.1 SECRET EARLY OVERRIDE & 67 PENALTY FAKEOUT (§16) ---
let wrongOverrideAttempts = 0;
const VALID_DEV_PASSCODES = [
  'OCTO-CHAMPION-2026',
  'AGENT-67-DEV-OVERRIDE',
  'MALACHI-ROOT-ACCESS',
  'SPLATFEST-MIDNIGHT-0908',
  'SEPTEMBER-EIGHTH-LOVE',
  'CENTRAL-PARK-OCTOBER',
  'MALACHI67-SUPERDEV',
  'OCTOCHAMPION2026',
  'DEV',
  '67',
  'OCTO',
  'MALACHI',
  'MALLY',
  'ZAMAN',
  '0908',
  'OCTO2026',
  'SUPERDEV',
  'DEV2026',
  'OVERRIDE',
  'SKIP'
];

const TERMINAL_KEYS = [
  'A','B','C','D','E','F','G',
  'H','I','J','K','L','M','N',
  'O','P','Q','R','S','T','U',
  'V','W','X','Y','Z','0','1',
  '2','3','4','5','6','7','8',
  '9','-','DEL','CLR','OK'
];
let selectedTerminalKeyIndex = 0;

function initTerminalKeyboard() {
  const keyboardEl = document.getElementById('terminal-keyboard');
  if (!keyboardEl) return;
  keyboardEl.innerHTML = '';

  TERMINAL_KEYS.forEach((key, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tkey-btn ${idx === 0 ? 'active' : ''}`;
    if (key === 'DEL') btn.classList.add('tkey-del');
    if (key === 'CLR') btn.classList.add('tkey-clear');
    btn.textContent = key;

    btn.onclick = () => {
      pressTerminalKey(key);
    };

    keyboardEl.appendChild(btn);
  });
}

function updateTerminalKeySelection() {
  const keys = document.querySelectorAll('.tkey-btn');
  keys.forEach((k, idx) => {
    if (idx === selectedTerminalKeyIndex) {
      k.classList.add('active');
      k.classList.add('gamepad-focused');
    } else {
      k.classList.remove('active');
      k.classList.remove('gamepad-focused');
    }
  });
}

function pressTerminalKey(key) {
  sound.resume();
  sound.playTextBlip();
  if (key === 'DEL') {
    secretPasscodeInput.value = secretPasscodeInput.value.slice(0, -1);
  } else if (key === 'CLR') {
    secretPasscodeInput.value = '';
  } else if (key === 'OK') {
    submitSecretOverride();
  } else {
    if (secretPasscodeInput.value.length < 64) {
      secretPasscodeInput.value += key;
    }
  }
}

// Controller & Keyboard Cheat Code Sequence Support
// Non-conflicting with Konami Code (Cheat starts with UP, UP, DOWN, RIGHT... whereas Konami starts with UP, UP, DOWN, DOWN...)
let devCheatSequence = [];
let devCheatTimer = null;

const CHEAT_PATTERNS = [
  ['UP', 'UP', 'DOWN', 'RIGHT', 'LEFT'],                         // Up, Up, Down, Right, Left (Primary user cheat)
  ['UP', 'UP', 'DOWN', 'LEFT', 'RIGHT'],                         // Up, Up, Down, Left, Right
];

const DIR_SYMBOLS = { UP: '↑', DOWN: '↓', LEFT: '←', RIGHT: '→' };

function updateCheatVisualFeedback() {
  let indicator = document.getElementById('cheat-input-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'cheat-input-indicator';
    indicator.className = 'cheat-input-indicator';
    document.body.appendChild(indicator);
  }
  if (devCheatSequence.length === 0) {
    indicator.classList.remove('active', 'matched');
    indicator.textContent = '';
    return;
  }
  indicator.classList.add('active');
  indicator.textContent = devCheatSequence.map(d => DIR_SYMBOLS[d] || d).join(' ');
}

function recordCheatDirection(dir) {
  // Only record cheats when on LOCKED screen or inside dev override modal
  if (state.currentScreen !== 'LOCKED' && modalSecretOverride.hasAttribute('hidden')) return;

  sound.resume();
  sound.playTextBlip();

  clearTimeout(devCheatTimer);
  devCheatTimer = setTimeout(() => {
    devCheatSequence = [];
    updateCheatVisualFeedback();
  }, 3500);

  devCheatSequence.push(dir);
  if (devCheatSequence.length > 8) {
    devCheatSequence.shift();
  }

  updateCheatVisualFeedback();

  // Check if pattern matches
  for (const pattern of CHEAT_PATTERNS) {
    if (devCheatSequence.length >= pattern.length) {
      const slice = devCheatSequence.slice(-pattern.length);
      const isMatch = pattern.every((p, idx) => p === slice[idx]);
      if (isMatch) {
        devCheatSequence = [];
        clearTimeout(devCheatTimer);
        const indicator = document.getElementById('cheat-input-indicator');
        if (indicator) {
          indicator.classList.add('matched');
          indicator.textContent = '⭐ CODE ACCEPTED! ⭐';
          setTimeout(() => indicator.classList.remove('active', 'matched'), 1200);
        }
        triggerDevCheatUnlock();
        return;
      }
    }
  }
}

// --- DEV MODE STATE CONTROLLER & SCREEN SKIPPING ---
const DEV_PAGES = ['LOCKED', 'VESSEL', 'TITLE', 'MATCH', 'BOSS', 'REVEAL', 'NOTE', 'ALBUM'];

let selectedDevBtnIndex = 0;

function enableDevMode() {
  state.devModeActive = true;
  const devBar = document.getElementById('dev-floating-bar');
  if (devBar) devBar.removeAttribute('hidden');
  const devPanel = document.getElementById('dev-control-panel');
  if (devPanel) devPanel.removeAttribute('hidden');
  updateDevBarDisplay();
  updateDevModalUI();
}

function updateDevBarDisplay() {
  const pageLabel = document.getElementById('dev-bar-current-page');
  if (pageLabel) {
    pageLabel.textContent = `PAGE: ${state.currentScreen}`;
  }
}

function devJumpToScreen(screenName) {
  if (!DEV_PAGES.includes(screenName)) return;
  sound.resume();
  sound.playTextBlip();

  if (modalSecretOverride) {
    modalSecretOverride.setAttribute('hidden', '');
  }

  if (lockedCountdownInterval) {
    clearInterval(lockedCountdownInterval);
    lockedCountdownInterval = null;
  }
  clearInterval(state.timerInterval);
  clearInterval(state.rivalInterval);
  clearTimeout(dialogueTypingTimeout);
  if (dialogueBox) dialogueBox.setAttribute('hidden', '');

  showScreen(screenName);

  if (screenName === 'LOCKED') {
    setupLockedInteractions();
    updateLockedCountdown();
    lockedCountdownInterval = setInterval(updateLockedCountdown, 1000);
  } else if (screenName === 'VESSEL') {
    if (vesselStepSprite) vesselStepSprite.removeAttribute('hidden');
    if (vesselStepName) vesselStepName.setAttribute('hidden', '');
    if (vesselStepRejection) vesselStepRejection.setAttribute('hidden', '');
    if (playlist) playlist.start();
  } else if (screenName === 'TITLE') {
    if (playlist) playlist.start();
  } else if (screenName === 'MATCH') {
    startNewMatch();
  } else if (screenName === 'BOSS') {
    startBossBattle();
  } else if (screenName === 'REVEAL') {
    transitionToReveal();
  } else if (screenName === 'NOTE') {
    transitionToNote();
  } else if (screenName === 'ALBUM') {
    playGrandFinaleMusic();
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateDevBarDisplay();
}

function devNextPage() {
  const currentIdx = DEV_PAGES.indexOf(state.currentScreen);
  const nextIdx = (currentIdx + 1) % DEV_PAGES.length;
  devJumpToScreen(DEV_PAGES[nextIdx]);
}

function devPrevPage() {
  const currentIdx = DEV_PAGES.indexOf(state.currentScreen);
  const prevIdx = (currentIdx - 1 + DEV_PAGES.length) % DEV_PAGES.length;
  devJumpToScreen(DEV_PAGES[prevIdx]);
}

function devSetTier(tierNumber) {
  sound.resume();
  sound.playTextBlip();
  if (tierNumber === 0) {
    devSimulatedDiff = 0;
    devSimulatedStartTime = Date.now();
    if (state.currentScreen !== 'LOCKED') {
      devJumpToScreen('LOCKED');
    }
    triggerTier0UnlockTransition();
    if (terminalStatus) {
      terminalStatus.style.color = 'var(--ink-yellow)';
      terminalStatus.textContent = '* TIER 0 UNLOCKED! GATES ARE OPENING!';
    }
    return;
  }
  isTier0Transitioning = false;
  const overlay = document.getElementById('unlock-tier0-overlay');
  if (overlay) {
    overlay.setAttribute('hidden', '');
    overlay.classList.remove('fade-out');
  }
  if (state.currentScreen !== 'LOCKED') {
    devJumpToScreen('LOCKED');
  }
  if (!lockedCountdownInterval) {
    lockedCountdownInterval = setInterval(updateLockedCountdown, 1000);
  }
  updateLockedCountdown(tierNumber);
  if (terminalStatus) {
    terminalStatus.style.color = 'var(--ink-teal)';
    terminalStatus.textContent = `* SIMULATING TIER ${tierNumber}! (Time changed & counting down)`;
  }
}

function devResetTime() {
  sound.resume();
  sound.playTextBlip();
  isTier0Transitioning = false;
  const overlay = document.getElementById('unlock-tier0-overlay');
  if (overlay) {
    overlay.setAttribute('hidden', '');
    overlay.classList.remove('fade-out');
  }
  devSimulatedDiff = null;
  devSimulatedStartTime = null;
  if (state.currentScreen !== 'LOCKED') {
    devJumpToScreen('LOCKED');
  }
  if (!lockedCountdownInterval) {
    lockedCountdownInterval = setInterval(updateLockedCountdown, 1000);
  }
  updateLockedCountdown();
  if (terminalStatus) {
    terminalStatus.style.color = 'var(--gold)';
    terminalStatus.textContent = '* RESTORED REAL LIVE COUNTDOWN TIME!';
  }
}

function devSetRound(roundNum) {
  sound.resume();
  sound.playTextBlip();
  state.currentRound = roundNum;
  if (state.currentScreen !== 'MATCH' && state.currentScreen !== 'NOTE') {
    devJumpToScreen('MATCH');
  } else if (state.currentScreen === 'MATCH') {
    startNewMatch();
  } else if (state.currentScreen === 'NOTE') {
    transitionToNote();
  }
  if (terminalStatus) {
    terminalStatus.style.color = 'var(--ink-teal)';
    terminalStatus.textContent = `* SET TOURNAMENT TO ROUND ${roundNum}!`;
  }
}

function devSetBossHP(hp) {
  sound.resume();
  sound.playTextBlip();
  if (state.currentScreen !== 'BOSS') {
    devJumpToScreen('BOSS');
  }
  state.bossHealth = Math.max(0, hp);
  updateBossHealthUI();
  if (state.bossHealth === 0) {
    defeatBoss();
  }
  if (terminalStatus) {
    terminalStatus.style.color = 'var(--ink-teal)';
    terminalStatus.textContent = `* SET BOSS HP TO ${hp}!`;
  }
}

function updateDevModalUI() {
  if (!modalSecretOverride) return;
  const devPanel = document.getElementById('dev-control-panel');
  const termHeader = modalSecretOverride.querySelector('.terminal-title');
  const termPrompt = modalSecretOverride.querySelector('.terminal-prompt');
  const termSubprompt = modalSecretOverride.querySelector('.terminal-subprompt');
  const termInputWrap = modalSecretOverride.querySelector('.terminal-input-wrapper');
  const termKeyboard = document.getElementById('terminal-keyboard');
  const btnSubmit = document.getElementById('btn-submit-override');
  const btnCancel = document.getElementById('btn-cancel-override');

  if (state.devModeActive) {
    if (termHeader) termHeader.textContent = '🛠️ DEV SCREEN: MALACHI_CONTROLS';
    if (termPrompt) termPrompt.textContent = '* OPERATOR MALACHI // CLEARANCE: DEV MODE ACTIVE';
    if (termSubprompt) termSubprompt.textContent = '* Jump to any screen or test countdown/boss states:';
    if (termInputWrap) termInputWrap.setAttribute('hidden', '');
    if (termKeyboard) {
      termKeyboard.setAttribute('hidden', '');
      termKeyboard.style.display = 'none';
    }
    if (btnSubmit) btnSubmit.setAttribute('hidden', '');
    if (btnCancel) btnCancel.textContent = '✖ CLOSE DEV SCREEN';
    if (devPanel) devPanel.removeAttribute('hidden');
    if (terminalStatus) {
      terminalStatus.style.color = 'var(--ink-teal)';
      terminalStatus.textContent = `* Current Screen: [${state.currentScreen}]. Accessible on each page:`;
    }
  } else {
    if (termHeader) termHeader.textContent = 'TERMINAL: MALACHI_OVERRIDE';
    if (termPrompt) termPrompt.textContent = '* RESTRICTED ACCESS // OPERATOR CLEARANCE REQUIRED';
    if (termSubprompt) termSubprompt.textContent = '* Enter the secret override passcode:';
    if (termInputWrap) termInputWrap.removeAttribute('hidden');
    if (btnSubmit) btnSubmit.removeAttribute('hidden');
    if (btnCancel) btnCancel.textContent = 'ABORT';
    if (devPanel) devPanel.setAttribute('hidden', '');
    updateControllerKeyboardsVisibility();
  }
}

function toggleDevModal() {
  sound.resume();
  sound.playTextBlip();
  if (!modalSecretOverride) return;
  if (modalSecretOverride.hasAttribute('hidden')) {
    modalSecretOverride.removeAttribute('hidden');
    updateDevModalUI();
  } else {
    modalSecretOverride.setAttribute('hidden', '');
  }
}

function triggerDevCheatUnlock() {
  enableDevMode();
  sound.resume();
  sound.playDeterminationFanfare();
  triggerHaptic([100, 50, 100, 50, 200]);
  modalSecretOverride.removeAttribute('hidden');
  secretPasscodeInput.value = 'OCTO-CHAMPION-2026';
  terminalStatus.style.color = 'var(--ink-teal)';
  terminalStatus.textContent = '* CHEAT CODE ACTIVATED!\n* Dev Controls Unlocked! Staying on Start Screen.';
  updateDevModalUI();

  setTimeout(() => {
    modalSecretOverride.setAttribute('hidden', '');
    updateDevBarDisplay();
  }, 1200);
}

function initSecretOverride() {
  initTerminalKeyboard();

  if (btnSecretPeeker) {
    const spriteEl = btnSecretPeeker.querySelector('.peeker-squid-sprite');
    if (spriteEl && !spriteEl.hasChildNodes()) {
      spriteEl.innerHTML = generateSVGFromMatrix(PLAYER_SPRITE_PIXELS, 'var(--ink-teal)');
    }

    btnSecretPeeker.onclick = (e) => {
      e.stopPropagation();
      sound.resume();
      sound.playTextBlip();
      modalSecretOverride.removeAttribute('hidden');
      updateDevModalUI();
      if (!state.devModeActive) {
        secretPasscodeInput.value = '';
        terminalStatus.textContent = '';
        selectedTerminalKeyIndex = 0;
        updateTerminalKeySelection();
        updateControllerKeyboardsVisibility();
        if (currentInputMode === 'keyboard') {
          secretPasscodeInput.focus();
        }
      }
    };
  }

  if (btnCancelOverride) {
    btnCancelOverride.onclick = () => {
      sound.resume();
      sound.playTextBlip();
      modalSecretOverride.setAttribute('hidden', '');
    };
  }

  if (btnSubmitOverride) {
    btnSubmitOverride.onclick = submitSecretOverride;
  }

  if (secretPasscodeInput) {
    secretPasscodeInput.onfocus = () => {
      setInputMode('keyboard');
    };
    secretPasscodeInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        submitSecretOverride();
      } else if (e.key === 'Escape') {
        modalSecretOverride.setAttribute('hidden', '');
      }
    };
  }

  if (btnFakeoutSurrender) {
    btnFakeoutSurrender.onclick = () => {
      sound.resume();
      sound.playTextBlip();
      modalFakeout67.setAttribute('hidden', '');
      showDialogue("* Back to the countdown you go! See you on September 8th, Zaman! ❤️");
    };
  }

  // Wire up Dev Control Panel Buttons inside Modal (§16)
  document.querySelectorAll('.dev-btn').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      if (btn.dataset.devScreen) {
        devJumpToScreen(btn.dataset.devScreen);
      } else if (btn.dataset.devTier !== undefined) {
        devSetTier(parseInt(btn.dataset.devTier, 10));
      } else if (btn.dataset.devResetTime !== undefined) {
        devResetTime();
      } else if (btn.dataset.devRound !== undefined) {
        devSetRound(parseInt(btn.dataset.devRound, 10));
      } else if (btn.dataset.devBosshp !== undefined) {
        devSetBossHP(parseInt(btn.dataset.devBosshp, 10));
      }
    };
  });

  // Wire up Floating Dev Bar (§16)
  const btnDevPrev = document.getElementById('dev-bar-prev');
  const btnDevNext = document.getElementById('dev-bar-next');
  const btnDevMenu = document.getElementById('dev-bar-menu');
  if (btnDevPrev) btnDevPrev.onclick = () => devPrevPage();
  if (btnDevNext) btnDevNext.onclick = () => devNextPage();
  if (btnDevMenu) btnDevMenu.onclick = () => toggleDevModal();

  setupSpaceInvadersFakeout();
}

function submitSecretOverride() {
  sound.resume();
  const rawInput = (secretPasscodeInput.value || '').trim().toUpperCase();
  const cleanInput = rawInput.replace(/[^A-Z0-9]/g, '');

  const isMatch = VALID_DEV_PASSCODES.some(code => {
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return rawInput === code.toUpperCase() || (cleanInput !== '' && cleanInput === cleanCode);
  });

  if (isMatch) {
    enableDevMode();
    terminalStatus.style.color = 'var(--ink-teal)';
    terminalStatus.textContent = '* DEV OVERRIDE CONFIRMED. Welcome, Operator Malachi!\n* Dev Controls Unlocked! Staying on Start Screen.';
    sound.playDeterminationFanfare();
    triggerHaptic([50, 50, 100, 50, 200]);
    updateDevModalUI();

    setTimeout(() => {
      modalSecretOverride.setAttribute('hidden', '');
      updateDevBarDisplay();
    }, 1200);
    return;
  }

  // WRONG PASSCODE: Escalating hilarious responses!
  wrongOverrideAttempts++;
  terminalStatus.style.color = 'var(--ink-coral)';
  sound.playStaticNoise();
  triggerHaptic(60);

  // Screen shake
  appContainer.classList.remove('shake-intense');
  void appContainer.offsetWidth; // trigger reflow
  appContainer.classList.add('shake-intense');
  setTimeout(() => appContainer.classList.remove('shake-intense'), 400);

  if (wrongOverrideAttempts === 1) {
    terminalStatus.textContent = "* Nu uh uh! ☝️ Nice try, Zaman. That is NOT the secret override!";
  } else if (wrongOverrideAttempts === 2) {
    terminalStatus.textContent = "* 🚨 ACCESS DENIED: Clearance level: BIRTHDAY BOY (Restricted).";
  } else if (wrongOverrideAttempts === 3) {
    terminalStatus.textContent = "* Error 404: Birthday Patience Not Found. Guessing won't rush Sept 8th!";
  } else if (wrongOverrideAttempts === 4) {
    terminalStatus.textContent = "* DENIED! Did you really think Malachi made the code that obvious? 😏";
  } else {
    // Attempt 5+: The Ultimate Fake-out!
    terminalStatus.style.color = 'var(--gold)';
    terminalStatus.textContent = '* OVERRIDE ACCEPTED...? DECRYPTING SPLATFEST GATES...';
    sound.playDeterminationFanfare();

    setTimeout(() => {
      modalSecretOverride.setAttribute('hidden', '');
      triggerFakeoutMinigame();
    }, 1200);
  }
}

function triggerFakeoutMinigame() {
  sound.resume();
  sound.playStaticNoise();
  modalFakeout67.removeAttribute('hidden');
  gridFakeout67.innerHTML = '';
  let inkedCount = 0;
  const targetTiles = 16;
  const sillyTexts = ['67!', 'LOL', '>_<', 'NOPE', 'WAIT!', 'XD', 'NUH', '67'];

  for (let i = 0; i < targetTiles; i++) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'fakeout-tile';
    tile.textContent = '?';

    tile.onclick = () => {
      if (!tile.classList.contains('inked')) {
        tile.classList.add('inked');
        tile.textContent = sillyTexts[i % sillyTexts.length];
        inkedCount++;
        fakeoutCounter.textContent = `TILES INKED: ${inkedCount * 4} / 67`;
        sound.playTextBlip();
        triggerHaptic(25);

        if (inkedCount >= targetTiles) {
          setTimeout(() => {
            modalFakeout67.setAttribute('hidden', '');
            showDialogue("* Okay, okay! You inked the 67 penalty tiles!\n* But no skipping the line: See you on September 8th, Zaman! ❤️");
          }, 600);
        }
      }
    };
    gridFakeout67.appendChild(tile);
  }
}

// --- 9.2 SPACE INVADERS MOSQUITO FAKEOUT MINIGAME ---
let invadersAnimationId = null;
let invadersActive = false;
let mosquitoShipX = 220;
let mosquitoShipY = 280;
let mosquitoLeftPressed = false;
let mosquitoRightPressed = false;
let mosquitoBloodPellets = [];
let invaderSplatterParticles = [];
let spaceInvadersTargets = [];
let invadersDirection = 1; // 1: right, -1: left
let invadersSpeed = 1.25;
let invadersScore = 0;
let invadersRemaining = 12;
let lastPelletFireTime = 0;

let invadersDialogueTypingTimeout = null;
let isInvadersDialogueTyping = false;
let currentInvadersDialogueFullText = '';

const INVADERS_FAKEOUT_TEXT = "* Did you relly think I'd make it that easy for you. I hope you didn't get bit!";

function skipInvadersDialogue() {
  if (!isInvadersDialogueTyping) return;
  clearTimeout(invadersDialogueTypingTimeout);
  isInvadersDialogueTyping = false;
  const pEl = document.getElementById('invaders-dialogue-p') || document.getElementById('invaders-dialogue-text');
  if (pEl) {
    pEl.textContent = currentInvadersDialogueFullText;
  }
  const cursorEl = document.getElementById('invaders-deltarune-cursor');
  if (cursorEl) cursorEl.removeAttribute('hidden');
  sound.playTextBlip();
}

function typeInvadersDialogue(text, onComplete) {
  clearTimeout(invadersDialogueTypingTimeout);
  currentInvadersDialogueFullText = text;
  isInvadersDialogueTyping = true;

  const pEl = document.getElementById('invaders-dialogue-p') || document.getElementById('invaders-dialogue-text');
  const cursorEl = document.getElementById('invaders-deltarune-cursor');
  if (cursorEl) cursorEl.setAttribute('hidden', '');
  if (pEl) pEl.textContent = '';

  let i = 0;
  function typeChar() {
    if (!isInvadersDialogueTyping) return;
    if (i < text.length) {
      const char = text[i];
      if (pEl) pEl.textContent += char;
      if (char !== ' ' && char !== '\n') {
        sound.playTextBlip();
      }
      i++;
      invadersDialogueTypingTimeout = setTimeout(typeChar, state.reducedMotion ? 0 : 26);
    } else {
      isInvadersDialogueTyping = false;
      if (cursorEl) cursorEl.removeAttribute('hidden');
      if (onComplete) onComplete();
    }
  }

  typeChar();
}

function setupSpaceInvadersFakeout() {
  if (btnBypassPeeker) {
    const spriteEl = btnBypassPeeker.querySelector('.peeker-mosquito-sprite');
    if (spriteEl && (typeof spriteEl.hasChildNodes !== 'function' || !spriteEl.hasChildNodes())) {
      spriteEl.innerHTML = generateSVGFromMatrix(MOSQUITO_SPRITE_PIXELS, '#374151', MOSQUITO_PALETTE);
    }
    btnBypassPeeker.onclick = (e) => {
      e.stopPropagation();
      openSpaceInvadersFakeout();
    };
  }

  const portraitEl = document.getElementById('deltarune-speaker-portrait');
  if (portraitEl && (typeof portraitEl.hasChildNodes !== 'function' || !portraitEl.hasChildNodes())) {
    portraitEl.innerHTML = generateSVGFromMatrix(MOSQUITO_SPRITE_PIXELS, '#374151', MOSQUITO_PALETTE);
  }

  const deltaruneCard = document.getElementById('deltarune-invaders-card');
  if (deltaruneCard) {
    deltaruneCard.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      skipInvadersDialogue();
    };
  }

  if (btnInvadersCancel) {
    btnInvadersCancel.onclick = () => {
      closeSpaceInvadersFakeout();
      showDialogue("* Bypass aborted! Security measures hold strong until September 8th! ❤️");
    };
  }

  if (btnInvadersAcceptFakeout) {
    btnInvadersAcceptFakeout.onclick = () => {
      sound.resume();
      sound.playTextBlip();
      closeSpaceInvadersFakeout();
      showDialogue("* Malachi: \"Nice mosquito piloting though, Zaman! See you September 8th!\" ❤️");
    };
  }

  // Touch & on-screen button controls
  if (btnInvaderLeft) {
    btnInvaderLeft.onpointerdown = (e) => { e.preventDefault(); mosquitoLeftPressed = true; };
    btnInvaderLeft.onpointerup = (e) => { e.preventDefault(); mosquitoLeftPressed = false; };
    btnInvaderLeft.onpointerleave = () => { mosquitoLeftPressed = false; };
    btnInvaderLeft.onpointercancel = () => { mosquitoLeftPressed = false; };
  }
  if (btnInvaderRight) {
    btnInvaderRight.onpointerdown = (e) => { e.preventDefault(); mosquitoRightPressed = true; };
    btnInvaderRight.onpointerup = (e) => { e.preventDefault(); mosquitoRightPressed = false; };
    btnInvaderRight.onpointerleave = () => { mosquitoRightPressed = false; };
    btnInvaderRight.onpointercancel = () => { mosquitoRightPressed = false; };
  }
  if (btnInvaderFire) {
    btnInvaderFire.onpointerdown = (e) => {
      e.preventDefault();
      fireBloodPellet();
    };
  }

  // Canvas tap / click to aim and fire
  if (invadersCanvas) {
    invadersCanvas.onpointerdown = (e) => {
      const rect = invadersCanvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * invadersCanvas.width;
      if (clickX < mosquitoShipX - 25) {
        mosquitoShipX = Math.max(20, mosquitoShipX - 25);
      } else if (clickX > mosquitoShipX + 25) {
        mosquitoShipX = Math.min(invadersCanvas.width - 20, mosquitoShipX + 25);
      }
      fireBloodPellet();
    };
  }
}

function openSpaceInvadersFakeout() {
  sound.resume();
  sound.playContestAlert();
  if (!modalInvadersFakeout) return;
  modalInvadersFakeout.removeAttribute('hidden');
  if (invadersRevealScreen) invadersRevealScreen.setAttribute('hidden', '');

  // Reset Game State
  invadersActive = true;
  mosquitoShipX = 220;
  mosquitoShipY = 280;
  mosquitoLeftPressed = false;
  mosquitoRightPressed = false;
  mosquitoBloodPellets = [];
  invaderSplatterParticles = [];
  invadersDirection = 1;
  invadersSpeed = 1.25;
  invadersScore = 0;
  invadersRemaining = 12;
  lastPelletFireTime = 0;

  // Build grid of 12 invaders: Row 0 is 6s (Electric Cyan), Row 1 is 7s (Bright Gold)
  spaceInvadersTargets = [];
  const colSpacing = 52;
  const startX = 64;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 6; c++) {
      spaceInvadersTargets.push({
        x: startX + c * colSpacing,
        y: 46 + r * 38,
        width: 28,
        height: 24,
        val: r === 0 ? '6' : '7',
        color: r === 0 ? '#00f0ff' : '#ffd23f',
        alive: true,
      });
    }
  }

  updateInvadersHUD();

  if (invadersAnimationId) cancelAnimationFrame(invadersAnimationId);
  invadersAnimationId = requestAnimationFrame(spaceInvadersGameLoop);
}

function closeSpaceInvadersFakeout() {
  invadersActive = false;
  isInvadersDialogueTyping = false;
  clearTimeout(invadersDialogueTypingTimeout);
  if (invadersAnimationId) {
    cancelAnimationFrame(invadersAnimationId);
    invadersAnimationId = null;
  }
  if (modalInvadersFakeout) {
    modalInvadersFakeout.setAttribute('hidden', '');
  }
  if (invadersRevealScreen) {
    invadersRevealScreen.setAttribute('hidden', '');
  }
}

function moveMosquitoShip(dir) {
  if (!invadersActive || !invadersCanvas) return;
  const canvasW = invadersCanvas.width || 440;
  mosquitoShipX = Math.max(20, Math.min(canvasW - 20, mosquitoShipX + dir * 18));
}

function fireBloodPellet() {
  if (!invadersActive || !invadersCanvas) return;
  const now = Date.now();
  if (now - lastPelletFireTime < 160) return; // Responsive fire rate
  if (mosquitoBloodPellets.length >= 5) return;
  lastPelletFireTime = now;

  mosquitoBloodPellets.push({
    x: mosquitoShipX,
    y: mosquitoShipY - 14,
    vy: -6.8,
    size: 4,
  });

  sound.playTextBlip();
  triggerHaptic(20);
}

function updateInvadersHUD() {
  if (invadersHudScore) {
    invadersHudScore.textContent = `SCORE: ${String(invadersScore).padStart(4, '0')}`;
  }
  if (invadersHudCount) {
    invadersHudCount.textContent = `LEFT: ${invadersRemaining}`;
  }
}

function triggerInvadersFakeoutReveal() {
  invadersActive = false;
  sound.playStaticNoise();
  triggerHaptic([60, 40, 100]);
  if (invadersRevealScreen) {
    invadersRevealScreen.removeAttribute('hidden');
    typeInvadersDialogue(INVADERS_FAKEOUT_TEXT);
  }
}

function drawMosquitoSprite(ctx, x, y) {
  const pixelSize = 2.4;
  const matrix = MOSQUITO_SPRITE_PIXELS;
  const rows = matrix.length;
  const cols = matrix[0].length;
  const startX = Math.round(x - (cols * pixelSize) / 2);
  const startY = Math.round(y - (rows * pixelSize) / 2);
  const wingFlap = (Math.floor(Date.now() / 90) % 2) === 0;

  ctx.save();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let val = matrix[r][c];
      if (val === 4) {
        // Pixelated flapping wings
        let drawRow = wingFlap ? r : (r <= 4 ? r + 1 : r);
        let color = wingFlap ? 'rgba(0, 240, 255, 0.95)' : 'rgba(0, 240, 255, 0.65)';
        ctx.fillStyle = color;
        ctx.fillRect(startX + c * pixelSize, startY + drawRow * pixelSize, pixelSize, pixelSize);
        continue;
      }
      if (val !== 0) {
        let color = '#374151';
        if (val === 1) color = '#282f3d';
        else if (val === 2) color = '#ef4444';
        else if (val === 3) color = '#ff0055';
        else if (val === 5) color = '#ffd23f';
        ctx.fillStyle = color;
        ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
  ctx.restore();
}

function spaceInvadersGameLoop() {
  if (!invadersActive || !invadersCanvas) return;
  const ctx = invadersCanvas.getContext('2d');
  if (!ctx) return;

  const w = invadersCanvas.width;
  const h = invadersCanvas.height;

  // Clear Canvas with retro background
  ctx.fillStyle = '#06030b';
  ctx.fillRect(0, 0, w, h);

  // Background stars / retro grid dots
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let sx = 15; sx < w; sx += 40) {
    for (let sy = 15; sy < h - 50; sy += 40) {
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
  }

  // 1. Move Player
  if (mosquitoLeftPressed) {
    mosquitoShipX = Math.max(20, mosquitoShipX - 4.5);
  }
  if (mosquitoRightPressed) {
    mosquitoShipX = Math.min(w - 20, mosquitoShipX + 4.5);
  }

  // 2. March Invaders (6s and 7s)
  let shouldDrop = false;
  let leftmost = w;
  let rightmost = 0;
  let lowestY = 0;

  spaceInvadersTargets.forEach((target) => {
    if (!target.alive) return;
    if (target.x < leftmost) leftmost = target.x;
    if (target.x + target.width > rightmost) rightmost = target.x + target.width;
    if (target.y + target.height > lowestY) lowestY = target.y + target.height;
  });

  if (invadersDirection === 1 && rightmost >= w - 16) {
    shouldDrop = true;
    invadersDirection = -1;
  } else if (invadersDirection === -1 && leftmost <= 16) {
    shouldDrop = true;
    invadersDirection = 1;
  }

  const currentSpeed = invadersSpeed * (1 + (12 - invadersRemaining) * 0.08);

  spaceInvadersTargets.forEach((target) => {
    if (!target.alive) return;
    target.x += invadersDirection * currentSpeed;
    if (shouldDrop) {
      target.y += 14;
    }
  });

  // Check if invaders reached player level
  if (lowestY >= mosquitoShipY - 10 && invadersRemaining > 0) {
    triggerInvadersFakeoutReveal();
    return;
  }

  // 3. Update & Draw Blood Pellets
  for (let i = mosquitoBloodPellets.length - 1; i >= 0; i--) {
    const p = mosquitoBloodPellets[i];
    p.y += p.vy;

    // Draw Blood Pellet (crimson tear drop)
    ctx.save();
    ctx.fillStyle = '#ff0033';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    // Droplet tip
    ctx.beginPath();
    ctx.moveTo(p.x - p.size, p.y);
    ctx.lineTo(p.x, p.y - p.size * 2);
    ctx.lineTo(p.x + p.size, p.y);
    ctx.fill();
    // Shiny highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x - 1, p.y - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Check hit against invaders
    let hit = false;
    for (let t = 0; t < spaceInvadersTargets.length; t++) {
      const invader = spaceInvadersTargets[t];
      if (!invader.alive) continue;
      if (
        p.x >= invader.x - 4 &&
        p.x <= invader.x + invader.width + 4 &&
        p.y >= invader.y - 18 &&
        p.y <= invader.y + 6
      ) {
        invader.alive = false;
        hit = true;
        invadersRemaining--;
        invadersScore += (invader.val === '7' ? 200 : 100);
        updateInvadersHUD();
        sound.playPlayerInk();
        triggerHaptic(30);

        // Spawn crimson blood & digital burst particles
        for (let k = 0; k < 12; k++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.5 + Math.random() * 3.5;
          invaderSplatterParticles.push({
            x: invader.x + invader.width / 2,
            y: invader.y - 6,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            color: Math.random() > 0.4 ? '#ff0055' : invader.color,
            size: 2 + Math.random() * 3,
            life: 25,
            maxLife: 25,
          });
        }
        break;
      }
    }

    if (hit || p.y < 0) {
      mosquitoBloodPellets.splice(i, 1);
    }
  }

  // 4. Update & Draw Splatter Particles
  for (let i = invaderSplatterParticles.length - 1; i >= 0; i--) {
    const pt = invaderSplatterParticles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.vy += 0.08; // gravity
    pt.life--;

    const alpha = pt.life / pt.maxLife;
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    if (pt.life <= 0) {
      invaderSplatterParticles.splice(i, 1);
    }
  }

  // 5. Draw Invaders (6s and 7s)
  ctx.font = 'bold 20px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  spaceInvadersTargets.forEach((invader) => {
    if (!invader.alive) return;
    const hoverY = Math.sin(Date.now() * 0.007 + invader.x * 0.05) * 2;
    ctx.save();
    ctx.fillStyle = invader.color;
    ctx.shadowColor = invader.color;
    ctx.shadowBlur = 8;
    ctx.fillText(invader.val, invader.x + invader.width / 2, invader.y + hoverY);
    ctx.restore();
  });

  // 6. Draw Mosquito Player Ship
  drawMosquitoSprite(ctx, mosquitoShipX, mosquitoShipY);

  // Check victory condition
  if (invadersRemaining <= 0) {
    invadersActive = false;
    setTimeout(() => {
      triggerInvadersFakeoutReveal();
    }, 450);
    return;
  }

  invadersAnimationId = requestAnimationFrame(spaceInvadersGameLoop);
}

// --- 10. COLOR PICKER & GUI ARROW SELECTION (§10 & §13) ---
function initColorPicker() {
  swatchesContainer.innerHTML = '';
  INK_SWATCHES.forEach((swatch, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `swatch-item ${index === state.selectedColorIndex ? 'selected' : ''}`;
    item.dataset.index = index;
    item.innerHTML = `
      <span class="swatch-pointer">▸</span>
      <span class="swatch-dot" style="background-color: ${swatch.color};"></span>
      <span class="swatch-name">${swatch.name}</span>
    `;

    item.addEventListener('click', () => {
      selectSwatchByIndex(index);
    });

    swatchesContainer.appendChild(item);
  });

  applyColor(state.selectedColor);
}

function selectSwatchByIndex(index) {
  sound.resume();
  sound.playTextBlip();
  state.selectedColorIndex = (index + INK_SWATCHES.length) % INK_SWATCHES.length;
  state.selectedColor = INK_SWATCHES[state.selectedColorIndex];
  sessionMemory.colorsTried.add(state.selectedColor.id);
  applyColor(state.selectedColor);

  document.querySelectorAll('.swatch-item').forEach((btn, idx) => {
    if (idx === state.selectedColorIndex) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

function applyColor(swatch) {
  document.documentElement.style.setProperty('--player-color', swatch.color);
  if (playerSprite) {
    playerSprite.innerHTML = generateSVGFromMatrix(PLAYER_SPRITE_PIXELS, swatch.color);
  }
}

// --- 11. DELTARUNE VESSEL CREATOR ENGINE ---
function initVesselMaker() {
  const kPrev = document.getElementById('vessel-preview-kraken');
  const oPrev = document.getElementById('vessel-preview-octo');
  const pPrev = document.getElementById('vessel-preview-phantom');

  if (kPrev) kPrev.innerHTML = generateSVGFromMatrix(VESSEL_KRAKEN_PIXELS, '#ffffff');
  if (oPrev) oPrev.innerHTML = generateSVGFromMatrix(VESSEL_OCTO_PIXELS, '#ffffff');
  if (pPrev) pPrev.innerHTML = generateSVGFromMatrix(VESSEL_PHANTOM_PIXELS, '#ffffff');

  document.querySelectorAll('.vessel-card').forEach((card, idx) => {
    card.onclick = () => {
      selectVesselCard(idx);
    };
  });

  initVirtualKeyboard();

  btnVesselNext.onclick = () => {
    sound.resume();
    sound.playTextBlip();
    vesselStepSprite.setAttribute('hidden', '');
    vesselStepName.removeAttribute('hidden');
    updateControlHint();
    updateVirtualKeyboardSelection();
  };

  btnVesselFinish.onclick = () => {
    finishVesselNaming();
  };

  if (vesselNameInput) {
    vesselNameInput.onfocus = () => {
      setInputMode('keyboard');
    };
    vesselNameInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        finishVesselNaming();
      }
    };
  }

  btnVesselAccept.onclick = () => {
    sound.resume();
    sound.playDeterminationFanfare();
    sessionMemory.vesselCreated = true;
    CONFIG.playerName = 'Zaman67';
    hudTeamPlayer.textContent = 'Zaman67';
    statMvp.textContent = 'Zaman67 MVP';
    triggerTitleToMatch(true);
  };
}

function initVirtualKeyboard() {
  if (!vesselKeyboard) return;
  vesselKeyboard.innerHTML = '';
  VIRTUAL_KEYBOARD_LAYOUT.forEach((key, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `vkey-btn ${idx === selectedVKeyIndex ? 'active' : ''} ${key === 'DEL' ? 'vkey-del' : ''} ${key === 'DONE' ? 'vkey-done' : ''}`;
    btn.textContent = key;
    btn.dataset.index = idx;
    btn.dataset.key = key;

    btn.onclick = (e) => {
      e.preventDefault();
      selectedVKeyIndex = idx;
      updateVirtualKeyboardSelection();
      pressVirtualKey(key);
    };

    vesselKeyboard.appendChild(btn);
  });
}

function updateVirtualKeyboardSelection() {
  const keys = document.querySelectorAll('.vkey-btn');
  keys.forEach((btn, idx) => {
    if (idx === selectedVKeyIndex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function pressVirtualKey(key) {
  sound.resume();
  sound.playTextBlip();
  if (key === 'DEL') {
    vesselNameInput.value = vesselNameInput.value.slice(0, -1);
  } else if (key === 'DONE') {
    finishVesselNaming();
  } else {
    if (vesselNameInput.value.length < 12) {
      vesselNameInput.value += key;
    }
  }
}

function setInputMode(mode) {
  if (currentInputMode === mode) return;
  currentInputMode = mode;
  updateControlHint();
  updateControllerKeyboardsVisibility();
}

function updateControllerKeyboardsVisibility() {
  const isCtrl = currentInputMode === 'controller';
  if (document.body) {
    document.body.classList.toggle('controller-mode', isCtrl);
  }
  const vKb = document.getElementById('vessel-keyboard');
  if (vKb) {
    if (isCtrl) {
      vKb.removeAttribute('hidden');
      vKb.style.display = 'grid';
    } else {
      vKb.setAttribute('hidden', '');
      vKb.style.display = 'none';
    }
  }
  const tKb = document.getElementById('terminal-keyboard');
  if (tKb) {
    if (isCtrl) {
      tKb.removeAttribute('hidden');
      tKb.style.display = 'grid';
    } else {
      tKb.setAttribute('hidden', '');
      tKb.style.display = 'none';
    }
  }
}

function updateControlHint() {
  if (!inputHelpText || !inputHelpIcon) return;
  const isCtrl = currentInputMode === 'controller';
  inputHelpIcon.textContent = isCtrl ? '🎮' : '⌨️';

  const screen = state.currentScreen;
  if (screen === 'TITLE') {
    inputHelpText.textContent = isCtrl 
      ? '[D-PAD] COLOR • (A) ENTER MATCH' 
      : '[ARROWS] COLOR • [ENTER/SPACE] START';
  } else if (screen === 'VESSEL') {
    if (!vesselStepSprite.hasAttribute('hidden')) {
      inputHelpText.textContent = isCtrl 
        ? '[D-PAD] CHOOSE SHAPE • (A) CONFIRM' 
        : '[ARROWS] CHOOSE SHAPE • [ENTER] CONFIRM';
    } else if (!vesselStepName.hasAttribute('hidden')) {
      inputHelpText.textContent = isCtrl 
        ? '[D-PAD] KEYBOARD • (A) TYPE • (B) DEL • [START] DONE' 
        : 'TYPE NAME ON KEYBOARD • [ENTER] FINALIZE';
    } else {
      inputHelpText.textContent = isCtrl 
        ? '(A) ACCEPT DESTINY' 
        : '[ENTER/SPACE] ACCEPT DESTINY';
    }
  } else if (screen === 'MATCH') {
    if (!fightInterstitial.hasAttribute('hidden')) {
      inputHelpText.textContent = isCtrl 
        ? '(A) STRIKE IN GOLD ZONE!' 
        : '[SPACE/ENTER] STRIKE IN GOLD ZONE!';
    } else {
      inputHelpText.textContent = isCtrl 
        ? '[D-PAD / L-STICK] INK TURF • (A) STRIKE' 
        : '[ARROWS / WASD] INK TURF';
    }
  } else if (screen === 'BOSS') {
    if (state.bossDodgeActive) {
      inputHelpText.textContent = isCtrl 
        ? '[D-PAD / L-STICK] DODGE INK BULLETS!' 
        : '[ARROWS] DODGE INK BULLETS!';
    } else {
      inputHelpText.textContent = isCtrl 
        ? '[D-PAD] MENU • (A) SELECT ACTION' 
        : '[ARROWS] MENU • [ENTER/SPACE] SELECT';
    }
  } else if (screen === 'REVEAL') {
    inputHelpText.textContent = isCtrl 
      ? '(A) OPEN YOUR NOTE' 
      : '[ENTER/SPACE] OPEN YOUR NOTE';
  } else if (screen === 'NOTE') {
    inputHelpText.textContent = isCtrl 
      ? '(A) OUR NEXT ADVENTURE' 
      : '[ENTER/SPACE] OUR NEXT ADVENTURE';
  } else if (screen === 'ALBUM') {
    inputHelpText.textContent = isCtrl 
      ? '(A) BACK / REPLAY • [D-PAD] EXPLORE' 
      : '[ARROWS] SCROLL • [ENTER] SELECT';
  }
}

function selectVesselCard(index) {
  sound.resume();
  sound.playTextBlip();
  state.selectedVesselIndex = (index + 3) % 3;
  document.querySelectorAll('.vessel-card').forEach((card, idx) => {
    if (idx === state.selectedVesselIndex) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

function finishVesselNaming() {
  sound.resume();
  sound.playStaticNoise();
  triggerHaptic([30, 40, 50]);

  vesselStepName.setAttribute('hidden', '');
  vesselStepRejection.removeAttribute('hidden');
  btnVesselAccept.setAttribute('hidden', '');

  const rejectionSpeech = `* Thank you for your time.
* Your answers...
* Your choices...
* NO ONE CAN CHOOSE WHO THEY ARE IN THIS WORLD.
* ...
* Your squid is named Zaman67.
* And your sprite is the default Cat-Squid.
* (Though you may still choose your ink color. We aren't monsters.)`;

  typeVesselRejectionText(rejectionSpeech, () => {
    btnVesselAccept.removeAttribute('hidden');
  });
}

function typeVesselRejectionText(text, callback) {
  vesselRejectionText.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      vesselRejectionText.textContent += text[i];
      if (text[i] !== ' ' && text[i] !== '\n') sound.playTextBlip();
      i++;
      setTimeout(type, state.reducedMotion ? 0 : 32);
    } else if (callback) {
      setTimeout(callback, 300);
    }
  }
  type();
}

// --- 12. GRID & INKING ENGINE ---
function buildGrid() {
  gridContainer.innerHTML = '';
  state.tileOwnership.clear();
  const currentPhoto = getActivePhoto();

  for (let r = 0; r < state.gridSize; r++) {
    for (let c = 0; c < state.gridSize; c++) {
      const tile = document.createElement('div');
      tile.className = 'grid-tile';
      tile.dataset.row = r;
      tile.dataset.col = c;
      tile.style.setProperty('--row', r);
      tile.style.setProperty('--col', c);

      const photoSlice = document.createElement('div');
      photoSlice.className = 'tile-photo';
      photoSlice.style.setProperty('--row', r);
      photoSlice.style.setProperty('--col', c);
      photoSlice.style.backgroundImage = `url('${currentPhoto}')`;

      const inkWash = document.createElement('div');
      inkWash.className = 'tile-ink-wash';

      tile.appendChild(photoSlice);
      tile.appendChild(inkWash);
      gridContainer.appendChild(tile);
    }
  }

  playerSprite.innerHTML = generateSVGFromMatrix(PLAYER_SPRITE_PIXELS, state.selectedColor.color);
  updatePlayerSpritePosition();

  rivalSprite.innerHTML = generateSVGFromMatrix(RIVAL_SPRITE_PIXELS, 'var(--rival-color)');
  updateRivalSpritePosition();
}

function updatePlayerSpritePosition() {
  playerSprite.style.setProperty('--player-col', state.playerPos.c);
  playerSprite.style.setProperty('--player-row', state.playerPos.r);
}

function updateRivalSpritePosition() {
  rivalSprite.style.setProperty('--rival-col', state.rivalPos.c);
  rivalSprite.style.setProperty('--rival-row', state.rivalPos.r);
}

function inkPlayerTile(r, c) {
  const key = `${r},${c}`;
  const prevOwner = state.tileOwnership.get(key);
  if (prevOwner === 'player') return;

  state.tileOwnership.set(key, 'player');
  const index = r * state.gridSize + c;
  const tile = gridContainer.children[index];
  if (tile) {
    tile.classList.remove('inked-rival');
    tile.classList.add('inked-player');
  }

  sound.playPlayerInk();
  triggerHaptic(15);
  updateTurfMetrics();
}

function inkRivalTile(r, c) {
  const key = `${r},${c}`;
  const prevOwner = state.tileOwnership.get(key);
  if (prevOwner === 'rival') return;

  state.tileOwnership.set(key, 'rival');
  const index = r * state.gridSize + c;
  const tile = gridContainer.children[index];
  if (tile) {
    tile.classList.remove('inked-player');
    tile.classList.add('inked-rival');
  }

  if (prevOwner === 'player') {
    sound.playContestAlert();
    triggerHaptic([25, 40, 25]);
    sessionMemory.tilesStolenTotal++;
  } else {
    sound.playRivalInk();
  }

  updateTurfMetrics();
}

function updateTurfMetrics() {
  let playerCount = 0;
  let rivalCount = 0;

  state.tileOwnership.forEach((owner) => {
    if (owner === 'player') playerCount++;
    if (owner === 'rival') rivalCount++;
  });

  const playerPct = Math.round((playerCount / state.totalTiles) * 100);
  const rivalPct = Math.round((rivalCount / state.totalTiles) * 100);

  sessionMemory.lastPlayerTurfPct = playerPct;
  sessionMemory.lastRivalTurfPct = rivalPct;

  progressFill.style.width = `${playerPct}%`;
  progressRivalFill.style.width = `${rivalPct}%`;

  progressLabelPlayer.textContent = `YOU: ${playerPct}%`;
  progressLabelRival.textContent = `RIVAL: ${rivalPct}%`;

  const totalInked = playerCount + rivalCount;
  if (totalInked >= state.totalTiles && state.isGameActive) {
    onMatchWin();
  }
}

function inkSplashReward(centerR, centerC) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = centerR + dr;
      const c = centerC + dc;
      if (r >= 0 && r < state.gridSize && c >= 0 && c < state.gridSize) {
        inkPlayerTile(r, c);
      }
    }
  }
}

// --- 13. PLAYER CONTROLS WITH PACING ---
function movePlayer(dr, dc) {
  if (!state.isGameActive || state.isAutoCompleting) return;

  const now = performance.now();
  if (now - state.lastMoveTimestamp < state.moveCooldownMs) return;
  state.lastMoveTimestamp = now;

  const newR = Math.max(0, Math.min(state.gridSize - 1, state.playerPos.r + dr));
  const newC = Math.max(0, Math.min(state.gridSize - 1, state.playerPos.c + dc));

  if (newR !== state.playerPos.r || newC !== state.playerPos.c) {
    state.playerPos.r = newR;
    state.playerPos.c = newC;
    updatePlayerSpritePosition();
    inkPlayerTile(newR, newC);
  }
}

// --- 14. SMARTER & FASTER RIVAL AI ---
function startRivalAI() {
  const roundData = ROUNDS_CONFIG[state.currentRound] || ROUNDS_CONFIG[1];
  const intervalTime = roundData.rivalSpeed || 320;

  clearInterval(state.rivalInterval);
  state.rivalInterval = setInterval(() => {
    if (!state.isGameActive || state.isAutoCompleting) return;
    moveRivalAI();
  }, intervalTime);
}

function moveRivalAI() {
  const { r, c } = state.rivalPos;
  const neighbors = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ].map(d => ({ r: r + d.dr, c: c + d.dc }))
   .filter(p => p.r >= 0 && p.r < state.gridSize && p.c >= 0 && p.c < state.gridSize);

  if (neighbors.length === 0) return;

  const roundData = ROUNDS_CONFIG[state.currentRound] || ROUNDS_CONFIG[1];
  const huntProb = roundData.huntProb || 0.25;

  let target = null;
  if (Math.random() < huntProb) {
    target = neighbors.reduce((best, cur) => {
      const distCur = Math.hypot(cur.r - state.playerPos.r, cur.c - state.playerPos.c);
      const distBest = Math.hypot(best.r - state.playerPos.r, best.c - state.playerPos.c);
      return distCur < distBest ? cur : best;
    }, neighbors[0]);
  } else {
    const weightedPool = [];
    neighbors.forEach(n => {
      const owner = state.tileOwnership.get(`${n.r},${n.c}`);
      if (owner === 'player') {
        weightedPool.push(n, n, n, n);
      } else if (!owner) {
        weightedPool.push(n, n);
      } else {
        weightedPool.push(n);
      }
    });
    target = weightedPool[Math.floor(Math.random() * weightedPool.length)];
  }

  if (target) {
    state.rivalPos = target;
    updateRivalSpritePosition();
    inkRivalTile(target.r, target.c);
  }
}

// --- 15. COUNTDOWN ---
function runCountdown(onComplete) {
  const sequence = ['3', '2', '1', 'GO'];
  let index = 0;

  countdownOverlay.classList.add('active');

  function showNext() {
    if (index >= sequence.length) {
      countdownOverlay.classList.remove('active');
      countdownText.textContent = '';
      if (onComplete) onComplete();
      return;
    }

    const currentText = sequence[index];
    countdownText.textContent = currentText;

    const isGo = currentText === 'GO';
    sound.playCountdownThunk(isGo);

    if (!state.reducedMotion) {
      countdownText.classList.remove('countdown-animate');
      void countdownText.offsetWidth;
      countdownText.classList.add('countdown-animate');
    }

    index++;
    setTimeout(showNext, state.reducedMotion ? 250 : 700);
  }

  showNext();
}

function triggerDeterminationBeat(onComplete) {
  if (state.reducedMotion) {
    if (onComplete) onComplete();
    return;
  }

  sound.playDeterminationFanfare();
  determinationOverlay.classList.add('active');
  playfieldWrapper.classList.add('screen-shake');

  setTimeout(() => {
    determinationOverlay.classList.remove('active');
    playfieldWrapper.classList.remove('screen-shake');
    if (onComplete) onComplete();
  }, 1200);
}

// --- 16. MID-MATCH FIGHT SCREEN (§19) ---
function triggerMidMatchFight() {
  if (state.midMatchFightTriggered || !state.isGameActive) return;
  state.midMatchFightTriggered = true;

  state.isGameActive = false;
  clearInterval(state.timerInterval);
  clearInterval(state.rivalInterval);

  triggerTVStaticCut(() => {
    fightInterstitial.removeAttribute('hidden');
    sound.startBattleMusic(false);

    fightRivalSprite.innerHTML = generateSVGFromMatrix(RIVAL_SPRITE_PIXELS, 'var(--rival-color)');

    const fightLines = state.currentRound > 1
      ? '* "You took the previous round... but not this one!"'
      : '* "Think you can out-ink me?! Deflect this!"';
    document.getElementById('fight-rival-dialogue').textContent = fightLines;

    fightResultText.textContent = '';
    btnFightStrike.disabled = false;
    startStrikeSlider();
  });
}

function startStrikeSlider() {
  state.strikeCursorPos = 0;
  state.strikeCursorSpeed = 2.4;
  cancelAnimationFrame(state.strikeAnimFrame);

  function animateSlider() {
    state.strikeCursorPos += state.strikeCursorSpeed;
    if (state.strikeCursorPos >= 96) {
      state.strikeCursorPos = 96;
      state.strikeCursorSpeed = -Math.abs(state.strikeCursorSpeed);
    } else if (state.strikeCursorPos <= 0) {
      state.strikeCursorPos = 0;
      state.strikeCursorSpeed = Math.abs(state.strikeCursorSpeed);
    }

    if (fightStrikeCursor) {
      fightStrikeCursor.style.left = `${state.strikeCursorPos}%`;
    }

    state.strikeAnimFrame = requestAnimationFrame(animateSlider);
  }

  state.strikeAnimFrame = requestAnimationFrame(animateSlider);
}

function resolveFightStrike() {
  cancelAnimationFrame(state.strikeAnimFrame);
  btnFightStrike.disabled = true;

  const isHit = state.strikeCursorPos >= 36 && state.strikeCursorPos <= 64;

  if (isHit) {
    sound.playDeterminationFanfare();
    triggerHaptic([30, 40, 60]);
    fightResultText.textContent = '★ CRITICAL HIT! 3x3 TURF SPLASH GRANTED!';
    sessionMemory.midMatchFightCompleted = true;
    inkSplashReward(state.playerPos.r, state.playerPos.c);
  } else {
    sound.playContestAlert();
    triggerHaptic(25);
    fightResultText.textContent = 'DEFLECTED! Turf battle resumes!';
  }

  setTimeout(() => {
    triggerTVStaticCut(() => {
      fightInterstitial.setAttribute('hidden', '');
      sound.stopBattleMusic();

      state.isGameActive = true;
      startMatchTimer();
      startRivalAI();
    });
  }, 1200);
}

// --- 17. BOSS BATTLE: COUNTER-ATTACKS & GREEN MERCY ---
function startBossBattle() {
  state.bossHealth = 3;
  state.bossActItemCount = 0;
  state.bossSelectedActionIndex = 0;
  updateBossHealthUI();
  updateBossMercyButtonUI();
  updateBossMenuSelection();
  showScreen('BOSS');

  sound.startBattleMusic(true);
  bossSpriteLarge.innerHTML = generateSVGFromMatrix(RIVAL_SPRITE_PIXELS, 'var(--rival-color)');

  const bossIntro = `* MEGA RIVAL INKLING blocks your final gift!\n* "You won all three rounds, Zaman... but you won't pass me!"`;
  typeBossText(bossIntro);
  initBossActionMenu();
}

function updateBossHealthUI() {
  const pct = Math.max(0, (state.bossHealth / state.bossMaxHealth) * 100);
  bossHpFill.style.width = `${pct}%`;
  const hearts = '♥'.repeat(Math.max(0, state.bossHealth));
  bossHpHearts.textContent = hearts || '♡';
}

function updateBossMercyButtonUI() {
  if (state.bossActItemCount >= 2) {
    bossBtnMercy.classList.remove('mercy-disabled');
    bossBtnMercy.classList.add('mercy-enabled');
  } else {
    bossBtnMercy.classList.add('mercy-disabled');
    bossBtnMercy.classList.remove('mercy-enabled');
  }
}

function updateBossMenuSelection() {
  document.querySelectorAll('.boss-menu-btn').forEach((btn, idx) => {
    if (idx === state.bossSelectedActionIndex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function typeBossText(text, callback) {
  bossNarrativeText.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      bossNarrativeText.textContent += text[i];
      if (text[i] !== ' ' && text[i] !== '\n') sound.playTextBlip();
      i++;
      setTimeout(type, state.reducedMotion ? 0 : 24);
    } else if (callback) {
      setTimeout(callback, 400);
    }
  }
  type();
}

function initBossActionMenu() {
  document.querySelectorAll('.boss-menu-btn').forEach((btn, index) => {
    btn.onclick = () => {
      state.bossSelectedActionIndex = index;
      updateBossMenuSelection();
      handleBossAction(btn.dataset.action);
    };
  });
}

function handleBossAction(action) {
  sound.resume();
  sound.playTextBlip();

  if (action === 'fight') {
    bossStrikeZone.removeAttribute('hidden');
    startBossSlider();
  } else if (action === 'act') {
    state.bossActItemCount++;
    updateBossMercyButtonUI();

    const actMessage = state.bossActItemCount >= 2
      ? '* You told the rival: "You made this tournament unforgettable!"\n* The rival is deeply touched! MERCY IS NOW GREEN!'
      : '* You complimented the rival\'s ink strategy.\n* The rival\'s guard lowers!';
    
    typeBossText(actMessage, () => {
      triggerBossCounterAttack();
    });
  } else if (action === 'item') {
    state.bossActItemCount++;
    updateBossMercyButtonUI();

    const itemMessage = state.bossActItemCount >= 2
      ? '* You offered a giant slice of Birthday Cake!\n* The rival eats happily! MERCY IS NOW GREEN!'
      : '* You shared a celebratory snack.\n* The rival enjoys the birthday spirit!';

    typeBossText(itemMessage, () => {
      triggerBossCounterAttack();
    });
  } else if (action === 'mercy') {
    if (state.bossActItemCount < 2) {
      typeBossText('* The rival is still on guard!\n* Try ACTing or sharing an ITEM first!');
      sound.playContestAlert();
    } else {
      onBossMercySuccess();
    }
  }
}

function startBossSlider() {
  state.strikeCursorPos = 0;
  state.strikeCursorSpeed = 2.4;
  cancelAnimationFrame(state.strikeAnimFrame);

  function animateBossSlider() {
    state.strikeCursorPos += state.strikeCursorSpeed;
    if (state.strikeCursorPos >= 96) {
      state.strikeCursorPos = 96;
      state.strikeCursorSpeed = -Math.abs(state.strikeCursorSpeed);
    } else if (state.strikeCursorPos <= 0) {
      state.strikeCursorPos = 0;
      state.strikeCursorSpeed = Math.abs(state.strikeCursorSpeed);
    }

    if (bossStrikeCursor) {
      bossStrikeCursor.style.left = `${state.strikeCursorPos}%`;
    }

    state.strikeAnimFrame = requestAnimationFrame(animateBossSlider);
  }

  state.strikeAnimFrame = requestAnimationFrame(animateBossSlider);

  bossStrikeZone.onclick = resolveBossStrike;
}

function resolveBossStrike() {
  if (bossStrikeZone.hasAttribute('hidden')) return;
  cancelAnimationFrame(state.strikeAnimFrame);
  bossStrikeZone.setAttribute('hidden', '');
  bossStrikeZone.onclick = null;

  // Center sweet spot is ~50%
  const distFromCenter = Math.abs(state.strikeCursorPos - 50);
  const isHit = distFromCenter <= 24;

  if (isHit) {
    sound.playDeterminationFanfare();
    triggerHaptic([60, 50, 100]);
    state.bossHealth = Math.max(0, state.bossHealth - 1);
    updateBossHealthUI();

    // Damage flash on boss sprite
    if (bossSpriteLarge) {
      bossSpriteLarge.classList.add('boss-damaged');
      setTimeout(() => { if (bossSpriteLarge) bossSpriteLarge.classList.remove('boss-damaged'); }, 300);
    }

    // Floating damage text
    showBossDamagePopup("-1 HP!");

    if (state.bossHealth <= 0) {
      setTimeout(onBossDefeated, 700);
    } else {
      typeBossText('* DIRECT HIT! -1 HP! Mega Rival took damage!', () => {
        triggerBossCounterAttack();
      });
    }
  } else {
    sound.playContestAlert();
    showBossDamagePopup("GRAZE!");
    typeBossText('* The strike was off-center! Mega Rival retaliates!', () => {
      triggerBossCounterAttack();
    });
  }
}

function showBossDamagePopup(text) {
  const popup = document.createElement('div');
  popup.className = 'boss-damage-popup';
  popup.textContent = text;
  const stage = document.querySelector('.boss-stage');
  if (stage) stage.appendChild(popup);
  setTimeout(() => popup.remove(), 850);
}

function triggerBossCounterAttack() {
  typeBossText('* MEGA RIVAL counters with an Inkstrike barrage!', () => {
    bossDodgeArena.removeAttribute('hidden');
    state.bossDodgeActive = true;
    state.bossSoulPos = { x: 50, y: 50 };
    updateSoulPosition();

    const activeBullets = [];

    function spawnBullet(yPct, speed = 1.3, delay = 0) {
      setTimeout(() => {
        if (!state.bossDodgeActive) return;
        const b = document.createElement('div');
        b.className = 'ink-bullet';
        b.style.top = `${yPct}%`;
        b.style.left = '100%';
        bossDodgeArena.appendChild(b);
        activeBullets.push({ el: b, x: 100, y: yPct, speed });
      }, delay);
    }

    // Wave 1: Top & Bottom (Middle 35-65% is safe!)
    spawnBullet(16, 1.3, 100);
    spawnBullet(84, 1.3, 100);

    // Wave 2: Middle lane (Top and Bottom lanes are safe!)
    spawnBullet(42, 1.4, 850);
    spawnBullet(58, 1.4, 850);

    // Wave 3: Staggered diagonal streams with generous weaving gaps
    spawnBullet(24, 1.5, 1600);
    spawnBullet(76, 1.5, 1850);

    let dodgeTime = 0;
    const dodgeInterval = setInterval(() => {
      dodgeTime += 40;
      activeBullets.forEach(b => {
        b.x -= b.speed * 2.2;
        b.el.style.left = `${b.x}%`;

        // Check distance to soul
        const dx = Math.abs(b.x - state.bossSoulPos.x);
        const dy = Math.abs(b.y - state.bossSoulPos.y);
        if (dx < 7 && dy < 10) {
          if (bossSoul) {
            bossSoul.style.filter = 'drop-shadow(0 0 10px #ff0055)';
            setTimeout(() => { if (bossSoul) bossSoul.style.filter = ''; }, 120);
          }
          sound.playContestAlert();
          triggerHaptic(20);
        }
      });

      if (dodgeTime >= 2900) {
        clearInterval(dodgeInterval);
        state.bossDodgeActive = false;
        bossDodgeArena.setAttribute('hidden', '');
        activeBullets.forEach(b => b.el.remove());
        typeBossText('* You skillfully dodged the ink barrage!');
      }
    }, 40);
  });
}

function updateSoulPosition() {
  if (bossSoul) {
    bossSoul.style.left = `${state.bossSoulPos.x}%`;
    bossSoul.style.top = `${state.bossSoulPos.y}%`;
  }
}

function onBossMercySuccess() {
  sound.stopBattleMusic();
  sound.playDeterminationFanfare();
  triggerHaptic([60, 40, 100]);

  typeBossText('* You offered warm MERCY.\n* The rival drops their splattershot, smiling.\n* "...Alright, you win. Malachi really meant every word."\n* UNLOCKING THE SINCERE BIRTHDAY GIFT...', () => {
    setTimeout(() => {
      triggerDeterminationBeat(() => {
        state.currentRound = 4;
        transitionToNote();
      });
    }, 1200);
  });
}

function onBossDefeated() {
  sessionMemory.bossDefeated = true;
  sound.stopBattleMusic();
  sound.playDeterminationFanfare();

  typeBossText('* MEGA RIVAL CONCEDES!\n* "...You\'re the ultimate Splatfest champion, Zaman."\n* UNLOCKING THE SINCERE BIRTHDAY GIFT...', () => {
    setTimeout(() => {
      triggerDeterminationBeat(() => {
        state.currentRound = 4;
        transitionToNote();
      });
    }, 1200);
  });
}

// --- 18. MATCH LIFECYCLE ---
function startNewMatch() {
  state.playerPos = { r: 4, c: 4 };
  state.rivalPos = { r: 0, c: 9 };
  state.isGameActive = false;
  state.isAutoCompleting = false;
  state.midMatchFightTriggered = false;

  buildGrid();

  inkPlayerTile(state.playerPos.r, state.playerPos.c);
  inkRivalTile(state.rivalPos.r, state.rivalPos.c);

  const roundData = ROUNDS_CONFIG[state.currentRound] || ROUNDS_CONFIG[1];
  const introMessage = `* ${roundData.title} BEGINS!\n* Claim the turf to uncover the memory!`;

  showDialogue(introMessage, () => {
    runCountdown(() => {
      state.isGameActive = true;
      startMatchTimer();
      startRivalAI();
      if (playlist) playlist.start();
    });
  });
}

function startMatchTimer() {
  state.timeRemaining = CONFIG.matchDurationSec;
  state.elapsedTime = 0;
  updateTimerDisplay();

  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    state.elapsedTime++;
    updateTimerDisplay();

    if (state.timeRemaining === 25 && !state.midMatchFightTriggered) {
      triggerMidMatchFight();
    }

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      clearInterval(state.rivalInterval);
      onMatchTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(state.timeRemaining / 60);
  const secs = state.timeRemaining % 60;
  hudTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function onMatchWin() {
  state.isGameActive = false;
  clearInterval(state.timerInterval);
  clearInterval(state.rivalInterval);
  sessionMemory.timesWon++;

  triggerDeterminationBeat(transitionToReveal);
}

function onMatchTimeout() {
  state.isGameActive = false;
  state.isAutoCompleting = true;

  const remaining = [];
  for (let r = 0; r < state.gridSize; r++) {
    for (let c = 0; c < state.gridSize; c++) {
      if (state.tileOwnership.get(`${r},${c}`) !== 'player') {
        remaining.push({ r, c });
      }
    }
  }

  if (remaining.length === 0) {
    onMatchWin();
    return;
  }

  let delay = 0;
  const step = state.reducedMotion ? 0 : 15;

  remaining.forEach((coord, i) => {
    setTimeout(() => {
      inkPlayerTile(coord.r, coord.c);
      if (i === remaining.length - 1) {
        setTimeout(onMatchWin, 350);
      }
    }, delay);
    delay += step;
  });
}

// --- 19. REVEAL SCREEN ---
function transitionToReveal() {
  const playerPct = sessionMemory.lastPlayerTurfPct || 68;
  const rivalPct = sessionMemory.lastRivalTurfPct || 32;

  statPlayerTurf.textContent = `${playerPct}%`;
  statRivalTurf.textContent = `${rivalPct}%`;
  statPlayerLabel.textContent = CONFIG.playerName;

  const mins = Math.floor(state.elapsedTime / 60);
  const secs = state.elapsedTime % 60;
  statTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  statMvp.textContent = `${CONFIG.mvpTitle} MVP`;

  const currentPhoto = getActivePhoto();
  revealMosaic.innerHTML = '';
  for (let r = 0; r < state.gridSize; r++) {
    for (let c = 0; c < state.gridSize; c++) {
      const tile = document.createElement('div');
      tile.className = 'grid-tile revealed';
      tile.style.setProperty('--row', r);
      tile.style.setProperty('--col', c);

      const photoSlice = document.createElement('div');
      photoSlice.className = 'tile-photo';
      photoSlice.style.setProperty('--row', r);
      photoSlice.style.setProperty('--col', c);
      photoSlice.style.backgroundImage = `url('${currentPhoto}')`;

      const inkWash = document.createElement('div');
      inkWash.className = 'tile-ink-wash';

      if (!state.reducedMotion) {
        const staggerDelay = (r * state.gridSize + c) * 10;
        inkWash.style.animationDelay = `${staggerDelay}ms`;
      }

      tile.appendChild(photoSlice);
      tile.appendChild(inkWash);
      revealMosaic.appendChild(tile);
    }
  }

  showScreen('REVEAL');
}

// --- 20. NOTE SCREEN ---
function transitionToNote() {
  const currentData = ROUNDS_CONFIG[state.currentRound] || ROUNDS_CONFIG[1];
  const isGrandFinale = state.currentRound === 4;

  noteThumbImg.src = getActivePhoto();
  noteSealText.textContent = currentData.noteSeal;
  noteMessageBody.textContent = currentData.noteText;
  btnReplay.textContent = currentData.buttonText;

  const noteCardWrapper = document.getElementById('note-card-wrapper');
  if (noteCardWrapper) {
    if (isGrandFinale) {
      noteCardWrapper.classList.add('is-grand-finale');
      sound.resume();
      sound.playDeterminationFanfare();
      playGrandFinaleMusic(); // Starts looped 7_OClock.mp3 for the Grand Finale!
    } else {
      noteCardWrapper.classList.remove('is-grand-finale');
      stopGrandFinaleMusic();
    }
  }

  showScreen('NOTE');
}

function handleNoteButtonAction() {
  const currentData = ROUNDS_CONFIG[state.currentRound];

  if (currentData.nextAction === 'round_2') {
    state.currentRound = 2;
    showScreen('MATCH');
    startNewMatch();
  } else if (currentData.nextAction === 'round_3') {
    state.currentRound = 3;
    showScreen('MATCH');
    startNewMatch();
  } else if (currentData.nextAction === 'boss_gate') {
    triggerTVStaticCut(() => {
      startBossBattle();
    });
  } else {
    sound.resume();
    sound.playDeterminationFanfare();
    showScreen('ALBUM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// --- 20.1 PHOTO ALBUM & SCRAPBOOK ENGINE (§20 Grand Finale) ---
function initAlbumScreen() {
  if (btnAlbumBackNote) {
    btnAlbumBackNote.onclick = () => {
      sound.resume();
      sound.playTextBlip();
      showScreen('NOTE');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  if (btnAlbumReplay) {
    btnAlbumReplay.onclick = () => {
      stopGrandFinaleMusic(); // Stops 7_OClock.mp3 when restarting Splatfest!
      sound.resume();
      sound.playDeterminationFanfare();
      state.currentRound = 1;
      showScreen('MATCH');
      startNewMatch();
    };
  }
}

// --- 21. DIALOGUE BOX ENGINE WITH INSTANT SKIP (§15 & §16) ---
let dialogueTypingTimeout = null;
let isDialogueTyping = false;
let currentDialogueFullText = '';
let currentDialogueCallback = null;

function skipOrAdvanceDialogue() {
  if (!dialogueBox || dialogueBox.hasAttribute('hidden')) return;

  if (isDialogueTyping) {
    // 1. Skip typewriter immediately to completion!
    clearTimeout(dialogueTypingTimeout);
    dialogueText.textContent = currentDialogueFullText;
    isDialogueTyping = false;
    sound.playTextBlip();
  } else {
    // 2. Already finished typing -> advance and dismiss!
    dialogueBox.setAttribute('hidden', '');
    const cb = currentDialogueCallback;
    currentDialogueCallback = null;
    if (cb) cb();
  }
}

function showDialogue(text, onComplete) {
  dialogueBox.removeAttribute('hidden');
  dialogueText.textContent = '';
  clearTimeout(dialogueTypingTimeout);

  currentDialogueFullText = text;
  currentDialogueCallback = onComplete;
  isDialogueTyping = true;

  let i = 0;
  function typeChar() {
    if (!isDialogueTyping) return;
    if (i < text.length) {
      const char = text[i];
      dialogueText.textContent += char;
      if (char !== ' ' && char !== '\n') {
        sound.playTextBlip();
      }
      i++;
      dialogueTypingTimeout = setTimeout(typeChar, state.reducedMotion ? 0 : 26);
    } else {
      isDialogueTyping = false;
    }
  }

  typeChar();
}

if (dialogueBox) {
  dialogueBox.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    skipOrAdvanceDialogue();
  };
}

// --- 22. KONAMI CODE & EASTER EGG (ACCESSIBLE ON TITLE & LOCKED SCREENS) ---
const KONAMI_CODE_SEQUENCE = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'B', 'A'];
let konamiInputBuffer = [];
let konamiBufferTimer = null;

function recordKonamiStep(key) {
  clearTimeout(konamiBufferTimer);
  konamiBufferTimer = setTimeout(() => {
    konamiInputBuffer = [];
  }, 4500);

  konamiInputBuffer.push(key);
  if (konamiInputBuffer.length > KONAMI_CODE_SEQUENCE.length) {
    konamiInputBuffer.shift();
  }

  if (konamiInputBuffer.length === KONAMI_CODE_SEQUENCE.length) {
    const isKonamiMatch = KONAMI_CODE_SEQUENCE.every((val, idx) => val === konamiInputBuffer[idx]);
    if (isKonamiMatch) {
      konamiInputBuffer = [];
      clearTimeout(konamiBufferTimer);
      triggerEasterEgg();
      return true;
    }
  }
  return false;
}

function triggerEasterEgg() {
  sessionMemory.easterEggFound = true;
  triggerHaptic([100, 50, 100, 50, 200]);
  sound.playDeterminationFanfare();
  showDialogue('* ...you weren\'t supposed to find this.\n* But since you\'re here:\n* You\'re my favorite person in the whole universe. Happy Birthday! ❤️');
}

let squidHoldTimeout = null;
if (titleSquidHero) {
  titleSquidHero.addEventListener('pointerdown', () => {
    squidHoldTimeout = setTimeout(() => {
      triggerEasterEgg();
    }, 1600);
  });
  const clearSquidHold = () => clearTimeout(squidHoldTimeout);
  titleSquidHero.addEventListener('pointerup', clearSquidHold);
  titleSquidHero.addEventListener('pointerleave', clearSquidHold);
  titleSquidHero.addEventListener('pointercancel', clearSquidHold);

  titleSquidHero.addEventListener('click', () => {
    state.easterEggTaps++;
    sound.resume();
    sound.playTextBlip();
    if (state.easterEggTaps >= 5) {
      state.easterEggTaps = 0;
      triggerEasterEgg();
    }
  });
}

function triggerTitleToMatch(skipVessel = false) {
  sound.resume();
  if (playlist) playlist.start();

  // Route through Deltarune Vessel Maker if not yet created!
  if (!skipVessel && !sessionMemory.vesselCreated) {
    showScreen('VESSEL');
    vesselStepSprite.removeAttribute('hidden');
    vesselStepName.setAttribute('hidden', '');
    vesselStepRejection.setAttribute('hidden', '');
    return;
  }

  if (state.reducedMotion) {
    showScreen('MATCH');
    startNewMatch();
    return;
  }

  appContainer.classList.add('transitioning-to-match');
  setTimeout(() => {
    appContainer.classList.remove('transitioning-to-match');
    showScreen('MATCH');
    startNewMatch();
  }, 500);
}

// --- 23. GAMEPAD CONTROLLER LOOP (§17) ---
let lastGamepadMoveTime = 0;
let gpButtonAPreviouslyPressed = false;
let gpButtonBPreviouslyPressed = false;
let gpButtonXPreviouslyPressed = false;
let gpButtonYPreviouslyPressed = false;
let gpButtonStartPreviouslyPressed = false;

let lockedFocusIndex = 0; // 0: cat sprite, 1: countdown card, 2: peeker dev squid, 3: bypass peeker
let fakeoutTileFocusIndex = 0; // 0-15
let albumButtonFocusIndex = 0; // 0: back, 1: replay
let titleFocusSection = 'swatches'; // 'swatches' | 'start'

function updateLockedFocus() {
  const cat = document.getElementById('locked-cat-sprite');
  const card = document.getElementById('locked-countdown-card');
  const peeker = document.getElementById('btn-secret-peeker');
  const bypass = document.getElementById('btn-bypass-peeker');
  const targets = [cat, card, peeker, bypass];
  targets.forEach((el, idx) => {
    if (!el) return;
    if (idx === lockedFocusIndex) {
      el.classList.add('gamepad-focused');
    } else {
      el.classList.remove('gamepad-focused');
    }
  });
}

function updateFakeoutFocus() {
  if (!gridFakeout67) return;
  const tiles = gridFakeout67.querySelectorAll('.fakeout-tile');
  tiles.forEach((t, idx) => {
    if (idx === fakeoutTileFocusIndex) {
      t.classList.add('gamepad-focused');
    } else {
      t.classList.remove('gamepad-focused');
    }
  });
}

function updateAlbumButtonFocus() {
  const targets = [btnAlbumBackNote, btnAlbumReplay];
  targets.forEach((el, idx) => {
    if (!el) return;
    if (idx === albumButtonFocusIndex) {
      el.classList.add('gamepad-focused');
    } else {
      el.classList.remove('gamepad-focused');
    }
  });
}

let gpCheatUpPrev = false;
let gpCheatDownPrev = false;
let gpCheatLeftPrev = false;
let gpCheatRightPrev = false;
let gpButtonLBPreviouslyPressed = false;
let gpButtonRBPreviouslyPressed = false;

function pollGamepad() {
  const rawGamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;
  for (let i = 0; i < rawGamepads.length; i++) {
    if (rawGamepads[i] && rawGamepads[i].connected) {
      gp = rawGamepads[i];
      break;
    }
  }

  if (!gp) {
    requestAnimationFrame(pollGamepad);
    return;
  }

  const now = performance.now();
  const canMove = (now - lastGamepadMoveTime) > 170;

  const axisX = gp.axes[0] || 0;
  const axisY = gp.axes[1] || 0;
  const dpadUp = !!(gp.buttons[12] && gp.buttons[12].pressed);
  const dpadDown = !!(gp.buttons[13] && gp.buttons[13].pressed);
  const dpadLeft = !!(gp.buttons[14] && gp.buttons[14].pressed);
  const dpadRight = !!(gp.buttons[15] && gp.buttons[15].pressed);

  const stickUp = axisY < -0.55;
  const stickDown = axisY > 0.55;
  const stickLeft = axisX < -0.55;
  const stickRight = axisX > 0.55;

  const isUp = dpadUp || stickUp;
  const isDown = dpadDown || stickDown;
  const isLeft = dpadLeft || stickLeft;
  const isRight = dpadRight || stickRight;

  // Edge-triggered Cheat Code detection on D-Pad and Stick (press down ONLY on LOCKED screen)
  if (state.currentScreen === 'LOCKED' || !modalSecretOverride.hasAttribute('hidden')) {
    if (isUp && !gpCheatUpPrev) recordCheatDirection('UP');
    if (isDown && !gpCheatDownPrev) recordCheatDirection('DOWN');
    if (isLeft && !gpCheatLeftPrev) recordCheatDirection('LEFT');
    if (isRight && !gpCheatRightPrev) recordCheatDirection('RIGHT');
  }

  // Edge-triggered Konami Code detection (accessible on LOCKED and TITLE / Color Picker screen)
  if (state.currentScreen === 'LOCKED' || state.currentScreen === 'TITLE') {
    if (isUp && !gpCheatUpPrev) recordKonamiStep('UP');
    if (isDown && !gpCheatDownPrev) recordKonamiStep('DOWN');
    if (isLeft && !gpCheatLeftPrev) recordKonamiStep('LEFT');
    if (isRight && !gpCheatRightPrev) recordKonamiStep('RIGHT');
  }

  gpCheatUpPrev = isUp;
  gpCheatDownPrev = isDown;
  gpCheatLeftPrev = isLeft;
  gpCheatRightPrev = isRight;

  let moveX = 0;
  let moveY = 0;

  if (dpadUp || axisY < -0.35) moveY = -1;
  if (dpadDown || axisY > 0.35) moveY = 1;
  if (dpadLeft || axisX < -0.35) moveX = -1;
  if (dpadRight || axisX > 0.35) moveX = 1;

  const btnA = !!(gp.buttons[0] && gp.buttons[0].pressed);
  const btnB = !!(gp.buttons[1] && gp.buttons[1].pressed);
  const btnX = !!(gp.buttons[2] && gp.buttons[2].pressed);
  const btnY = !!(gp.buttons[3] && gp.buttons[3].pressed);
  const btnLB = !!(gp.buttons[4] && gp.buttons[4].pressed);
  const btnRB = !!(gp.buttons[5] && gp.buttons[5].pressed);
  const btnStart = !!(gp.buttons[9] && gp.buttons[9].pressed);

  // Dev Mode Bumpers (LB / RB to skip pages)
  if (state.devModeActive) {
    if (btnLB && !gpButtonLBPreviouslyPressed) devPrevPage();
    if (btnRB && !gpButtonRBPreviouslyPressed) devNextPage();
  }
  gpButtonLBPreviouslyPressed = btnLB;
  gpButtonRBPreviouslyPressed = btnRB;

  const hasControllerInput = (
    moveX !== 0 || moveY !== 0 || 
    btnA || btnB || btnX || btnY || 
    btnLB || btnRB || btnStart ||
    (gp.buttons[6] && gp.buttons[6].pressed) || 
    (gp.buttons[7] && gp.buttons[7].pressed) || 
    (gp.buttons[8] && gp.buttons[8].pressed) || 
    (gp.buttons[10] && gp.buttons[10].pressed) || 
    (gp.buttons[11] && gp.buttons[11].pressed)
  );

  if (hasControllerInput) {
    setInputMode('controller');
  }

  if (canMove && (moveX !== 0 || moveY !== 0)) {
    lastGamepadMoveTime = now;
    handleDirectionInput(moveY, moveX);
  }

  // Button A (Hold vs Tap on locked screen, with Konami check)
  if (btnA && !gpButtonAPreviouslyPressed) {
    if (state.currentScreen === 'LOCKED' || state.currentScreen === 'TITLE') {
      const isKonami = recordKonamiStep('A');
      if (isKonami) {
        gpButtonAPreviouslyPressed = btnA;
        return; // Easter egg triggered! Don't execute normal button A action
      }
    }
    handleActionInput();
  }
  if (!btnA && gpButtonAPreviouslyPressed) {
    handleActionRelease();
  }
  gpButtonAPreviouslyPressed = btnA;

  if (btnB && !gpButtonBPreviouslyPressed) {
    if (state.currentScreen === 'LOCKED' || state.currentScreen === 'TITLE') {
      recordKonamiStep('B');
    }
    handleCancelInput();
  }
  gpButtonBPreviouslyPressed = btnB;

  if (btnX && !gpButtonXPreviouslyPressed) {
    handleXButtonInput();
  }
  gpButtonXPreviouslyPressed = btnX;

  if (btnY && !gpButtonYPreviouslyPressed) {
    handleYButtonInput();
  }
  gpButtonYPreviouslyPressed = btnY;

  if (btnStart && !gpButtonStartPreviouslyPressed) {
    handleStartButtonInput();
  }
  gpButtonStartPreviouslyPressed = btnStart;

  requestAnimationFrame(pollGamepad);
}

function handleDirectionInput(dr, dc) {
  // 1. Modal Override active -> navigate terminal pixel keyboard or dev buttons!
  if (!modalSecretOverride.hasAttribute('hidden')) {
    if (state.devModeActive) {
      const devBtns = Array.from(modalSecretOverride.querySelectorAll('.dev-btn, #btn-cancel-override'));
      if (devBtns.length > 0) {
        if (dc === 1 || dr === 1) selectedDevBtnIndex = (selectedDevBtnIndex + 1) % devBtns.length;
        else if (dc === -1 || dr === -1) selectedDevBtnIndex = (selectedDevBtnIndex - 1 + devBtns.length) % devBtns.length;
        sound.playTextBlip();
        devBtns.forEach((b, idx) => {
          b.classList.toggle('gamepad-focused', idx === selectedDevBtnIndex);
        });
      }
      return;
    }
    if (dc === 1) selectedTerminalKeyIndex = (selectedTerminalKeyIndex + 1) % TERMINAL_KEYS.length;
    else if (dc === -1) selectedTerminalKeyIndex = (selectedTerminalKeyIndex - 1 + TERMINAL_KEYS.length) % TERMINAL_KEYS.length;
    else if (dr === 1) selectedTerminalKeyIndex = (selectedTerminalKeyIndex + 7) % TERMINAL_KEYS.length;
    else if (dr === -1) selectedTerminalKeyIndex = (selectedTerminalKeyIndex - 7 + TERMINAL_KEYS.length) % TERMINAL_KEYS.length;
    sound.playTextBlip();
    updateTerminalKeySelection();
    return;
  }

  // 2. Modal Fakeout active
  if (!modalFakeout67.hasAttribute('hidden')) {
    if (dc === 1) fakeoutTileFocusIndex = (fakeoutTileFocusIndex + 1) % 16;
    else if (dc === -1) fakeoutTileFocusIndex = (fakeoutTileFocusIndex - 1 + 16) % 16;
    else if (dr === 1) fakeoutTileFocusIndex = (fakeoutTileFocusIndex + 4) % 16;
    else if (dr === -1) fakeoutTileFocusIndex = (fakeoutTileFocusIndex - 4 + 16) % 16;
    sound.playTextBlip();
    updateFakeoutFocus();
    return;
  }

  // 2b. Modal Space Invaders Fakeout active
  if (modalInvadersFakeout && !modalInvadersFakeout.hasAttribute('hidden')) {
    if (dc === 1) moveMosquitoShip(1);
    else if (dc === -1) moveMosquitoShip(-1);
    return;
  }

  // 3. Locked Screen
  if (state.currentScreen === 'LOCKED') {
    if (dr === 1 || dc === 1) {
      lockedFocusIndex = (lockedFocusIndex + 1) % 4;
    } else if (dr === -1 || dc === -1) {
      lockedFocusIndex = (lockedFocusIndex - 1 + 4) % 4;
    }
    sound.playTextBlip();
    updateLockedFocus();
    return;
  }

  // 4. Title Screen
  if (state.currentScreen === 'TITLE') {
    if (dr === 1) {
      titleFocusSection = 'start';
      btnStart.classList.add('gamepad-focused');
      sound.playTextBlip();
    } else if (dr === -1) {
      titleFocusSection = 'swatches';
      btnStart.classList.remove('gamepad-focused');
      sound.playTextBlip();
    } else if (dc === 1) {
      selectSwatchByIndex(state.selectedColorIndex + 1);
    } else if (dc === -1) {
      selectSwatchByIndex(state.selectedColorIndex - 1);
    }
    return;
  }

  // 5. Vessel Screen
  if (state.currentScreen === 'VESSEL') {
    if (!vesselStepSprite.hasAttribute('hidden')) {
      if (dr === 1 || dc === 1) selectVesselCard(state.selectedVesselIndex + 1);
      if (dr === -1 || dc === -1) selectVesselCard(state.selectedVesselIndex - 1);
    } else if (!vesselStepName.hasAttribute('hidden')) {
      if (dc === 1) selectedVKeyIndex = (selectedVKeyIndex + 1) % 28;
      else if (dc === -1) selectedVKeyIndex = (selectedVKeyIndex - 1 + 28) % 28;
      else if (dr === 1) selectedVKeyIndex = (selectedVKeyIndex + 7) % 28;
      else if (dr === -1) selectedVKeyIndex = (selectedVKeyIndex - 7 + 28) % 28;
      sound.playTextBlip();
      updateVirtualKeyboardSelection();
    }
    return;
  }

  // 6. Boss Battle
  if (state.currentScreen === 'BOSS') {
    if (state.bossDodgeActive) {
      state.bossSoulPos.x = Math.max(10, Math.min(90, state.bossSoulPos.x + dc * 6));
      state.bossSoulPos.y = Math.max(10, Math.min(90, state.bossSoulPos.y + dr * 6));
      updateSoulPosition();
    } else {
      if (dc === 1) {
        state.bossSelectedActionIndex = (state.bossSelectedActionIndex + 1) % 4;
        updateBossMenuSelection();
        sound.playTextBlip();
      } else if (dc === -1) {
        state.bossSelectedActionIndex = (state.bossSelectedActionIndex + 3) % 4;
        updateBossMenuSelection();
        sound.playTextBlip();
      }
    }
    return;
  }

  // 7. Scrapbook Album Screen
  if (state.currentScreen === 'ALBUM') {
    if (dr !== 0) {
      window.scrollBy({ top: dr * 350, behavior: 'smooth' });
    }
    if (dc === 1 || dc === -1) {
      albumButtonFocusIndex = (albumButtonFocusIndex + 1) % 2;
      updateAlbumButtonFocus();
      sound.playTextBlip();
    }
    return;
  }

  // 8. Match Screen
  if (state.currentScreen === 'MATCH' && state.isGameActive) {
    movePlayer(dr, dc);
  }
}

function handleActionInput() {
  if (!dialogueBox.hasAttribute('hidden')) {
    dialogueBox.click();
    return;
  }

  // Modal Override active -> press selected virtual key or dev-btn!
  if (!modalSecretOverride.hasAttribute('hidden')) {
    if (state.devModeActive) {
      const devBtns = Array.from(modalSecretOverride.querySelectorAll('.dev-btn, #btn-cancel-override'));
      if (devBtns[selectedDevBtnIndex]) {
        devBtns[selectedDevBtnIndex].click();
      }
      return;
    }
    pressTerminalKey(TERMINAL_KEYS[selectedTerminalKeyIndex]);
    return;
  }

  // Modal Fakeout active
  if (!modalFakeout67.hasAttribute('hidden')) {
    const tiles = gridFakeout67.querySelectorAll('.fakeout-tile');
    if (tiles[fakeoutTileFocusIndex]) {
      tiles[fakeoutTileFocusIndex].click();
    }
    return;
  }

  // Modal Space Invaders Fakeout active
  if (modalInvadersFakeout && !modalInvadersFakeout.hasAttribute('hidden')) {
    if (invadersRevealScreen && !invadersRevealScreen.hasAttribute('hidden')) {
      if (isInvadersDialogueTyping) {
        skipInvadersDialogue();
      } else if (btnInvadersAcceptFakeout) {
        btnInvadersAcceptFakeout.click();
      }
    } else {
      fireBloodPellet();
    }
    return;
  }

  // Locked Screen
  if (state.currentScreen === 'LOCKED') {
    if (lockedFocusIndex === 0) {
      // Hold cat sprite to peek
      const cat = document.getElementById('locked-cat-sprite');
      const peek = document.getElementById('locked-photo-peek');
      if (cat && peek) {
        cat.classList.add('holding');
        peek.classList.add('peek-active');
        sound.playTextBlip();
      }
    } else if (lockedFocusIndex === 1) {
      // Countdown card
      const card = document.getElementById('locked-countdown-card');
      if (card) card.click();
    } else if (lockedFocusIndex === 2) {
      // Peeker Dev Squid
      if (btnSecretPeeker) btnSecretPeeker.click();
    } else if (lockedFocusIndex === 3) {
      // Promising Bypass Button
      if (btnBypassPeeker) btnBypassPeeker.click();
    }
    return;
  }

  // Title Screen
  if (state.currentScreen === 'TITLE') {
    if (titleFocusSection === 'start') {
      triggerTitleToMatch();
    } else {
      triggerTitleToMatch();
    }
    return;
  }

  // Vessel Screen
  if (state.currentScreen === 'VESSEL') {
    if (!vesselStepSprite.hasAttribute('hidden')) {
      btnVesselNext.click();
    } else if (!vesselStepName.hasAttribute('hidden')) {
      pressVirtualKey(VIRTUAL_KEYBOARD_LAYOUT[selectedVKeyIndex]);
    } else if (!vesselStepRejection.hasAttribute('hidden') && !btnVesselAccept.hasAttribute('hidden')) {
      btnVesselAccept.click();
    }
    return;
  }

  // Match Screen
  if (state.currentScreen === 'MATCH' && !fightInterstitial.hasAttribute('hidden')) {
    resolveFightStrike();
    return;
  }

  // Boss Battle
  if (state.currentScreen === 'BOSS') {
    if (!bossStrikeZone.hasAttribute('hidden')) {
      resolveBossStrike();
      return;
    }
    const action = bossActionButtons[state.bossSelectedActionIndex];
    handleBossAction(action);
    return;
  }

  // Reveal Screen
  if (state.currentScreen === 'REVEAL') {
    btnOpenNote.click();
    return;
  }

  // Note Screen
  if (state.currentScreen === 'NOTE') {
    handleNoteButtonAction();
    return;
  }

  // Album Screen
  if (state.currentScreen === 'ALBUM') {
    if (albumButtonFocusIndex === 0 && btnAlbumBackNote) {
      btnAlbumBackNote.click();
    } else if (albumButtonFocusIndex === 1 && btnAlbumReplay) {
      btnAlbumReplay.click();
    }
    return;
  }
}

function handleActionRelease() {
  if (state.currentScreen === 'LOCKED' && lockedFocusIndex === 0) {
    const cat = document.getElementById('locked-cat-sprite');
    const peek = document.getElementById('locked-photo-peek');
    if (cat) cat.classList.remove('holding');
    if (peek) peek.classList.remove('peek-active');
  }
}

function handleCancelInput() {
  if (!modalSecretOverride.hasAttribute('hidden')) {
    if (state.devModeActive) {
      modalSecretOverride.setAttribute('hidden', '');
      return;
    }
    pressTerminalKey('DEL');
    return;
  }

  if (!modalFakeout67.hasAttribute('hidden')) {
    btnFakeoutSurrender.click();
    return;
  }

  if (modalInvadersFakeout && !modalInvadersFakeout.hasAttribute('hidden')) {
    if (invadersRevealScreen && !invadersRevealScreen.hasAttribute('hidden')) {
      if (btnInvadersAcceptFakeout) btnInvadersAcceptFakeout.click();
    } else {
      closeSpaceInvadersFakeout();
    }
    return;
  }

  if (state.currentScreen === 'VESSEL' && !vesselStepName.hasAttribute('hidden')) {
    pressVirtualKey('DEL');
    return;
  }

  if (state.currentScreen === 'ALBUM') {
    btnAlbumBackNote.click();
    return;
  }
}

function handleXButtonInput() {
  // Toggle audio across any screen
  setAudioMute(!sound.isAmbientMuted);
}

function handleYButtonInput() {
  // Shortcut to open Dev Terminal / Controls!
  if (state.currentScreen === 'LOCKED' || state.devModeActive) {
    toggleDevModal();
  }
}

function handleStartButtonInput() {
  if (!modalSecretOverride.hasAttribute('hidden')) {
    submitSecretOverride();
    return;
  }
  if (state.currentScreen === 'VESSEL' && !vesselStepName.hasAttribute('hidden')) {
    finishVesselNaming();
  } else if (state.currentScreen === 'TITLE') {
    triggerTitleToMatch();
  }
}

window.addEventListener('gamepadconnected', (e) => {
  console.log('Gamepad connected:', e.gamepad ? e.gamepad.id : 'Gamepad');
  // NOTE: On-screen keyboards remain hidden until an actual controller input is detected in pollGamepad()!
});

window.addEventListener('gamepaddisconnected', () => {
  setInputMode('keyboard');
});

requestAnimationFrame(pollGamepad);

// --- 24. KEYBOARD & GUI SELECTION BY ARROWS ---
const keyMap = {
  ArrowUp: [-1, 0], KeyW: [-1, 0], w: [-1, 0], W: [-1, 0],
  ArrowDown: [1, 0], KeyS: [1, 0], s: [1, 0], S: [1, 0],
  ArrowLeft: [0, -1], KeyA: [0, -1], a: [0, -1], A: [0, -1],
  ArrowRight: [0, 1], KeyD: [0, 1], d: [0, 1], D: [0, 1],
};

let activeKeyInterval = null;
let currentKeyDir = null;

window.addEventListener('keydown', (e) => {
  // Physical keyboard key detected -> switch mode to keyboard and hide controller on-screen keyboards
  if (currentInputMode !== 'keyboard') {
    setInputMode('keyboard');
  }

  // Dialogue box active -> skip typewriter or advance!
  if (dialogueBox && !dialogueBox.hasAttribute('hidden')) {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyZ') {
      e.preventDefault();
      skipOrAdvanceDialogue();
      return;
    }
  }

  // Space Invaders Mosquito Fakeout keyboard controls
  if (modalInvadersFakeout && !modalInvadersFakeout.hasAttribute('hidden')) {
    if (invadersRevealScreen && !invadersRevealScreen.hasAttribute('hidden')) {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') {
        e.preventDefault();
        if (isInvadersDialogueTyping) {
          skipInvadersDialogue();
        } else if (btnInvadersAcceptFakeout) {
          btnInvadersAcceptFakeout.click();
        }
      }
      return;
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      e.preventDefault();
      mosquitoLeftPressed = true;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      e.preventDefault();
      mosquitoRightPressed = true;
    } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      fireBloodPellet();
    } else if (e.code === 'Escape') {
      e.preventDefault();
      closeSpaceInvadersFakeout();
    }
    return;
  }

  // Hotkey 'm' / 'M' toggles audio unless typing in an active text input
  if ((e.code === 'KeyM' || e.key === 'm' || e.key === 'M') && document.activeElement !== secretPasscodeInput) {
    e.preventDefault();
    setAudioMute(!sound.isAmbientMuted);
    return;
  }

  // Dev Mode shortcuts: '[' (prev page), ']' (next page), '\' or '~' (toggle dev modal)
  if (state.devModeActive && document.activeElement !== secretPasscodeInput) {
    if (e.code === 'BracketLeft' || e.key === '[') {
      e.preventDefault();
      devPrevPage();
      return;
    }
    if (e.code === 'BracketRight' || e.key === ']') {
      e.preventDefault();
      devNextPage();
      return;
    }
    if (e.code === 'Backslash' || e.key === '\\' || e.key === '~' || e.code === 'Backquote') {
      e.preventDefault();
      toggleDevModal();
      return;
    }
  }

  // Konami sequence tracking on keyboard (accessible on LOCKED and TITLE / Color select screen)
  if (!e.repeat && document.activeElement !== secretPasscodeInput) {
    let konamiKey = null;
    if (e.code === 'ArrowUp' || e.key === 'ArrowUp') konamiKey = 'UP';
    else if (e.code === 'ArrowDown' || e.key === 'ArrowDown') konamiKey = 'DOWN';
    else if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') konamiKey = 'LEFT';
    else if (e.code === 'ArrowRight' || e.key === 'ArrowRight') konamiKey = 'RIGHT';
    else if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') konamiKey = 'B';
    else if (e.code === 'KeyA' || e.key === 'a' || e.key === 'A') konamiKey = 'A';

    if (konamiKey && (state.currentScreen === 'LOCKED' || state.currentScreen === 'TITLE')) {
      const isKonami = recordKonamiStep(konamiKey);
      if (isKonami) {
        e.preventDefault();
        return;
      }
    }
  }

  // Cheat sequence listener on keyboard (press only, no auto-repeat, LOCKED screen ONLY)
  if (!e.repeat && (state.currentScreen === 'LOCKED' || !modalSecretOverride.hasAttribute('hidden'))) {
    let cheatDir = null;
    if (e.code === 'ArrowUp') cheatDir = 'UP';
    else if (e.code === 'ArrowDown') cheatDir = 'DOWN';
    else if (e.code === 'ArrowLeft') cheatDir = 'LEFT';
    else if (e.code === 'ArrowRight') cheatDir = 'RIGHT';

    if (cheatDir) {
      if (state.currentScreen === 'LOCKED') e.preventDefault();
      recordCheatDirection(cheatDir);
    }
  }

  // Modal Secret Override Keyboard Navigation (when not typing in text field)
  if (!modalSecretOverride.hasAttribute('hidden') && document.activeElement !== secretPasscodeInput) {
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      selectedTerminalKeyIndex = (selectedTerminalKeyIndex + 1) % TERMINAL_KEYS.length;
      updateTerminalKeySelection();
      sound.playTextBlip();
      return;
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      selectedTerminalKeyIndex = (selectedTerminalKeyIndex - 1 + TERMINAL_KEYS.length) % TERMINAL_KEYS.length;
      updateTerminalKeySelection();
      sound.playTextBlip();
      return;
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      selectedTerminalKeyIndex = (selectedTerminalKeyIndex + 7) % TERMINAL_KEYS.length;
      updateTerminalKeySelection();
      sound.playTextBlip();
      return;
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      selectedTerminalKeyIndex = (selectedTerminalKeyIndex - 7 + TERMINAL_KEYS.length) % TERMINAL_KEYS.length;
      updateTerminalKeySelection();
      sound.playTextBlip();
      return;
    }
  }

  if (state.currentScreen === 'TITLE') {
    if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
      e.preventDefault();
      selectSwatchByIndex(state.selectedColorIndex + 1);
    } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
      e.preventDefault();
      selectSwatchByIndex(state.selectedColorIndex - 1);
    } else if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      triggerTitleToMatch();
    }
    return;
  }

  if (state.currentScreen === 'VESSEL') {
    if (!vesselStepSprite.hasAttribute('hidden')) {
      if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
        e.preventDefault();
        selectVesselCard(state.selectedVesselIndex + 1);
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
        e.preventDefault();
        selectVesselCard(state.selectedVesselIndex - 1);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        btnVesselNext.click();
      }
    } else if (!vesselStepRejection.hasAttribute('hidden') && !btnVesselAccept.hasAttribute('hidden')) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        btnVesselAccept.click();
      }
    }
    return;
  }

  if (state.currentScreen === 'BOSS') {
    if (!bossStrikeZone.hasAttribute('hidden')) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        resolveBossStrike();
        return;
      }
    }

    if (state.bossDodgeActive) {
      if (e.code === 'ArrowLeft') state.bossSoulPos.x = Math.max(10, state.bossSoulPos.x - 7);
      if (e.code === 'ArrowRight') state.bossSoulPos.x = Math.min(90, state.bossSoulPos.x + 7);
      if (e.code === 'ArrowUp') state.bossSoulPos.y = Math.max(10, state.bossSoulPos.y - 7);
      if (e.code === 'ArrowDown') state.bossSoulPos.y = Math.min(90, state.bossSoulPos.y + 7);
      updateSoulPosition();
      return;
    }

    if (e.code === 'ArrowRight') {
      e.preventDefault();
      state.bossSelectedActionIndex = (state.bossSelectedActionIndex + 1) % 4;
      updateBossMenuSelection();
      sound.playTextBlip();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      state.bossSelectedActionIndex = (state.bossSelectedActionIndex + 3) % 4;
      updateBossMenuSelection();
      sound.playTextBlip();
    } else if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      const action = bossActionButtons[state.bossSelectedActionIndex];
      handleBossAction(action);
    }
    return;
  }

  if (state.currentScreen === 'MATCH') {
    if (!fightInterstitial.hasAttribute('hidden')) {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        resolveFightStrike();
      }
      return;
    }

    if (!state.isGameActive) return;

    const dir = keyMap[e.code] || keyMap[e.key];
    if (dir) {
      e.preventDefault();
      if (currentKeyDir === dir) return;

      currentKeyDir = dir;
      movePlayer(dir[0], dir[1]);

      clearInterval(activeKeyInterval);
      activeKeyInterval = setInterval(() => {
        movePlayer(dir[0], dir[1]);
      }, 170);
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (modalInvadersFakeout && !modalInvadersFakeout.hasAttribute('hidden')) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      mosquitoLeftPressed = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      mosquitoRightPressed = false;
    }
  }

  const dir = keyMap[e.code] || keyMap[e.key];
  if (dir && currentKeyDir === dir) {
    clearInterval(activeKeyInterval);
    activeKeyInterval = null;
    currentKeyDir = null;
  }
});

// Touch D-Pad
const dpadVectors = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1]
};

let dpadHoldInterval = null;

function handleDpadPress(dirKey, targetBtn) {
  if (state.currentScreen !== 'MATCH' || !state.isGameActive) return;

  const vector = dpadVectors[dirKey];
  if (!vector) return;

  if (targetBtn) targetBtn.classList.add('active');
  movePlayer(vector[0], vector[1]);

  clearInterval(dpadHoldInterval);
  dpadHoldInterval = setInterval(() => {
    movePlayer(vector[0], vector[1]);
  }, 180);
}

function handleDpadRelease(targetBtn) {
  if (targetBtn) targetBtn.classList.remove('active');
  clearInterval(dpadHoldInterval);
  dpadHoldInterval = null;
}

document.querySelectorAll('.dpad-btn').forEach((btn) => {
  const dir = btn.dataset.dir;
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.setPointerCapture?.(e.pointerId);
    handleDpadPress(dir, btn);
  });
  const release = (e) => {
    e.preventDefault();
    handleDpadRelease(btn);
  };
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('pointerleave', release);
});

// --- 25. EVENT LISTENERS ---
btnStart.addEventListener('click', () => {
  triggerTitleToMatch();
});

btnOpenNote.addEventListener('click', () => {
  transitionToNote();
});

btnReplay.addEventListener('click', () => {
  handleNoteButtonAction();
});

btnFightStrike.addEventListener('click', () => {
  resolveFightStrike();
});

btnAudioToggle.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  setAudioMute(!sound.isAmbientMuted);
});

// --- 24. POLISH PASS: AMBIENT PARTICLES & TAP RIPPLE (§24) ---
let ambientCanvas = null;
let ambientCtx = null;
let ambientParticles = [];
let ambientAnimId = null;

const SCREEN_PARTICLE_THEMES = {
  TITLE: {
    targetCount: 22,
    colors: ['#ff6b4a', '#00f0ff', '#ffd23f'],
    minAlpha: 0.15,
    maxAlpha: 0.32,
    speedY: -0.35
  },
  LOCKED: {
    targetCount: 16,
    colors: ['#00f0ff', '#ff6b4a', '#ffd23f'],
    minAlpha: 0.12,
    maxAlpha: 0.28,
    speedY: -0.28
  },
  NOTE: {
    targetCount: 8, // sparser, calm, doesn't compete with handwriting
    colors: ['#ffd23f', '#f4ecd8', '#e8c547'],
    minAlpha: 0.08,
    maxAlpha: 0.18,
    speedY: -0.18
  },
  REVEAL: {
    targetCount: 22,
    colors: ['#ff6b4a', '#00f0ff', '#ffd23f'],
    minAlpha: 0.15,
    maxAlpha: 0.32,
    speedY: -0.32
  },
  VESSEL: {
    targetCount: 12,
    colors: ['#ff6b4a', '#00f0ff', '#ffd23f'],
    minAlpha: 0.12,
    maxAlpha: 0.25,
    speedY: -0.25
  },
  ALBUM: {
    targetCount: 14,
    colors: ['#ffd23f', '#ff6b4a', '#00f0ff'],
    minAlpha: 0.12,
    maxAlpha: 0.26,
    speedY: -0.25
  },
  MATCH: { targetCount: 0 }, // Reserved for match gameplay effects
  BOSS: { targetCount: 0 }   // Reserved for boss battle effects
};

function getScreenParticleTheme() {
  const s = state.currentScreen;
  const theme = SCREEN_PARTICLE_THEMES[s] || { targetCount: 0 };
  if (s === 'LOCKED') {
    // Gently scale density with tier: Tier 4 ~10, Tier 1 ~22
    const tier = currentLockedTier !== null ? currentLockedTier : 3;
    const tierCounts = { 4: 10, 3: 14, 2: 18, 1: 22, 0: 24 };
    return {
      ...theme,
      targetCount: tierCounts[tier] || 14
    };
  }
  return theme;
}

function initAmbientParticles() {
  ambientCanvas = document.getElementById('ambient-particles-canvas');
  if (!ambientCanvas) return;
  ambientCtx = ambientCanvas.getContext('2d');
  if (!ambientCtx) return;

  const resizeCanvas = () => {
    if (!ambientCanvas) return;
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Tap / cursor ripple on non-MATCH screens
  window.addEventListener('pointerdown', (e) => {
    if (state.currentScreen === 'MATCH' || state.currentScreen === 'BOSS') return;
    spawnTapRipple(e.clientX, e.clientY);
  }, { passive: true });

  // Start animation loop
  if (!ambientAnimId) {
    ambientAnimId = requestAnimationFrame(updateAmbientParticles);
  }
}

function spawnTapRipple(clientX, clientY) {
  if (!ambientCanvas || !ambientCtx) return;
  const theme = getScreenParticleTheme();
  const colors = theme.colors || ['#ff6b4a', '#00f0ff'];
  const count = 7;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = 1.4 + Math.random() * 2.2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    ambientParticles.push({
      x: clientX,
      y: clientY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() > 0.5 ? 3 : 2,
      alpha: 0.85,
      decay: 0.055 + Math.random() * 0.02, // ~15-18 frames (~250-300ms)
      color,
      isRipple: true
    });
  }

  if (ambientParticles.length > 70) {
    ambientParticles = ambientParticles.slice(-60);
  }
}

function updateAmbientParticles() {
  if (!ambientCanvas || !ambientCtx) return;

  const width = ambientCanvas.width;
  const height = ambientCanvas.height;
  ambientCtx.clearRect(0, 0, width, height);

  const theme = getScreenParticleTheme();
  const targetCount = theme.targetCount || 0;

  if (document.hidden) {
    ambientAnimId = requestAnimationFrame(updateAmbientParticles);
    return;
  }

  let currentAmbientCount = 0;
  for (let i = 0; i < ambientParticles.length; i++) {
    if (!ambientParticles[i].isRipple) currentAmbientCount++;
  }

  if (currentAmbientCount < targetCount && Math.random() < 0.25) {
    const colors = theme.colors || ['#ff6b4a', '#00f0ff', '#ffd23f'];
    ambientParticles.push({
      x: Math.random() * width,
      y: height + Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (theme.speedY || -0.3) * (0.8 + Math.random() * 0.4),
      size: Math.random() > 0.6 ? 3 : 2,
      alpha: 0,
      baseAlpha: (theme.minAlpha || 0.1) + Math.random() * ((theme.maxAlpha || 0.25) - (theme.minAlpha || 0.1)),
      fadeIn: true,
      color: colors[Math.floor(Math.random() * colors.length)],
      isRipple: false,
      oscOffset: Math.random() * Math.PI * 2,
      oscSpeed: 0.015 + Math.random() * 0.02
    });
  }

  for (let i = ambientParticles.length - 1; i >= 0; i--) {
    const p = ambientParticles[i];

    if (p.isRipple) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha -= p.decay;

      if (p.alpha <= 0.01) {
        ambientParticles.splice(i, 1);
        continue;
      }
    } else {
      if (targetCount === 0) {
        p.alpha -= 0.05;
        if (p.alpha <= 0) {
          ambientParticles.splice(i, 1);
          continue;
        }
      } else {
        if (p.fadeIn) {
          p.alpha += 0.015;
          if (p.alpha >= p.baseAlpha) {
            p.alpha = p.baseAlpha;
            p.fadeIn = false;
          }
        }
      }

      p.oscOffset += p.oscSpeed;
      p.x += p.vx + Math.sin(p.oscOffset) * 0.2;
      p.y += p.vy;

      if (p.y < -10 || p.x < -10 || p.x > width + 10) {
        if (currentAmbientCount > targetCount) {
          ambientParticles.splice(i, 1);
          continue;
        }
        p.y = height + 5;
        p.x = Math.random() * width;
        p.alpha = 0;
        p.fadeIn = true;
      }
    }

    ambientCtx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
    ambientCtx.fillStyle = p.color;
    ambientCtx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }

  ambientCtx.globalAlpha = 1.0;
  ambientAnimId = requestAnimationFrame(updateAmbientParticles);
}

// --- 26. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  hudTeamPlayer.textContent = CONFIG.playerName;
  hudTeamRival.textContent = CONFIG.rivalName;

  playlist = new MusicPlaylistManager(sound);
  initColorPicker();
  initVesselMaker();
  initSecretOverride();
  initAlbumScreen();
  updateControllerKeyboardsVisibility();
  initAmbientParticles();

  const heroArt = document.querySelector('.hero-squid-art');
  if (heroArt) {
    heroArt.innerHTML = generateSVGFromMatrix(PLAYER_SPRITE_PIXELS, 'var(--player-color)');
  }

  const urlParams = new URLSearchParams(window.location.search);
  const targetScreen = urlParams.get('screen');

  if (targetScreen === 'locked') {
    showScreen('LOCKED');
    setupLockedInteractions();
    const tierParam = parseInt(urlParams.get('tier') || '3', 10);
    if (tierParam === 0) {
      triggerTier0UnlockTransition();
    } else {
      updateLockedCountdown(tierParam);
      if (urlParams.get('dialogue') === 'early') {
        const config = TIER_CONFIG[tierParam] || TIER_CONFIG[3];
        showDialogue(config.earlyLine);
      }
      if (!lockedCountdownInterval) {
        lockedCountdownInterval = setInterval(updateLockedCountdown, 1000);
      }
    }
    if (urlParams.get('secret') === 'open') {
      modalSecretOverride.removeAttribute('hidden');
      if (urlParams.get('status')) {
        terminalStatus.textContent = decodeURIComponent(urlParams.get('status'));
      }
    } else if (urlParams.get('fakeout') === 'open') {
      triggerFakeoutMinigame();
    } else if (urlParams.get('invaders') === 'open') {
      openSpaceInvadersFakeout();
    } else if (urlParams.get('peek') === 'active') {
      const peekEl = document.getElementById('locked-photo-peek');
      if (peekEl) peekEl.classList.add('peek-active');
    }
  } else if (targetScreen === 'vessel') {
    showScreen('VESSEL');
    if (urlParams.get('step') === 'rejection') {
      vesselStepSprite.setAttribute('hidden', '');
      vesselStepName.setAttribute('hidden', '');
      vesselStepRejection.removeAttribute('hidden');
      vesselRejectionText.textContent = `* Thank you for your time.
* Your answers...
* Your choices...
* NO ONE CAN CHOOSE WHO THEY ARE IN THIS WORLD.
* ...
* Your squid is named Zaman67.
* And your sprite is the default Cat-Squid.
* (Though you may still choose your ink color. We aren't monsters.)`;
      btnVesselAccept.removeAttribute('hidden');
    } else if (urlParams.get('step') === 'name') {
      vesselStepSprite.setAttribute('hidden', '');
      vesselStepName.removeAttribute('hidden');
      vesselStepRejection.setAttribute('hidden', '');
      if (urlParams.get('controller') === 'true') {
        setInputMode('controller');
      }
      updateControlHint();
      updateVirtualKeyboardSelection();
    } else {
      vesselStepSprite.removeAttribute('hidden');
      vesselStepName.setAttribute('hidden', '');
      vesselStepRejection.setAttribute('hidden', '');
    }
  } else if (targetScreen === 'match') {
    showScreen('MATCH');
    startNewMatch();
    [
      [4, 4], [4, 5], [5, 5], [5, 4]
    ].forEach(([r, c]) => inkPlayerTile(r, c));
    [
      [0, 9], [0, 8], [1, 9]
    ].forEach(([r, c]) => inkRivalTile(r, c));
  } else if (targetScreen === 'fight') {
    showScreen('MATCH');
    buildGrid();
    state.isGameActive = true;
    triggerMidMatchFight();
  } else if (targetScreen === 'boss') {
    startBossBattle();
  } else if (targetScreen === 'reveal') {
    state.currentRound = parseInt(urlParams.get('round') || '3', 10);
    buildGrid();
    state.elapsedTime = 47;
    sessionMemory.lastPlayerTurfPct = 68;
    sessionMemory.lastRivalTurfPct = 32;
    transitionToReveal();
  } else if (targetScreen === 'note') {
    state.currentRound = parseInt(urlParams.get('round') || '1', 10);
    transitionToNote();
  } else if (targetScreen === 'album') {
    state.currentRound = 4;
    showScreen('ALBUM');
    playGrandFinaleMusic();
  } else if (targetScreen === 'title') {
    showScreen('TITLE');
  } else if (urlParams.get('unlock') === 'true' || urlParams.get('tier') === '0') {
    showScreen('LOCKED');
    setupLockedInteractions();
    triggerTier0UnlockTransition();
  } else {
    initBirthdayGate();
  }
});
