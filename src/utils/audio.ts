// Web Audio API sound synthesizer for cute love effects without external assets

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playHeartPop(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function playSweetChime(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const startTime = ctx.currentTime + idx * 0.08;

      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch {
    // Ignore
  }
}

export function playBellNotification(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [880, 1174.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const st = now + idx * 0.12;

      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + 0.5);
    });
  } catch {
    // Ignore
  }
}

export function playCelebrationFanfare(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Ascending celebratory fanfare chord: C4, E4, G4, C5, E5, G5
    const fanfareNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    fanfareNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = now + idx * 0.09;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });
  } catch {
    // Ignore
  }
}

// -------------------------------------------------------------
// Romantic Background Music Synthesizer (Lofi Piano / Music Box)
// -------------------------------------------------------------
let bgMusicMasterGain: GainNode | null = null;
let bgMusicTimer: number | null = null;
let bgMusicStep = 0;
let isMusicActive = false;

// Chord progression: Cmaj7 -> G/B -> Am7 -> Fmaj7
// Frequencies for soothing notes
const NOTES_MAP: Record<string, number> = {
  C3: 130.81, G2: 98.00, A2: 110.00, F2: 87.31,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
};

// 16-step romantic acoustic melody pattern
const ROMANTIC_PATTERN: Array<{ bass?: string; melody: string[] }> = [
  // Cmaj7 measure
  { bass: 'C3', melody: ['E4', 'G4'] },
  { melody: ['B4'] },
  { melody: ['C5'] },
  { melody: ['G4', 'E4'] },
  // G/B measure
  { bass: 'G2', melody: ['D4', 'G4'] },
  { melody: ['B4'] },
  { melody: ['D5'] },
  { melody: ['B4', 'G4'] },
  // Am7 measure
  { bass: 'A2', melody: ['C4', 'E4'] },
  { melody: ['A4'] },
  { melody: ['C5'] },
  { melody: ['E5', 'A4'] },
  // Fmaj7 measure
  { bass: 'F2', melody: ['C4', 'E4'] },
  { melody: ['A4'] },
  { melody: ['G4'] },
  { melody: ['E4', 'C4'] },
];

function playPianoNote(ctx: AudioContext, masterGain: GainNode, freq: number, time: number, duration: number, isBass = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = isBass ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  const peakVol = isBass ? 0.35 : 0.22;
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(peakVol, time + (isBass ? 0.08 : 0.04));
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(time);
  osc.stop(time + duration);
}

export function startRomanticMusic(initialVolume = 0.5) {
  if (isMusicActive) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (!bgMusicMasterGain) {
    bgMusicMasterGain = ctx.createGain();
    bgMusicMasterGain.connect(ctx.destination);
  }

  bgMusicMasterGain.gain.setValueAtTime(Math.max(0, Math.min(1, initialVolume)) * 0.25, ctx.currentTime);
  isMusicActive = true;
  bgMusicStep = 0;

  const stepTimeSeconds = 0.42; // ~71 BPM, romantic gentle tempo

  const tick = () => {
    if (!isMusicActive || !bgMusicMasterGain) return;
    const now = ctx.currentTime;
    const currentStep = ROMANTIC_PATTERN[bgMusicStep % ROMANTIC_PATTERN.length];

    if (currentStep.bass && NOTES_MAP[currentStep.bass]) {
      playPianoNote(ctx, bgMusicMasterGain, NOTES_MAP[currentStep.bass], now, 1.4, true);
    }

    currentStep.melody.forEach((noteName, idx) => {
      if (NOTES_MAP[noteName]) {
        playPianoNote(ctx, bgMusicMasterGain!, NOTES_MAP[noteName], now + idx * 0.04, 0.9, false);
      }
    });

    bgMusicStep = (bgMusicStep + 1) % ROMANTIC_PATTERN.length;
  };

  tick();
  bgMusicTimer = window.setInterval(tick, stepTimeSeconds * 1000);
}

export function stopRomanticMusic() {
  isMusicActive = false;
  if (bgMusicTimer !== null) {
    clearInterval(bgMusicTimer);
    bgMusicTimer = null;
  }
}

export function setRomanticMusicVolume(volume: number) {
  const ctx = getAudioContext();
  if (ctx && bgMusicMasterGain) {
    const clamped = Math.max(0, Math.min(1, volume)) * 0.25;
    bgMusicMasterGain.gain.setValueAtTime(clamped, ctx.currentTime);
  }
}

export function isRomanticMusicPlaying(): boolean {
  return isMusicActive;
}

