import { useState, useCallback, useRef } from 'react';

export function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return initialValue;
  });

  // Mirror into a ref so functional updates can read the latest value without
  // re-creating the setter on every change.
  const stateRef = useRef(state);
  stateRef.current = state;

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(stateRef.current) : value;
    stateRef.current = valueToStore;
    setState(valueToStore);

    // Persist OFF the input-event critical path. The previous implementation
    // called localStorage.setItem synchronously inside the setState updater,
    // which forced the browser to also run the blocking write before it could
    // paint the next frame — destroying INP (~420ms keypress cost observed via
    // Vercel Speed Insights). A macrotask pushes the write past the paint, and
    // it is idempotent so rapid typists only ever keep the final value.
    try {
      const serialized = JSON.stringify(valueToStore);
      window.setTimeout(() => {
        try {
          window.localStorage.setItem(key, serialized);
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
      }, 0);
    } catch (error) {
      console.warn(`Error serializing localStorage key "${key}":`, error);
    }
  }, [key]);

  return [state, setValue];
}
