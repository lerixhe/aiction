import { useState, useCallback, useRef } from 'react';
import { streamChat, abortChat } from '~/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { TAURI_EVENTS, type ChatMessage, type StreamChunk } from '~/shared/events';

interface UseChatOptions {
  providerId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  initialMessages?: ChatMessage[];
}

export function useChat(options: UseChatOptions = {}) {
  const {
    providerId = 'openai',
    model = 'gpt-4',
    temperature = 0.7,
    maxTokens = 4096,
    initialMessages = [],
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamIdRef = useRef<string | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);

  const stopStreaming = useCallback(async () => {
    if (streamIdRef.current) {
      try {
        await abortChat(streamIdRef.current);
      } catch {
        // Stream may have already ended
      }
      streamIdRef.current = null;
    }
    if (unlistenRef.current) {
      unlistenRef.current();
      unlistenRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = { role: 'user', content };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        const currentMessages = [...messages, userMessage];
        const response = await streamChat({
          providerId,
          model,
          messages: currentMessages,
          temperature,
          maxTokens,
        });

        streamIdRef.current = response.streamId;

        const unlisten = await listen<StreamChunk>(
          `${TAURI_EVENTS.CHAT_STREAM_PREFIX}${response.streamId}`,
          (event) => {
            const chunk = event.payload;
            if (chunk.finishReason) {
              setIsLoading(false);
              streamIdRef.current = null;
              if (unlistenRef.current === unlisten) {
                unlistenRef.current = null;
              }
              unlisten();
              return;
            }

            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + chunk.delta },
                ];
              }
              return prev;
            });
          }
        );

        unlistenRef.current = unlisten;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setIsLoading(false);

        if (unlistenRef.current) {
          unlistenRef.current();
          unlistenRef.current = null;
        }

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.content === '') {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    },
    [messages, providerId, model, temperature, maxTokens]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
