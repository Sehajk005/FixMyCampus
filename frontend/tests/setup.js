import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

globalThis.jest = vi;

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});