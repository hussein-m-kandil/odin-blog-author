import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PostSearch } from './post-search';
import { initAuthData } from '@/test-utils';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { axiosMock } from '@/../__mocks__/axios';

const [useSearchParamsMock, replaceRouteMock] = vi.hoisted(() => {
  return [vi.fn(), vi.fn()];
});

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useSearchParams: useSearchParamsMock,
  usePathname: vi.fn(() => '/'),
  useRouter: () => ({
    replace: replaceRouteMock,
    prefetch: vi.fn(),
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

let currentParams: URLSearchParams;

const PostSearchWrapper = (props: React.ComponentProps<typeof PostSearch>) => {
  const [searchParams, setSearchParams] = React.useState(new URLSearchParams());
  currentParams = searchParams;
  useSearchParamsMock.mockImplementation(() => searchParams);
  replaceRouteMock.mockImplementation((href) =>
    setSearchParams(new URLSearchParams(href.replace(/^.*\?/, '')))
  );
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <AuthProvider initAuthData={initAuthData}>
        <PostSearch {...props} />;
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const routerOpts = { scroll: false };

describe('<PostSearch />', () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onAny().reply(200);
  });

  afterEach(vi.clearAllMocks);

  it('should have the given className', () => {
    const { container } = render(<PostSearchWrapper className='test-class' />);
    expect(container.firstElementChild).toHaveClass('test-class');
  });

  it('should have the given props', () => {
    render(<PostSearchWrapper id='test-id' aria-label='Test' />);
    expect(screen.getByLabelText('Test')).toHaveAttribute('id', 'test-id');
  });

  it('should search for the entered value', async () => {
    const user = userEvent.setup();
    render(<PostSearchWrapper />);
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'xyz');
    await user.click(screen.getByRole('button', { name: /search/i }));
    expect(replaceRouteMock).toHaveBeenCalledOnce();
    expect(replaceRouteMock).toHaveBeenNthCalledWith(1, '/?q=xyz', routerOpts);
  });

  it('should add search param while keeping the other params', async () => {
    useSearchParamsMock.mockImplementationOnce(
      () => new URLSearchParams({ foo: 'bar' })
    );
    const user = userEvent.setup();
    render(<PostSearchWrapper />);
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'xyz');
    await user.click(screen.getByRole('button', { name: /search/i }));
    expect(currentParams.get('foo')).toBe('bar');
    expect(currentParams.get('q')).toBe('xyz');
  });

  it('should toggle between `asc` and `desc` sorting via toggler presses', async () => {
    const user = userEvent.setup();
    render(<PostSearchWrapper />);
    await user.click(screen.getByRole('button', { name: /reverse/i }));
    await user.click(screen.getByRole('button', { name: /reverse/i }));
    await user.click(screen.getByRole('button', { name: /reverse/i }));
    const href1 = '/?sort=asc';
    const href2 = '/?sort=desc';
    expect(replaceRouteMock).toHaveBeenCalledTimes(3);
    expect(replaceRouteMock).toHaveBeenNthCalledWith(1, href1, routerOpts);
    expect(replaceRouteMock).toHaveBeenNthCalledWith(2, href2, routerOpts);
    expect(replaceRouteMock).toHaveBeenNthCalledWith(3, href1, routerOpts);
    expect(currentParams.get('sort')).toBe('asc');
  });

  it('should add sort param while keeping the other params', async () => {
    useSearchParamsMock.mockImplementationOnce(
      () => new URLSearchParams({ foo: 'bar' })
    );
    const user = userEvent.setup();
    render(<PostSearchWrapper />);
    await user.click(screen.getByRole('button', { name: /reverse/i }));
    expect(replaceRouteMock).toHaveBeenCalledOnce();
    expect(currentParams.get('sort')).toBe('asc');
  });

  it('should filter by tags', async () => {
    axiosMock.onGet().reply(
      200,
      ['foo', 'bar', 'tar'].map((name) => ({ id: crypto.randomUUID(), name }))
    );
    const user = userEvent.setup();
    render(<PostSearchWrapper />);
    const expectedParams = new URLSearchParams();
    await user.click(screen.getByRole('button', { name: /tag/i }));
    await user.type(screen.getByRole('combobox', { name: /tag/i }), 'x');
    await user.click((await screen.findAllByRole('option'))[0]);
    expectedParams.set('tags', 'foo');
    const href1 = `/?${expectedParams.toString()}`;
    await user.click(screen.getByRole('button', { name: /tag/i }));
    await user.type(screen.getByRole('combobox', { name: /tag/i }), 'y');
    await user.click((await screen.findAllByRole('option'))[0]);
    expectedParams.set('tags', 'foo,bar');
    const href2 = `/?${expectedParams.toString()}`;
    expect(replaceRouteMock).toBeCalledTimes(2);
    expect(currentParams.toString()).toBe(expectedParams.toString());
    expect(replaceRouteMock).toHaveBeenNthCalledWith(1, href1, routerOpts);
    expect(replaceRouteMock).toHaveBeenNthCalledWith(2, href2, routerOpts);
  });

  it('should filter by tags while keeping other params', async () => {
    const expectedParams = new URLSearchParams({ foo: 'bar' });
    useSearchParamsMock.mockImplementationOnce(() => expectedParams);
    axiosMock.onGet().reply(200, [{ id: crypto.randomUUID(), name: 'tar' }]);
    const user = userEvent.setup();
    render(<PostSearchWrapper />);
    await user.click(screen.getByRole('button', { name: /tag/i }));
    await user.type(screen.getByRole('combobox', { name: /tag/i }), 'x');
    await user.click((await screen.findAllByRole('option'))[0]);
    expectedParams.set('foo', 'bar');
    expectedParams.set('tags', 'tar');
    const href = `/?${expectedParams.toString()}`;
    expect(replaceRouteMock).toBeCalledTimes(1);
    expect(replaceRouteMock).toHaveBeenNthCalledWith(1, href, routerOpts);
    expect(`/?${currentParams.toString()}`).toBe(href);
  });

  it('should search, sort, and filter by tags, while keeping the other params', async () => {
    const expectedParams = new URLSearchParams({ foo: 'bar' });
    useSearchParamsMock.mockImplementationOnce(() => expectedParams);
    axiosMock.onGet().reply(200, [{ id: crypto.randomUUID(), name: 'tar' }]);
    const user = userEvent.setup();
    render(<PostSearchWrapper />);
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'baz');
    await user.click(screen.getByRole('button', { name: /search/i }));
    await user.click(screen.getByRole('button', { name: /tag/i }));
    await user.type(screen.getByRole('combobox', { name: /tag/i }), 'x');
    await user.click((await screen.findAllByRole('option'))[0]);
    await user.click(screen.getByRole('button', { name: /reverse/i }));
    expectedParams.set('foo', 'bar');
    expectedParams.set('q', 'baz');
    const href1 = `/?${expectedParams.toString()}`;
    expectedParams.set('tags', 'tar');
    const href2 = `/?${expectedParams.toString()}`;
    expectedParams.set('sort', 'asc');
    const href3 = `/?${expectedParams.toString()}`;
    expect(replaceRouteMock).toBeCalledTimes(3);
    expect(replaceRouteMock).toHaveBeenNthCalledWith(1, href1, routerOpts);
    expect(replaceRouteMock).toHaveBeenNthCalledWith(2, href2, routerOpts);
    expect(replaceRouteMock).toHaveBeenNthCalledWith(3, href3, routerOpts);
    expect(`/?${currentParams.toString()}`).toBe(href3);
  });
});
