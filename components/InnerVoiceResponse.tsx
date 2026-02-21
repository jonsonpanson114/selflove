"use client";

import { motion, AnimatePresence } from "framer-motion";

interface InnerVoiceResponseProps {
  text: string;
  isLoading: boolean;
  label?: string;
  isStory?: boolean;
}

export default function InnerVoiceResponse({
  text,
  isLoading,
  label,
  isStory = false,
}: InnerVoiceResponseProps) {
  return (
    <div>
      {label && (
        <p
          style={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--gold)",
            marginBottom: "0.875rem",
            fontFamily: "inherit",
            opacity: 0.85,
          }}
        >
          {label}
        </p>
      )}

      {isLoading && !text && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--ink)",
            opacity: 0.35,
            fontStyle: "italic",
            fontFamily: "Noto Serif JP, Georgia, serif",
          }}
        >
          …
        </p>
      )}

      <AnimatePresence>
        {text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {isStory ? (
              <div
                style={{
                  fontFamily: "Noto Serif JP, Georgia, serif",
                  fontSize: "0.95rem",
                  lineHeight: "2.1",
                  color: "var(--ink)",
                  whiteSpace: "pre-wrap",
                  letterSpacing: "0.03em",
                  maxHeight: "65vh",
                  overflowY: "auto",
                  paddingRight: "0.5rem",
                }}
              >
                {text}
              </div>
            ) : (
              <p
                style={{
                  fontFamily: "Noto Serif JP, Georgia, serif",
                  fontSize: "0.9rem",
                  lineHeight: "2.0",
                  color: "var(--sage)",
                  whiteSpace: "pre-wrap",
                  letterSpacing: "0.03em",
                }}
              >
                {text}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
