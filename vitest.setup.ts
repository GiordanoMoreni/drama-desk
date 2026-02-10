import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeAll(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new Error('External network calls are disabled in tests. Mock fetch explicitly.');
    })
  );
});

