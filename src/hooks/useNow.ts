import { useEffect, useState } from 'react';

// Returns the current time, refreshing on the given interval (default 1s).
// Isolated from component render logic so the ticking clock is easy to move
// into leaf components when finer-grained rendering is needed.
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
