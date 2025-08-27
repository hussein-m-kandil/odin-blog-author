import React from 'react';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { createPostFormAttrs } from './post-form.data';
import { AuthProvider } from '@/contexts/auth-context';
import { post, initAuthData } from '@/test-utils';
import { axiosMock } from '@/__mocks__/axios';
import { PostForm } from './post-form';
import { Toaster } from 'sonner';
import { Post } from '@/types';

const PostFormWrapper = (
  props: Omit<React.ComponentProps<typeof PostForm>, 'shouldUnmountRef'>
) => {
  const shouldUnmountRef = React.useRef<() => Promise<boolean>>(null);
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <AuthProvider initAuthData={initAuthData}>
        <PostForm {...props} shouldUnmountRef={shouldUnmountRef} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const onSuccessMock = vi.fn();

const setup = async (post?: Post) => {
  const data = {
    entries: Object.entries(createPostFormAttrs(post)),
    ...(post
      ? {
          submitterOpts: { name: /update post/i },
          submittingOpts: { name: /updating/i },
          formOpts: { name: /update post/i },
        }
      : {
          submitterOpts: { name: /create post/i },
          submittingOpts: { name: /creating/i },
          formOpts: { name: /create post/i },
        }),
  };
  const user = userEvent.setup();
  const renderResult = render(
    <PostFormWrapper post={post} onSuccess={onSuccessMock} />
  );
  return { data, user, ...renderResult };
};

const assertPostFormFieldsAndSubmitter = async (postData?: Post) => {
  const { data } = await setup(postData);
  const form = screen.getByRole('form', data.formOpts);
  expect(form).toBeInTheDocument();
  for (const entry of data.entries) {
    const attrs = entry[1];
    const inp = (
      attrs.type === 'checkbox'
        ? screen.getByRole('checkbox', { name: attrs.label })
        : screen.getByLabelText(attrs.label)
    ) as HTMLInputElement;
    expect(inp).toBeInTheDocument();
    if (attrs.type === 'checkbox')
      expect(inp.ariaChecked).toBe(`${attrs.defaultValue}`);
    else expect(inp.defaultValue).toBe(attrs.defaultValue);
  }
  expect(screen.getByRole('button', data.submitterOpts)).toBeInTheDocument();
};

describe(`<PostForm />`, () => {
  beforeEach(() => {
    axiosMock.onGet().reply(200, ['tag']);
    axiosMock.onPost().reply(201, post);
    axiosMock.onPut().reply(200, post);
    axiosMock.onDelete().reply(204);
  });

  afterEach(vi.clearAllMocks);

  it('should not display the close button if not given `onClose` prop', () => {
    render(<PostFormWrapper />);
    expect(screen.queryByRole('button', { name: /close/i })).toBeNull();
  });

  it('should display the close button if not given `onClose` prop', () => {
    render(<PostFormWrapper onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should call the given `onClose` after clicking the close button', async () => {
    const onCloseMock = vi.fn();
    const user = userEvent.setup();
    render(<PostFormWrapper onClose={onCloseMock} />);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onCloseMock).toHaveBeenCalledOnce();
  });

  it('should render a create post form with inputs and correct submitter', async () => {
    await assertPostFormFieldsAndSubmitter();
  });

  it('should render an update post form with inputs and correct submitter', async () => {
    await assertPostFormFieldsAndSubmitter(post);
  });

  it('should not submit while all fields are empty', async () => {
    const { data, user } = await setup();
    for (const entry of data.entries) {
      const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
      expect(inp.ariaInvalid).toBe('false');
    }
    const submitter = screen.getByRole('button', data.submitterOpts);
    await user.click(submitter);
    for (const entry of data.entries) {
      if (entry[1].type !== 'checkbox') {
        const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
        expect(inp.ariaInvalid).toBe('true');
      }
    }
  });

  it('should handle promise rejection and not call `onSuccess` function', async () => {
    axiosMock.onPut().abortRequest();
    const { data, user } = await setup(post);
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(/something .*wrong/i)).toBeInTheDocument();
  });

  it('should show response error and not call `onSuccess` function', async () => {
    const error = 'Test error';
    axiosMock.onPut().reply(400, { error });
    const { data, user } = await setup(post);
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(error)).toBeInTheDocument();
  });

  it('should show unauthorized error and not call `onSuccess` function', async () => {
    axiosMock.onPut().reply(401);
    const { data, user } = await setup(post);
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(/unauthorized/i)).toBeInTheDocument();
  });

  it('should call `onSuccess` function', async () => {
    const { data, user } = await setup(post);
    await user.click(screen.getByRole('button', data.submitterOpts));
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(
      await screen.findByRole('button', data.submittingOpts)
    ).toBeInTheDocument();
    await waitFor(() => expect(onSuccessMock).toHaveBeenCalledTimes(1));
  });
});
