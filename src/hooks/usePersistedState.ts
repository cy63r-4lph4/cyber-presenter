import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Like useState, but the value is mirrored to sessionStorage so it survives
 * a page refresh within the same tab. Clears automatically when the tab closes.
 *
 * @param key     - sessionStorage key (use a namespaced string, e.g. "remote:activePanel")
 * @param initial - fallback value when nothing is stored yet
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setStateRaw] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Keep a ref so the write effect always has the latest value
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage quota exceeded or unavailable — silently skip
    }
  }, [key, state]);

  const setState = useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (action) => {
      setStateRaw((prev) => {
        const next =
          typeof action === "function"
            ? (action as (prev: T) => T)(prev)
            : action;
        return next;
      });
    },
    [],
  );

  return [state, setState];
}
