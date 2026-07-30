import { useCallback, useEffect, useState } from "react";

export default function useCountdown(defaultSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const start = useCallback(
    (seconds: number = defaultSeconds) => setSecondsLeft(seconds),
    [defaultSeconds],
  );

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return { secondsLeft, start };
}
