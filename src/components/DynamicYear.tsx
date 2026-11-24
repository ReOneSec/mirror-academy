'use client';

import { useEffect, useState } from 'react';

/**
 * Dynamically displays the current calendar year.
 * Initial static fallback is 2026 for prerender, and useEffect dynamically computes
 * new Date().getFullYear() on the client during every visit, so it automatically transitions
 * to 2027, 2028, etc. without needing any code changes or redeployments.
 */
export default function DynamicYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span>{year ?? 2026}</span>;
}
