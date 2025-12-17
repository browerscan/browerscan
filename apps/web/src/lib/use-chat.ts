'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ChatMessage, ChatResponse } from '@browserscan/types';

interface UseChatOptions {
  /** Optional scan ID for context */
  scanId?: string;
  /** Maximum messages to keep in history */
  maxHistory?: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Hook for managing AI chat state and API calls
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { scanId, maxHistory = 20 } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          message,
          history: messages.slice(-maxHistory), // Only send recent history
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(error.error?.message || 'Failed to send message');
      }

      const data: ChatResponse = await response.json();

      if (data.status === 'error') {
        throw new Error(data.error?.message || 'AI service error');
      }

      return data.data?.response || 'No response received';
    },
    onSuccess: (aiResponse, userMessage) => {
      const now = Date.now();

      // Add both user message and AI response
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: userMessage,
          timestamp: now,
        },
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: now + 1, // Slight offset for ordering
        },
      ]);
    },
  });

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    await chatMutation.mutateAsync(message);
  }, [chatMutation]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading: chatMutation.isPending,
    error: chatMutation.error,
    sendMessage,
    clearMessages,
  };
}
