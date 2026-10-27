// Web Audio API Synthesizer for NEXUS Sound Effects

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = (type, enabled = true) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'buy': {
        // High crisp double chime (coins / register)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6

        osc2.frequency.setValueAtTime(1318.51, now + 0.12);
        osc2.frequency.exponentialRampToValueAtTime(1975.53, now + 0.28); // B6

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.1);
        osc1.stop(now + 0.15);
        osc2.stop(now + 0.35);
        break;
      }

      case 'success': {
        // Joyful ascending arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0.12, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.22);
        });
        break;
      }

      case 'sleep':
      case 'rest': {
        // Warm soothing chord
        const freqs = [329.63, 440.0, 554.37, 659.25]; // E4, A4, C#5, E5
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.9);
        });
        break;
      }

      case 'error': {
        // Gentle low bump / warning
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case 'birthday': {
        // Celebratory triumphant fanfare
        const fanfare = [
          { f: 523.25, d: 0.12, t: 0.00 }, // C5
          { f: 523.25, d: 0.12, t: 0.12 }, // C5
          { f: 587.33, d: 0.24, t: 0.24 }, // D5
          { f: 523.25, d: 0.24, t: 0.48 }, // C5
          { f: 698.46, d: 0.24, t: 0.72 }, // F5
          { f: 659.25, d: 0.45, t: 0.96 }, // E5
        ];
        fanfare.forEach(({ f, d, t }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + t);

          gain.gain.setValueAtTime(0.15, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + t);
          osc.stop(now + t + d + 0.05);
        });
        break;
      }

      case 'day_end': {
        // Twilight soft bell chime
        const bell = ctx.createOscillator();
        const gain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(880, now);
        bell.frequency.exponentialRampToValueAtTime(440, now + 0.4);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        bell.connect(gain);
        gain.connect(ctx.destination);

        bell.start(now);
        bell.stop(now + 0.55);
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.warn('Audio playback error', e);
  }
};
