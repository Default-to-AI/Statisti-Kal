import { useCallback, useMemo } from 'react';
import { useLocalStorageState } from './useLocalStorageState';

export type NumericParser = 'float' | 'int';

export interface UseNumericFieldOptions {
  /** localStorage key for persisting the input string. */
  inputKey: string;
  /** localStorage key for persisting the numeric value. */
  valueKey: string;
  /** Initial numeric value. */
  initialValue: number;
  /** Whether to parse as float or int. Default 'float'. */
  parser?: NumericParser;
  /** Optional validation function. Receives the parsed numeric value (or null if empty/invalid) and the raw input string. */
  validate?: (value: number | null, input: string) => string | undefined;
}

export interface UseNumericFieldResult {
  /** Raw input string (for binding to <input>). */
  input: string;
  /** Setter for the raw input string. */
  setInput: (value: string) => void;
  /** Parsed numeric value, or null if empty/invalid. */
  value: number | null;
  /** Validation error message, if any. */
  error: string | undefined;
  /** Set a numeric value directly (updates both numeric and input states). */
  setValue: (value: number) => void;
  /** Reset to the initial value. */
  reset: () => void;
}

function parseNumeric(input: string, parser: NumericParser): number | null {
  if (input.trim() === '') return null;
  const parsed = parser === 'int' ? parseInt(input, 10) : parseFloat(input);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Manages a numeric input field with localStorage persistence.
 * Keeps a string input for the UI and a parsed numeric value for calculations.
 */
export function useNumericField(options: UseNumericFieldOptions): UseNumericFieldResult {
  const { inputKey, valueKey, initialValue, parser = 'float', validate } = options;

  const [input, setInput] = useLocalStorageState<string>(inputKey, initialValue.toString());
  const [value, setNumericValue] = useLocalStorageState<number>(valueKey, initialValue);

  const parsedValue = useMemo(() => parseNumeric(input, parser), [input, parser]);

  const error = useMemo(() => {
    if (validate) {
      return validate(parsedValue, input);
    }
    return undefined;
  }, [parsedValue, input, validate]);

  const setInputValue = useCallback(
    (newInput: string) => {
      setInput(newInput);
      const parsed = parseNumeric(newInput, parser);
      if (parsed !== null) {
        setNumericValue(parsed);
      }
    },
    [parser, setInput, setNumericValue]
  );

  const setValue = useCallback(
    (newValue: number) => {
      setNumericValue(newValue);
      setInput(newValue.toString());
    },
    [setInput, setNumericValue]
  );

  const reset = useCallback(() => {
    setNumericValue(initialValue);
    setInput(initialValue.toString());
  }, [initialValue, setInput, setNumericValue]);

  return {
    input,
    setInput: setInputValue,
    value: parsedValue,
    error,
    setValue,
    reset,
  };
}
