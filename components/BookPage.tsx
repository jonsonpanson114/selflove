import { ReactNode } from "react";

interface BookPageProps {
  children: ReactNode;
  className?: string;
}

export default function BookPage({ children, className = "" }: BookPageProps) {
  return (
    <div
      style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}
      className={className}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div
          style={{
            backgroundColor: "var(--paper)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "2rem 1.75rem",
            boxShadow: "0 2px 16px rgba(61, 51, 40, 0.06)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
