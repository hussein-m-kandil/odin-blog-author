import '@testing-library/jest-dom/vitest';
import {
  setupIntersectionMocking,
  resetIntersectionMocking,
} from 'react-intersection-observer/test-utils';
import { vi, beforeAll, beforeEach, afterEach } from 'vitest';

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

const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    constructor() {
      this.observe = this.observe.bind(this);
      this.unobserve = this.unobserve.bind(this);
      this.disconnect = this.disconnect.bind(this);
    }
    observe = observeMock;
    unobserve = unobserveMock;
    disconnect = disconnectMock;
  };
});

beforeEach(() => {
  setupIntersectionMocking(vi.fn);
});

afterEach(() => {
  Object.values(nextRouterMock).forEach((mockFn) => mockFn.mockReset());
  disconnectMock.mockReset();
  unobserveMock.mockReset();
  observeMock.mockReset();
  resetIntersectionMocking();
});
