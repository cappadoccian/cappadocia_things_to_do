// Web Audio Sound Synthesizer & Notification Service

class NotificationService {
  constructor() {
    this.audioCtx = null;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a chime sound
  playChime(type = 'success') {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'success') {
        // Melodic 2-tone chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'favorite') {
        // Soft pop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'alarm') {
        // 3 beep alarm
        for (let i = 0; i < 3; i++) {
          const beeper = this.audioCtx.createOscillator();
          const beeperGain = this.audioCtx.createGain();
          beeper.connect(beeperGain);
          beeperGain.connect(this.audioCtx.destination);

          beeper.type = 'sine';
          beeper.frequency.setValueAtTime(784, now + i * 0.15); // G5
          beeperGain.gain.setValueAtTime(0.3, now + i * 0.15);
          beeperGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.1);

          beeper.start(now + i * 0.15);
          beeper.stop(now + i * 0.15 + 0.1);
        }
      }
    } catch {
      // Ignore audio failure
    }
  }

  // Trigger browser notification if supported and allowed
  async sendBrowserNotification(title, options = {}) {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/images/balloons.jpg',
        badge: '/images/balloons.jpg',
        ...options
      });
      this.playChime('alarm');
      return true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          icon: '/images/balloons.jpg',
          ...options
        });
        this.playChime('alarm');
        return true;
      }
    }
    return false;
  }

  // Trigger device vibration if available
  vibrate(pattern = [50]) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
}

export const notificationService = new NotificationService();
