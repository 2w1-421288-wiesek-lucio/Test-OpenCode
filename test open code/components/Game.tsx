"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Clouds from "./Clouds";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 40;
const GRAVITY = 0.6;
const FLAP_STRENGTH = -9;
const PIPE_SPEED = 4;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const PIPE_SPAWN_RATE = 1800;
const GROUND_HEIGHT = 80;

interface Pipe {
  id: number;
  x: number;
  gapY: number;
}

type GameState = "countdown" | "playing" | "gameOver";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playFlapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.05);
  oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.12);
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("countdown");
  const [countdown, setCountdown] = useState(3);
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2 - BIRD_SIZE / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);

  const gameLoopRef = useRef<number | null>(null);
  const birdYRef = useRef(birdY);
  const birdVelocityRef = useRef(birdVelocity);
  const pipesRef = useRef(pipes);
  const pipeIdRef = useRef(0);
  const lastPipeSpawnRef = useRef(0);
  const gameStateRef = useRef(gameState);
  const scoredIdsRef = useRef<Set<number>>(new Set());
  const scoreRef = useRef(0);

  birdYRef.current = birdY;
  birdVelocityRef.current = birdVelocity;
  pipesRef.current = pipes;
  gameStateRef.current = gameState;
  scoreRef.current = score;

  const flap = useCallback(() => {
    if (gameStateRef.current === "playing") {
      setBirdVelocity(FLAP_STRENGTH);
      playFlapSound();
    }
  }, []);

  const checkCollision = useCallback(
    (birdYPos: number, currentPipes: Pipe[]): boolean => {
      const birdLeft = 100;
      const birdRight = birdLeft + BIRD_SIZE;
      const birdTop = birdYPos;
      const birdBottom = birdYPos + BIRD_SIZE;

      if (birdBottom >= GAME_HEIGHT - GROUND_HEIGHT || birdTop <= 0) {
        return true;
      }

      for (const pipe of currentPipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          const topPipeBottom = pipe.gapY;
          const bottomPipeTop = pipe.gapY + PIPE_GAP;

          if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
            return true;
          }
        }
      }

      return false;
    },
    []
  );

  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== "playing") return;

    const newVelocity = birdVelocityRef.current + GRAVITY;
    const newY = birdYRef.current + newVelocity;

    setBirdVelocity(newVelocity);
    setBirdY(newY);

    const now = Date.now();
    const shouldSpawn = now - lastPipeSpawnRef.current > PIPE_SPAWN_RATE;

    if (shouldSpawn) {
      lastPipeSpawnRef.current = now;
      pipeIdRef.current += 1;
    }

    setPipes((prev) => {
      let result: Pipe[] = [];

      for (const p of prev) {
        const moved = { ...p, x: p.x - PIPE_SPEED };
        if (moved.x + PIPE_WIDTH > 0) {
          result.push(moved);
        }
      }

      if (shouldSpawn) {
        const gapY =
          Math.floor(Math.random() * (GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 150)) + 75;
        result.push({ id: pipeIdRef.current, x: GAME_WIDTH, gapY });
      }

      return result;
    });

    let scoreIncrement = 0;
    for (const pipe of pipesRef.current) {
      if (
        !scoredIdsRef.current.has(pipe.id) &&
        pipe.x + PIPE_WIDTH < 100
      ) {
        scoredIdsRef.current.add(pipe.id);
        scoreIncrement += 1;
      }
    }

    if (scoreIncrement > 0) {
      setScore((s) => s + scoreIncrement);
    }

    if (checkCollision(newY, pipesRef.current)) {
      setGameState("gameOver");
      return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [checkCollision]);

  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (gameState === "countdown" && countdown === 0) {
      lastPipeSpawnRef.current = Date.now();
      setGameState("playing");
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flap]);

  const restartGame = () => {
    setBirdY(GAME_HEIGHT / 2 - BIRD_SIZE / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setCountdown(3);
    pipeIdRef.current = 0;
    lastPipeSpawnRef.current = 0;
    scoredIdsRef.current = new Set();
    setGameState("countdown");
  };

  const birdRotation = Math.min(
    Math.max(birdVelocity * 3, -30),
    90
  );

  return (
    <div
      className="game-container"
      onClick={flap}
      style={{ position: "relative" }}
    >
      <Clouds />

      <div
        className="bird"
        style={{
          left: "100px",
          top: `${birdY}px`,
          transform: `rotate(${birdRotation}deg)`,
        }}
      >
        <img src="/bird.png" alt="bird" draggable={false} style={{ width: "50px", height: "40px" }} />
      </div>

      {pipes.map((pipe) => (
        <div key={pipe.id}>
          <div
            className="pipe"
            style={{
              left: `${pipe.x}px`,
              top: 0,
              height: `${pipe.gapY}px`,
            }}
          />
          <div
            className="pipe-cap"
            style={{
              left: `${pipe.x - 5}px`,
              top: `${pipe.gapY - 30}px`,
            }}
          />
          <div
            className="pipe"
            style={{
              left: `${pipe.x}px`,
              top: `${pipe.gapY + PIPE_GAP}px`,
              height: `${GAME_HEIGHT - GROUND_HEIGHT - pipe.gapY - PIPE_GAP}px`,
            }}
          />
          <div
            className="pipe-cap"
            style={{
              left: `${pipe.x - 5}px`,
              top: `${pipe.gapY + PIPE_GAP}px`,
            }}
          />
        </div>
      ))}

      <div className="ground" />

      <div className="score-display">{score}</div>

      {gameState === "countdown" && (
        <div className="countdown" key={countdown}>
          {countdown > 0 ? countdown : "¡GO!"}
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="game-over-overlay">
          <div className="game-over-title">Game Over</div>
          <div className="game-over-score">Puntuación: {score}</div>
          <button
            className="retry-button"
            onClick={(e) => {
              e.stopPropagation();
              restartGame();
            }}
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
