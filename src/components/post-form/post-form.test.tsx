import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createPostFormAttrs } from './post-form.data';
import { PostForm } from './post-form';
import { post } from '@/test-utils';
import { Post } from '@/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

const onSuccessMock = vi.fn();

const fetchSpy = vi.spyOn(window, 'fetch');

afterEach(vi.resetAllMocks);

const setup = async (post?: Post) => {
  const data = {
    submittingOpts: { name: post ? /updating/i : /creating/i },
    submitterOpts: { name: post ? /update .*post/i : /create .*post/i },
    entries: Object.entries(createPostFormAttrs(post)),
    formOpts: { name: post ? 'Update Post' : 'Create Post' },
  };
  const user = userEvent.setup();
  const renderResult = render(
    <PostForm
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
    fetchSpy.mockImplementationOnce(
      () => new Promise((_, reject) => setTimeout(reject, 50))
    );
    const { data, user } = await setup(post);
    await user.click(screen.getByRole('button', data.submitterOpts));
    expect(
      await screen.findByRole('button', data.submittingOpts)
    ).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(/something .*wrong/i)).toBeInTheDocument();
  });

  it('should show response error and not call `onSuccess` function', async () => {
    const error = 'Test error';
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Response.json({ error }, { status: 400 })),
            50
          )
        )
    );
    const { data, user } = await setup(post);
    await user.click(screen.getByRole('button', data.submitterOpts));
    expect(
      await screen.findByRole('button', data.submittingOpts)
    ).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(error)).toBeInTheDocument();
  });

  it('should show unauthorized error and not call `onSuccess` function', async () => {
    const error = 'Test error';
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Response.json({ error }, { status: 401 })),
            50
          )
        )
    );
    const { data, user } = await setup(post);
    await user.click(screen.getByRole('button', data.submitterOpts));
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(
      await screen.findByRole('button', data.submittingOpts)
    ).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(await screen.findByText(/unauthorized/i)).toBeInTheDocument();
  });

  it('should call `onSuccess` function', async () => {
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(new Response(null, { status: 204 })), 50)
        )
    );
    const { data, user } = await setup(post);
    await user.click(screen.getByRole('button', data.submitterOpts));
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(
      await screen.findByRole('button', data.submittingOpts)
    ).toBeInTheDocument();
    await waitFor(() => expect(onSuccessMock).toHaveBeenCalledTimes(1));
  });
});
