import { useState, useCallback, useRef, useEffect } from 'react';
import { streamChat, abortChat, addConversationMessage, updateConversationTitle, chat as apiChat } from '~/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { TAURI_EVENTS, type ChatMessage, type StreamChunk } from '~/shared/events';

interface UseChatOptions {
  conversationId?: string;
  providerId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  initialMessages?: ChatMessage[];
  onTitleGenerated?: (title: string) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    conversationId,
    providerId = 'openai',
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 4096,
    initialMessages = [],
    onTitleGenerated,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamIdRef = useRef<string | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);
  const titleGeneratedRef = useRef(false);

  // Sync messages when conversationId changes
  useEffect(() => {
    setMessages(initialMessages);
    titleGeneratedRef.current = false;
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const generateTitle = useCallback(async (convId: string, userMessage: string) => {
    if (titleGeneratedRef.current) return;
    titleGeneratedRef.current = true;

    try {
      const titleResponse = await apiChat({
        providerId,
        model,
        messages: [
          {
            role: 'system',
            content: 'Generate a short title (max 30 characters) for a conversation that starts with the following user message. Reply with ONLY the title, no quotes or extra text.',
          },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        maxTokens: 50,
      });

      const title = titleResponse.content.trim().replace(/^["']|["']$/g, '').slice(0, 50);
      if (title) {
        await updateConversationTitle(convId, title);
        onTitleGenerated?.(title);
      }
    } catch (err) {
      console.error('Failed to generate title:', err);
    }
  }, [providerId, model, onTitleGenerated]);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = { role: 'user', content };
      const isFirstUserMessage = messages.length === 0;

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Persist user message to backend
      if (conversationId) {
        try {
          await addConversationMessage(conversationId, 'user', content);
        } catch (err) {
          console.error('Failed to save user message:', err);
        }
      }

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
          async (event) => {
            const chunk = event.payload;
            if (chunk.finishReason) {
              setIsLoading(false);
              streamIdRef.current = null;
              if (unlistenRef.current === unlisten) {
                unlistenRef.current = null;
              }
              unlisten();

              // Persist assistant message and generate title
              if (conversationId) {
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant' && last.content) {
                    addConversationMessage(conversationId, 'assistant', last.content).catch(console.error);

                    // Auto-generate title after first AI reply
                    if (isFirstUserMessage) {
                      generateTitle(conversationId, content);
                    }
                  }
                  return prev;
                });
              }
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
    [messages, conversationId, providerId, model, temperature, maxTokens, generateTitle]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    titleGeneratedRef.current = false;
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    setMessages,
  };
}
