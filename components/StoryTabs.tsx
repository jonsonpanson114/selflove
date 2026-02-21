"use client";

import { useState, ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface StoryTabsProps {
  tabs: Tab[];
}

export default function StoryTabs({ tabs }: StoryTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "0",
          borderBottom: "1px solid var(--border)",
          marginBottom: "1.5rem",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.625rem 0",
              marginRight: "1.75rem",
              fontSize: "0.85rem",
              fontFamily: "inherit",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid var(--sage)"
                  : "2px solid transparent",
              color: activeTab === tab.id ? "var(--sage)" : "var(--ink)",
              opacity: activeTab === tab.id ? 1 : 0.45,
              cursor: "pointer",
              transition: "all 0.2s",
              fontWeight: activeTab === tab.id ? "500" : "400",
              letterSpacing: "0.02em",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          style={{ display: activeTab === tab.id ? "block" : "none" }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
