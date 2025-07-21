import React from 'react';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { createPostFormAttrs } from './post-form.data';
import { mockAuthContext, post } from '@/test-utils';
import { PostForm } from './post-form';
import { Post } from '@/types';

mockAuthContext();

const onSuccessMock = vi.fn();
const fetchMock = () => {
  return new Promise<Response>((resolve) =>
    setTimeout(() => resolve(Response.json(null, { status: 200 })), 50)
  );
};

const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation(fetchMock);

afterEach(vi.clearAllMocks);

const PostFormWrapper = (props: React.ComponentProps<typeof PostForm>) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <PostForm {...props} />
    </QueryClientProvider>
  );
};

const setup = async (post?: Post) => {
  const data = {
    submittingOpts: { name: post ? /updating/i : /creating/i },
    submitterOpts: { name: post ? /update .*post/i : /create .*post/i },
    entries: Object.entries(createPostFormAttrs(post)),
    formOpts: { name: post ? 'Update Post' : 'Create Post' },
  };
  const user = userEvent.setup();
  const renderResult = render(
    <PostFormWrapper
      post={post}
      aria-label={data.formOpts.name}
      onSuccess={onSuccessMock}
    />
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
    const { data, user } = await setup(post);
    fetchSpy.mockImplementationOnce(
      () => new Promise((_, reject) => setTimeout(reject, 50))
    );
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(/something .*wrong/i)).toBeInTheDocument();
  });

  it('should show response error and not call `onSuccess` function', async () => {
    const error = 'Test error';
    const { data, user } = await setup(post);
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Response.json({ error }, { status: 400 })),
            50
          )
        )
    );
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(error)).toBeInTheDocument();
  });

  it('should show unauthorized error and not call `onSuccess` function', async () => {
    const error = 'Test error';
    const { data, user } = await setup(post);
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Response.json({ error }, { status: 401 })),
            50
          )
        )
    );
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
