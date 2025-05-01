import { useRef, useEffect } from 'react';

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Correct path - files in public are served from root
    audioRef.current = new Audio('/sounds/new_message_notification.mp3');
    
    // Pre-load the audio
    audioRef.current.load();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = () => {
    console.log('Playing notification sound...');
    
    if (audioRef.current) {
      // Reset to beginning if already playing
      audioRef.current.currentTime = 0;
      
      // Play with error handling
      audioRef.current.play().catch(error => {
        console.error('Failed to play notification sound:', error);
      });
    } else {
      console.warn('Audio element not initialized');
    }
  };

  return playNotificationSound;
}