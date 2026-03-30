/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, Trophy, RefreshCw, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Types ---

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

type Point = { x: number; y: number };

const TRACKS = [
  {
    id: 1,
    title: "All The Stars",
    artist: "Kendrick Lamar, SZA",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#ff00ff"
  },
  {
    id: 2,
    title: "Cyber Pulse",
    artist: "GlitchBot",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#00ffff"
  },
  {
    id: 3,
    title: "Retro Future",
    artist: "WaveGen",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#ffff00"
  }
];

// --- Components ---

const SnakeGame = () => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setIsPaused(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood, highScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-between w-full max-w-[400px] px-6 py-4 bg-black/60 border-2 border-cyan-500/50 rounded-none backdrop-blur-md relative overflow-hidden group">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/2 w-full animate-pulse pointer-events-none" />
        
        <div className="flex flex-col items-start gap-1 relative z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-3 h-3 text-yellow-400 animate-pulse" />
            <span className="text-[10px] text-cyan-500/60 font-mono tracking-[0.2em] uppercase">CURRENT SCORE</span>
          </div>
          <span className="text-4xl font-digital font-black text-cyan-400 tracking-tighter glitch-text animate-glitch">
            {score.toString().padStart(3, '0')}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-purple-500/60 font-mono tracking-[0.2em] uppercase">PERSONAL BEST</span>
            <Gamepad2 className="w-3 h-3 text-purple-400 animate-pulse" />
          </div>
          <span className="text-4xl font-digital font-black text-purple-400 tracking-tighter glitch-text animate-glitch" style={{ animationDelay: '0.1s' }}>
            {highScore.toString().padStart(3, '0')}
          </span>
        </div>
      </div>

      <div 
        className="relative bg-black border-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] rounded-sm overflow-hidden"
        style={{ 
          width: GRID_SIZE * 20, 
          height: GRID_SIZE * 20,
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 pointer-events-none opacity-10">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-cyan-500" />
          ))}
        </div>

        {/* Snake */}
        {snake.map((segment, i) => (
          <motion.div
            key={`${segment.x}-${segment.y}-${i}`}
            initial={false}
            animate={{ x: segment.x * 20, y: segment.y * 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute w-5 h-5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-sm"
            style={{ 
              zIndex: 10,
              opacity: 1 - (i / snake.length) * 0.6
            }}
          />
        ))}

        {/* Food */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 10px rgba(236,72,153,0.5)",
              "0 0 20px rgba(236,72,153,0.8)",
              "0 0 10px rgba(236,72,153,0.5)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute w-5 h-5 bg-pink-500 rounded-full"
          style={{ 
            left: food.x * 20, 
            top: food.y * 20,
            zIndex: 5
          }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {(gameOver || isPaused) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              {gameOver ? (
                <>
                  <h2 className="text-4xl font-black text-pink-500 mb-4 tracking-tighter italic">GAME OVER</h2>
                  <button 
                    onClick={resetGame}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-full hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  >
                    <RefreshCw className="w-5 h-5" />
                    TRY AGAIN
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-black text-cyan-400 mb-4 tracking-tighter italic">PAUSED</h2>
                  <button 
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-400 transition-colors shadow-[0_0_15px_rgba(236,72,153,0.6)]"
                  >
                    <Play className="w-5 h-5" />
                    RESUME
                  </button>
                  <p className="mt-4 text-xs text-cyan-500/60 font-mono">USE ARROW KEYS TO MOVE</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const skipBackward = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
  }, [currentTrackIndex]);

  return (
    <div className="w-full max-w-[400px] p-6 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={skipForward}
      />
      
      <div className="flex items-center gap-4 mb-6">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg overflow-hidden relative group"
          style={{ backgroundColor: currentTrack.color + '20' }}
        >
          <Music className="w-8 h-8" style={{ color: currentTrack.color }} />
          {isPlaying && (
            <div className="absolute inset-0 flex items-end justify-center gap-1 pb-2">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1 bg-current"
                  style={{ color: currentTrack.color }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate tracking-tight">{currentTrack.title}</h3>
          <p className="text-white/50 text-sm truncate uppercase tracking-widest text-[10px] font-semibold">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-8">
          <button onClick={skipBackward} className="text-white/60 hover:text-white transition-colors">
            <SkipBack className="w-6 h-6" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
          </button>
          <button onClick={skipForward} className="text-white/60 hover:text-white transition-colors">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-2">
          <Volume2 className="w-4 h-4 text-white/40" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500 selection:text-black overflow-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen gap-12">
        <header className="text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-cyan-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">NEON</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-pink-600 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">SNAKE</span>
          </motion.h1>
          <p className="mt-4 text-white/40 font-mono text-xs tracking-[0.3em] uppercase">Synthwave Arcade Experience</p>
        </header>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-6xl">
          <div className="order-2 lg:order-1 flex-1 flex justify-center">
             <MusicPlayer />
          </div>
          
          <div className="order-1 lg:order-2 flex-[1.5] flex justify-center">
            <SnakeGame />
          </div>

          <div className="order-3 hidden lg:flex flex-1 flex-col gap-4 text-white/40 font-mono text-[10px] uppercase tracking-widest">
            <div className="p-4 border border-white/5 rounded-xl bg-white/5">
              <h4 className="text-white/60 mb-2 font-bold">Controls</h4>
              <ul className="space-y-1">
                <li>Arrow Keys: Move</li>
                <li>Space: Pause/Play</li>
              </ul>
            </div>
            <div className="p-4 border border-white/5 rounded-xl bg-white/5">
              <h4 className="text-white/60 mb-2 font-bold">Objective</h4>
              <p>Eat the pink nodes to grow and increase your score. Avoid hitting yourself.</p>
            </div>
          </div>
        </div>

        <footer className="mt-auto pt-12 text-white/20 text-[10px] font-mono tracking-widest uppercase flex flex-col items-center gap-2">
          <div className="h-px w-24 bg-white/10 mb-2" />
          <p>© 2026 NEON SYNTH ARCADE</p>
          <p>EST. IN THE GRID</p>
        </footer>
      </main>
    </div>
  );
}
