import { useEffect, useState } from 'react';

/** 타이핑이 멎을 때까지 기다렸다가 값을 흘려보낸다 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
