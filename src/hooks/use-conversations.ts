import { useState, useCallback, useEffect } from 'react';
import type { Conversation, ConversationSummary } from '~/shared/types';
import {
  getConversations,
  getConversation,
  createConversation as apiCreateConversation,
  deleteConversation as apiDeleteConversation,
} from '~/api/tauri';

export function useConversations() {
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSummaries = useCallback(async () => {
    try {
      const list = await getConversations();
      setSummaries(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  useEffect(() => {
    refreshSummaries();
  }, [refreshSummaries]);

  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setIsLoading(true);
    try {
      const conv = await getConversation(id);
      setActiveConversation(conv);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setActiveConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNew = useCallback(async (source: 'manual' | 'selection' = 'manual', selectedText?: string) => {
    try {
      const conv = await apiCreateConversation(source, selectedText);
      await refreshSummaries();
      setActiveId(conv.id);
      setActiveConversation(conv);
      return conv;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      return null;
    }
  }, [refreshSummaries]);

  const remove = useCallback(async (id: string) => {
    try {
      await apiDeleteConversation(id);
      if (activeId === id) {
        setActiveId(null);
        setActiveConversation(null);
      }
      await refreshSummaries();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  }, [activeId, refreshSummaries]);

  return {
    summaries,
    activeId,
    activeConversation,
    setActiveConversation,
    isLoading,
    selectConversation,
    createNew,
    remove,
    refreshSummaries,
  };
}
