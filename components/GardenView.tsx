"use client";

import { useMemo, useState } from "react";
import { Chapter } from "@/hooks/useChapters";
import { motion, AnimatePresence } from "framer-motion";

interface GardenViewProps {
    chapters: Chapter[];
}

// mood: 1-5
const getPlantColor = (mood?: number) => {
    if (!mood) return "var(--sage)";
    if (mood <= 2) return "#5C768D"; // deep blue/gray
    if (mood === 3) return "var(--sage)"; // sage
    if (mood >= 4) return "var(--gold)"; // warm gold
    return "var(--sage)";
};

const getPlantSize = (textLength: number) => {
    const min = 15;
    const max = 45;
    const size = Math.min(max, Math.max(min, textLength / 5));
    return size;
};

export default function GardenView({ chapters }: GardenViewProps) {
    const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);

    // Weather calculation based on average mood of recent chapters
    const weather = useMemo(() => {
        if (chapters.length === 0) return "clear";
        const recent = chapters.slice(-3); // check last 3 chapters
        const avg = recent.reduce((sum, c) => sum + (c.mood || 3), 0) / recent.length;

        if (avg >= 4) return "sunny";
        if (avg <= 2.2) return "rainy";
        return "misty";
    }, [chapters]);

    const plants = useMemo(() => {
        return chapters.map((chapter, i) => {
            // Simple organic distribution
            const goldenRatio = 0.618033988749895;
            const r = Math.sqrt(i + 0.5) * 8; // radius
            const theta = i * goldenRatio * Math.PI * 2; // angle

            const x = 50 + r * Math.cos(theta);
            const y = 50 + r * Math.sin(theta) * 0.8; // slightly elliptical

            return {
                ...chapter,
                x: `${Math.max(10, Math.min(90, x))}%`,
                y: `${Math.max(10, Math.min(90, y))}%`,
                color: getPlantColor(chapter.mood),
                size: getPlantSize(chapter.userEntry.length),
                delay: i * 0.05,
            };
        });
    }, [chapters]);

    return (
        <div style={{ 
            position: "relative", 
            width: "100%", 
            height: "400px", 
            borderRadius: "12px", 
            background: weather === "rainy" ? "#1A202C" : weather === "misty" ? "#2D3748" : "var(--ink)", 
            overflow: "hidden",
            transition: "background 2s ease"
        }}>
            {/* Weather Layers */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
                {weather === "rainy" && (
                    <>
                        {[...Array(25)].map((_, i) => (
                            <div 
                                key={i} 
                                className="rain-drop" 
                                style={{ 
                                    left: `${Math.random() * 100}%`, 
                                    animationDelay: `${Math.random() * 1}s`,
                                    animationDuration: `${0.6 + Math.random() * 0.4}s`,
                                    opacity: 0.3 + Math.random() * 0.3
                                }} 
                            />
                        ))}
                    </>
                )}
                {weather === "misty" && <div className="mist-cloud" />}
                {weather === "sunny" && <div className="sun-overlay" />}
            </div>

            {/* Glow effects */}
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
                <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                </defs>
                {plants.map((p) => (
                    <motion.circle
                        key={`glow-${p.id}`}
                        cx={p.x}
                        cy={p.y}
                        r={p.size * 2}
                        fill="url(#glow)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        transition={{ duration: 2, delay: p.delay }}
                    />
                ))}
            </svg>

            {/* Plants / Seeds */}
            {plants.map((p) => (
                <motion.div
                    key={p.id}
                    style={{
                        position: "absolute",
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        borderRadius: "50%",
                        backgroundColor: p.color,
                        boxShadow: `0 0 ${p.size / 2}px ${p.color}`,
                        cursor: "pointer",
                        transform: "translate(-50%, -50%)"
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    whileHover={{ scale: 1.2, opacity: 1, zIndex: 10 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        delay: p.delay
                    }}
                    onMouseEnter={() => setHoveredChapter(p)}
                    onMouseLeave={() => setHoveredChapter(null)}
                    onClick={() => setHoveredChapter(p === hoveredChapter ? null : p)}
                />
            ))}

            {/* Hover Info */}
            <AnimatePresence>
                {hoveredChapter && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            left: "20px",
                            right: "20px",
                            padding: "1rem",
                            background: "rgba(253, 250, 244, 0.95)", // paper with opacity
                            borderRadius: "8px",
                            color: "var(--ink)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            backdropFilter: "blur(4px)",
                            pointerEvents: "none",
                            zIndex: 20
                        }}
                    >
                        <p style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: "0.3rem" }}>
                            {new Date(hoveredChapter.date).toLocaleDateString("ja-JP")} - 第{hoveredChapter.chapterNumber}章
                        </p>
                        <p className="line-clamp-2" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                            {hoveredChapter.userEntry}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


