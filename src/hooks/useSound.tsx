import { useCallback, useRef } from 'react';

// Web Audio API based sound generator for button clicks
const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Generates a pleasant, soft click sound
  const playClick = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Pleasant bell-like tone
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.02); // E6
      oscillator.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.04); // A6
      
      oscillator.type = 'sine';
      
      // Soft envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Silently fail if audio isn't available
      console.debug('Audio not available');
    }
  }, [getAudioContext]);

  // Success sound - higher pitched, ascending
  const playSuccess = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      // First note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.1, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      
      // Second note
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.25);
      
      // Third note
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0.1, ctx.currentTime + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc3.start(ctx.currentTime + 0.2);
      osc3.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.debug('Audio not available');
    }
  }, [getAudioContext]);

  // Notification sound - gentle chime
  const playNotification = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      oscillator.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.1); // E6
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.debug('Audio not available');
    }
  }, [getAudioContext]);

  return { playClick, playSuccess, playNotification };
};

export default useSound;
