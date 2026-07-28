import { useEffect, useState } from "react";

export default function useDebounce<Type>(
  inputText: Type,
  searchDelayInMillisecond = 400,
): Type {
  const [debouncedValue, setDebouncedValue] = useState<Type>(inputText);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputText);
    }, searchDelayInMillisecond);

    return () => clearTimeout(timer);
  }, [inputText, searchDelayInMillisecond]);

  return debouncedValue;
}
