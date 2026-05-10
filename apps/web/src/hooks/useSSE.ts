import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface SSEState {
  text: string;
  isDone: boolean;
  isError: boolean;
  discussionId: string | null;
}

export function useSSE(baseUrl: string | null) {
  const [state, setState] = useState<SSEState>({
    text: '',
    isDone: false,
    isError: false,
    discussionId: null,
  });

  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!baseUrl) return;

    const token = useAuthStore.getState().accessToken;
    const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;

    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('token', (e: MessageEvent) => {
      setState((prev) => ({ ...prev, text: prev.text + (e.data as string) }));
    });

    es.addEventListener('done', (e: MessageEvent) => {
      const discussionId = e.data as string;
      setState((prev) => ({ ...prev, isDone: true, discussionId }));
      es.close();
    });

    es.addEventListener('error', () => {
      setState((prev) => ({ ...prev, isError: true }));
      es.close();
    });

    es.onerror = () => {
      setState((prev) => ({ ...prev, isError: true }));
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [baseUrl]);

  return state;
}
