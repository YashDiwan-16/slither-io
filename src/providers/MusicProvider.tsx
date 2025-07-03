import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

interface MusicContextType {
  playing: boolean;
  toggle: () => void;
  setVolume: (v: number) => void;
  volume: number;
}

export const MusicContext = createContext<MusicContextType>({
  playing: false,
  toggle: () => {},
  setVolume: () => {},
  volume: 1,
});

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  // Pause music on page hide
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && audioRef.current) {
        audioRef.current.pause();
      } else if (!document.hidden && playing && audioRef.current) {
        audioRef.current.play();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [playing]);

  return (
    <MusicContext.Provider value={{ playing, toggle: () => setPlaying(p => !p), setVolume, volume }}>
      <audio
        ref={audioRef}
        src={import.meta.env.BASE_URL + 'assets/bg-sound.mp3'}
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
      {children}
    </MusicContext.Provider>
  );
}; 