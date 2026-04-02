"use client";

import BookPage from "@/components/BookPage";
import GardenView from "@/components/GardenView";
import { useChapters } from "@/hooks/useChapters";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GardenPage() {
    const { chapters, loaded } = useChapters();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <BookPage>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.75rem",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "1.25rem",
                }}
            >
                <Link
                    href="/"
                    style={{
                        fontSize: "0.78rem",
                        color: "var(--ink)",
                        opacity: 0.4,
                        textDecoration: "none",
                        letterSpacing: "0.03em",
                    }}
                >
                    ← 戻る
                </Link>
                <p
                    className="serif"
                    style={{
                        fontSize: "0.9rem",
                        color: "var(--ink)",
                        opacity: 0.65,
                        letterSpacing: "0.05em",
                    }}
                >
                    心の庭
                </p>
                <div style={{ width: "40px" }} /> {/* Spacer */}
            </div>

            <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--ink)", opacity: 0.6, lineHeight: 1.6 }}>
                    あなたが紡いできた言葉の種は、ここで静かに芽吹いています。
                </p>
            </div>

            {mounted && loaded ? (
                chapters.length > 0 ? (
                    <>
                        <GardenView chapters={chapters} />
                        
                        {/* Relics Collection */}
                        <div style={{ marginTop: "3rem" }}>
                            <p className="serif" style={{ fontSize: "0.9rem", color: "var(--gold)", opacity: 0.8, marginBottom: "1.2rem", textAlign: "center", letterSpacing: "0.1em" }}>
                                拾い集めた遺物
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
                                {chapters.filter(c => c.relic).map((c, i) => (
                                    <div 
                                        key={c.id} 
                                        style={{ 
                                            padding: "1rem", 
                                            background: "white", 
                                            borderRadius: "8px", 
                                            border: "1px solid var(--border)",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                            textAlign: "center"
                                        }}
                                    >
                                        <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>🏺</p>
                                        <p style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--ink)", marginBottom: "0.3rem" }}>
                                            {c.relic}
                                        </p>
                                        <p style={{ fontSize: "0.65rem", color: "var(--ink)", opacity: 0.5, lineHeight: 1.4 }}>
                                            {c.relicDescription}
                                        </p>
                                    </div>
                                ))}
                                {chapters.filter(c => c.relic).length === 0 && (
                                    <div style={{ gridColumn: "1 / -1", padding: "1.5rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "8px" }}>
                                        <p style={{ fontSize: "0.75rem", color: "var(--ink)", opacity: 0.35 }}>
                                            物語の中で見つかる「なにか」がここに集まります。
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: "3rem 0", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "12px", background: "var(--paper)" }}>
                        <p style={{ fontSize: "0.9rem", color: "var(--ink)", opacity: 0.5, lineHeight: 1.8 }}>
                            まだ種は蒔かれていないようです。<br />
                            最初のページを書きとめると、ここに小さな命が宿ります。
                        </p>
                    </div>
                )
            ) : (
                <div style={{ height: "400px", background: "var(--sage-light)", borderRadius: "12px", opacity: 0.3 }} />
            )}

            <div
                style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "1.25rem",
                    marginTop: "2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Link
                    href="/chapters"
                    style={{
                        fontSize: "0.78rem",
                        color: "var(--ink)",
                        opacity: 0.35,
                        textDecoration: "none",
                        letterSpacing: "0.03em",
                    }}
                >
                    過去の章を見る
                </Link>
                <Link
                    href="/"
                    style={{
                        fontSize: "0.78rem",
                        color: "var(--sage)",
                        opacity: 0.7,
                        textDecoration: "none",
                        letterSpacing: "0.03em",
                    }}
                >
                    ホームへ戻る →
                </Link>
            </div>
        </BookPage>
    );
}


