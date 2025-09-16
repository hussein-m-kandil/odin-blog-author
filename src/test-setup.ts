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
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => nextRouterMock,
}));

const observe = vi.fn();
const unobserve = vi.fn();
const disconnect = vi.fn();
const takeRecords = vi.fn();
const revokeObjectURL = vi.fn();
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
});

beforeEach(() => {
  setupIntersectionMocking(vi.fn);
  axiosMock.onAny().reply(200);
});

afterEach(() => {
  Object.values(nextRouterMock).forEach((mockFn) => mockFn.mockReset());
  resetIntersectionMocking();
  createObjectURL.mockReset();
  revokeObjectURL.mockReset();
  disconnect.mockReset();
  unobserve.mockReset();
  observe.mockReset();
  axiosMock.reset();
});
