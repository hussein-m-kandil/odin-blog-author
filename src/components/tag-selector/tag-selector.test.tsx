import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TagSelector, TagSelectorProps } from './tag-selector';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { axiosMock } from '@/../__mocks__/axios';
import { initAuthData } from '@/test-utils';
import { MAX_TAGS_NUM } from '@/lib/utils';

const TagSelectorWrapper = (props: TagSelectorProps) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <AuthProvider initAuthData={initAuthData}>
        <TagSelector {...props} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const props: TagSelectorProps = {
  onSelect: vi.fn(),
  onError: vi.fn(),
  tags: ['foo'],
};

describe('<TagSelector />', () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onAny().reply(200);
  });

  afterEach(vi.clearAllMocks);

  it('should display trigger with default content', () => {
    render(<TagSelectorWrapper {...props} />);
    expect(screen.getByRole('button')).toHaveTextContent(/tag/i);
  });

  it('should display trigger button with the given content and props', () => {
    render(
      <TagSelectorWrapper
        {...props}
        triggerContent={<span>Click me</span>}
        triggerProps={{ className: 'test-class' }}
      />
    );
    expect(screen.getByText('Click me').nodeName).toBe('SPAN');
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveClass(
      'test-class'
    );
  });

  it('should display combobox after clicking the trigger', async () => {
    const user = userEvent.setup();
    render(<TagSelectorWrapper {...props} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('combobox', { name: /tag/i })).toBeInTheDocument();
  });

  it('should display the retrieved tags as is (denormalized), and without any existent tag', async () => {
    const tags = ['fOo', 'bAr', 'taR'].map((name) => ({
      id: crypto.randomUUID(),
      name,
    }));
    axiosMock.onGet().reply(200, tags);
    const user = userEvent.setup();
    render(<TagSelectorWrapper {...{ ...props, tags: ['fOo'] }} />);
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'x');
    const options = await screen.findAllByRole('option');
    tags.splice(0, 1);
    expect(options).toHaveLength(tags.length);
    for (let i = 0; i < tags.length; i++) {
      expect(options[i]).toHaveTextContent(tags[i].name);
    }
  });

  it('should display the search value at the list start, if the corresponding prop is true', async () => {
    const tags = ['fOo', 'bAr', 'taR'].map((name) => ({
      id: crypto.randomUUID(),
      name,
    }));
    axiosMock.onGet().reply(200, tags);
    const user = userEvent.setup();
    render(
      <TagSelectorWrapper
        {...{ ...props, tags: ['fOo'] }}
        includeSearchValueInResult={true}
      />
    );
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'x');
    const options = await screen.findAllByRole('option');
    tags.splice(0, 1);
    expect(options).toHaveLength(tags.length + 1);
    expect(options[0]).toHaveTextContent('x');
    for (let i = 0; i < tags.length; i++) {
      expect(options[i + 1]).toHaveTextContent(tags[i].name);
    }
  });

  it('should call `onSelect` with the selected value and the result list', async () => {
    axiosMock.onGet().reply(200, [{ id: crypto.randomUUID(), name: 'baz' }]);
    const user = userEvent.setup();
    render(<TagSelectorWrapper {...props} />);
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'x');
    await user.click(await screen.findByRole('option'));
    expect(props.onSelect).toHaveBeenCalledExactlyOnceWith('baz', ['baz']);
    expect(props.onError).not.toHaveBeenCalled();
  });

  it('should call `onError` if the maximum number of tags is exceeded', async () => {
    axiosMock.onGet().reply(200, [{ id: crypto.randomUUID(), name: 'baz' }]);
    const tags = Array.from({ length: MAX_TAGS_NUM }).map((_, i) => `T_${i}`);
    const user = userEvent.setup();
    render(<TagSelectorWrapper {...{ ...props, tags }} />);
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'x');
    await user.click(await screen.findByRole('option'));
    expect(props.onError).toHaveBeenCalledOnce();
    expect(props.onSelect).not.toHaveBeenCalled();
    expect((props.onError as Mock).mock.calls[0][0]).toMatch(/maximum .*tags/i);
  });

  it('should prevent typing any character other than the alphanumerics & the underscores', async () => {
    axiosMock.onGet().reply(200, []);
    const user = userEvent.setup();
    render(<TagSelectorWrapper {...props} includeSearchValueInResult={true} />);
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'x @$ _ y');
    await user.click(await screen.findByRole('option'));
    expect(props.onSelect).toHaveBeenCalledExactlyOnceWith('x_y', []);
    expect(props.onError).not.toHaveBeenCalled();
  });
});
