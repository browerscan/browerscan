'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatButton } from './chat-button';
import { ChatWindow } from './chat-window';
import { useChat } from '@/lib/use-chat';

interface ChatWidgetProps {
  /** Optional scan ID for contextual chat */
  scanId?: string;
}

export function ChatWidget({ scanId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const chat = useChat({ scanId });

  // Start pulse animation after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShouldPulse(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setShouldPulse(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={chat.messages}
            isLoading={chat.isLoading}
            error={chat.error}
            onSendMessage={chat.sendMessage}
            onClose={handleClose}
            scanId={scanId}
          />
        )}
      </AnimatePresence>

      {!isOpen && (
        <ChatButton
          onClick={handleOpen}
          shouldPulse={shouldPulse}
        />
      )}
    </>
  );
}
