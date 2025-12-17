'use client';

import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  shouldPulse: boolean;
}

export function ChatButton({ onClick, shouldPulse }: ChatButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-glowSafe backdrop-blur-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
        boxShadow: shouldPulse
          ? [
              '0 0 20px -5px rgba(16, 185, 129, 0.4)',
              '0 0 40px 0px rgba(16, 185, 129, 0.6)',
              '0 0 20px -5px rgba(16, 185, 129, 0.4)',
            ]
          : '0 0 20px -5px rgba(16, 185, 129, 0.4)',
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        boxShadow: { duration: 2, repeat: shouldPulse ? Infinity : 0 },
      }}
      whileTap={{ scale: 0.95 }}
      aria-label="Open AI chat assistant"
    >
      <Fingerprint className="mx-auto h-6 w-6 text-white" />
    </motion.button>
  );
}
