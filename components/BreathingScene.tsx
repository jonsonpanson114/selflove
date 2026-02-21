"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BreathingScene as SceneType } from "@/lib/breathingScenes";

const PHASES = [
  { key: "inhale" as const, label: "吸って", duration: 4, scale: 1.35 },
  { key: "hold" as const, label: "止めて", duration: 4, scale: 1.35 },
  { key: "exhale" as const, label: "吐いて", duration: 4, scale: 0.65 },
  { key: "holdAfter" as const, label: "待って", duration: 4, scale: 0.65 },
] as const;

type PhaseKey = (typeof PHASES)[number]["key"];

interface BreathingSceneProps {
  scene: SceneType;
}

export default function BreathingScene({ scene }: BreathingSceneProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(PHASES[0].duration);
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_CYCLES = 4;

  const currentPhase = PHASES[phaseIndex];
  const narrativeText = scene.phases[currentPhase.key];

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setPhaseIndex((pi) => {
            const next = (pi + 1) % PHASES.length;
            if (next === 0) {
              const newCycle = cycleCount + 1;
              setCycleCount(newCycle);
              if (newCycle >= MAX_CYCLES) {
                setIsRunning(false);
                setIsDone(true);
                if (timerRef.current) clearInterval(timerRef.current);
              }
            }
            setTimeLeft(PHASES[(pi + 1) % PHASES.length].duration);
            return next;
          });
          return PHASES[(phaseIndex + 1) % PHASES.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phaseIndex, cycleCount]);

  const handleStart = () => {
    setIsRunning(true);
    setIsDone(false);
    setPhaseIndex(0);
    setCycleCount(0);
    setTimeLeft(PHASES[0].duration);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* Scene setting */}
      <p
        style={{
          fontFamily: "Noto Serif JP, Georgia, serif",
          fontSize: "0.9rem",
          lineHeight: "2.0",
          color: "var(--ink)",
          opacity: 0.75,
          marginBottom: "2rem",
          letterSpacing: "0.03em",
        }}
      >
        {scene.setting}
      </p>

      {/* Breathing circle */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <motion.div
          animate={{
            scale: isRunning ? currentPhase.scale : 1,
          }}
          transition={{
            duration: isRunning ? currentPhase.duration : 0.5,
            ease: currentPhase.key === "inhale" ? "easeIn" : currentPhase.key === "exhale" ? "easeOut" : "linear",
          }}
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: "2px solid var(--sage)",
            backgroundColor: "rgba(74, 103, 65, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
          }}
        >
          <motion.div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(74, 103, 65, 0.18)",
            }}
          />
        </motion.div>

        {/* Phase label and timer */}
        {isRunning && (
          <div>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--sage)",
                fontFamily: "Noto Serif JP, Georgia, serif",
                letterSpacing: "0.1em",
                marginBottom: "0.25rem",
              }}
            >
              {currentPhase.label}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--ink)",
                opacity: 0.35,
              }}
            >
              {timeLeft}
            </p>
          </div>
        )}

        {!isRunning && !isDone && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--ink)",
              opacity: 0.4,
              fontFamily: "Noto Serif JP, Georgia, serif",
            }}
          >
            準備ができたら始めましょう
          </p>
        )}
      </div>

      {/* Narrative text */}
      <AnimatePresence mode="wait">
        {isRunning && (
          <motion.p
            key={currentPhase.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "Noto Serif JP, Georgia, serif",
              fontSize: "0.875rem",
              lineHeight: "1.9",
              color: "var(--ink)",
              opacity: 0.7,
              marginBottom: "1.5rem",
              letterSpacing: "0.03em",
              minHeight: "4em",
            }}
          >
            {narrativeText}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Closing message */}
      {isDone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            fontFamily: "Noto Serif JP, Georgia, serif",
            fontSize: "0.9rem",
            lineHeight: "2.0",
            color: "var(--sage)",
            marginBottom: "1.5rem",
            letterSpacing: "0.03em",
          }}
        >
          {scene.closing}
        </motion.p>
      )}

      {/* Cycle progress */}
      {(isRunning || isDone) && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {Array.from({ length: MAX_CYCLES }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  i < cycleCount ? "var(--sage)" : "var(--border)",
                transition: "background-color 0.3s",
              }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
        {!isRunning && !isDone && (
          <button
            onClick={handleStart}
            style={{
              padding: "0.625rem 1.75rem",
              backgroundColor: "var(--sage)",
              color: "var(--paper)",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.05em",
            }}
          >
            始める
          </button>
        )}
        {isRunning && (
          <button
            onClick={handleStop}
            style={{
              padding: "0.625rem 1.75rem",
              backgroundColor: "transparent",
              color: "var(--ink)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontSize: "0.875rem",
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: 0.7,
            }}
          >
            止める
          </button>
        )}
        {isDone && (
          <button
            onClick={handleStart}
            style={{
              padding: "0.625rem 1.75rem",
              backgroundColor: "transparent",
              color: "var(--sage)",
              border: "1px solid var(--sage)",
              borderRadius: "6px",
              fontSize: "0.875rem",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            もう一度
          </button>
        )}
      </div>
    </div>
  );
}
