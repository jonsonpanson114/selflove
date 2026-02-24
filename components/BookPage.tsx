import { ReactNode } from "react";

interface BookPageProps {
  children: ReactNode;
  className?: string;
  isPulsing?: boolean;
}

export default function BookPage({ children, className = "", isPulsing = false }: BookPageProps) {
  return (
    <div
      style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}
      className={`${className} ${isPulsing ? "bg-pulse" : ""}`}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          // Side padding also respects safe area (landscape notch)
          padding: "2rem max(1.25rem, env(safe-area-inset-right, 0px)) 0 max(1.25rem, env(safe-area-inset-left, 0px))",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--paper)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            // Bottom padding accounts for home indicator
            padding: "2rem 1.75rem calc(2rem + env(safe-area-inset-bottom, 0px))",
            boxShadow: "0 2px 16px rgba(61, 51, 40, 0.06)",
            marginBottom: "2rem",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
