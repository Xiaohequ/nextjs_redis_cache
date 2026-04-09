// hooks/useStats.ts
import { useEffect, useState } from 'react';

export function useStats(interval = 3000) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = () =>
      fetch('/api/stats').then(r => r.json()).then(setStats);

    fetchStats();
    const id = setInterval(fetchStats, interval);
    return () => clearInterval(id);
  }, [interval]);

  return stats;
}