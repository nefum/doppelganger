import { useEffect, useRef } from "react";

function useDebouncedFunction<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): T {
  const funcRef = useRef(func);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isOnTimeoutRef = useRef(false);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  return useRef<T>(((...args: Parameters<T>) => {
    if (isOnTimeoutRef.current) {
      return; // Ignore the call if the function is on timeout
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    isOnTimeoutRef.current = true;
    timeoutRef.current = setTimeout(() => {
      funcRef.current(...args);
      isOnTimeoutRef.current = false;
    }, delay);
  }) as T).current;
}

export default useDebouncedFunction;
