'use client';

import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@browserscan/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-sky-500/20' : 'bg-emerald-500/20'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-sky-400" />
        ) : (
          <Bot className="h-4 w-4 text-emerald-400" />
        )}
      </div>

      <div
        className={`flex-1 rounded-lg px-4 py-3 text-sm ${
          isUser
            ? 'bg-sky-500/10 text-zinc-100'
            : 'bg-white/5 text-zinc-200'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}
