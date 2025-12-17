'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { ChatMessage } from './chat-message';
import type { ChatMessage as ChatMessageType } from '@browserscan/types';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: Error | null;
  onSendMessage: (message: string) => Promise<void>;
  onClose: () => void;
  scanId?: string;
}

const QUICK_START_QUESTIONS = [
  'Analyze my browser fingerprint',
  'How unique is my fingerprint?',
  'What are the biggest privacy risks?',
  'How can I improve my privacy?',
];

export function ChatWindow({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClose,
  scanId,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  const handleQuickQuestion = (question: string) => {
    onSendMessage(question);
  };

  const showQuickStart = messages.length === 0 && !isLoading;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="font-semibold text-zinc-100">AI Assistant</h3>
            <p className="text-xs text-zinc-400">
              {scanId ? 'Analyzing your fingerprint' : 'Ask me anything'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showQuickStart && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">Get started with a question:</p>
            {QUICK_START_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => handleQuickQuestion(question)}
                className="block w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="flex gap-1">
              <motion.div
                className="h-2 w-2 rounded-full bg-emerald-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-emerald-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-emerald-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <span>Thinking...</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your fingerprint..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            disabled={isLoading}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-emerald-500 p-2 text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
