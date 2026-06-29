import '@testing-library/jest-dom/vitest';
import { TextEncoder, TextDecoder } from 'util';

// jsdom polyfills
(globalThis as Record<string, unknown>).TextEncoder = TextEncoder;
(globalThis as Record<string, unknown>).TextDecoder = TextDecoder;
