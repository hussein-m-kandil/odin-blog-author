import '@testing-library/jest-dom/vitest';
import {
  setupIntersectionMocking,
  resetIntersectionMocking,
} from 'react-intersection-observer/test-utils';
import { vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { axiosMock } from '@/../__mocks__/axios';

vi.mock('axios');

const nextRouterMock = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
}));
vi.mock('next/navigation', async (importOriginal) => {
  const url = new URL(window.location.href);
  return {
    ...(await importOriginal<typeof import('next/navigation')>()),
    useSearchParams: () => url.searchParams,
    usePathname: () => url.pathname,
    useRouter: () => nextRouterMock,
  };
});

const observe = vi.fn();
const unobserve = vi.fn();
const disconnect = vi.fn();
const takeRecords = vi.fn();
const revokeObjectURL = vi.fn();
const hasPointerCapture = vi.fn();
const setPointerCapture = vi.fn();
const releasePointerCapture = vi.fn();
const createObjectURL = vi.fn(() => 'blob://file.ext');

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    vi.fn(() => ({ observe, unobserve, disconnect }))
  );
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(() => ({ disconnect, observe, takeRecords, unobserve }))
  );
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;
  HTMLElement.prototype.hasPointerCapture = hasPointerCapture;
  HTMLElement.prototype.setPointerCapture = setPointerCapture;
  HTMLElement.prototype.releasePointerCapture = releasePointerCapture;
});

beforeEach(() => {
  setupIntersectionMocking(vi.fn);
  axiosMock.onAny().reply(200);
});

afterEach(() => {
  Object.values(nextRouterMock).forEach((mockFn) => mockFn.mockReset());
  releasePointerCapture.mockReset();
  hasPointerCapture.mockReset();
  setPointerCapture.mockReset();
  resetIntersectionMocking();
  createObjectURL.mockReset();
  revokeObjectURL.mockReset();
  disconnect.mockReset();
  unobserve.mockReset();
  observe.mockReset();
  axiosMock.reset();
});
