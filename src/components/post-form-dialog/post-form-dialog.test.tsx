import { UserEvent, userEvent } from '@testing-library/user-event';
import { DialogProvider } from '@/contexts/dialog-context';
import { render, screen } from '@testing-library/react';
import { PostFormDialog } from './post-form-dialog';
import { describe, expect, it } from 'vitest';
import { post } from '@/test-utils';

function WrappedPostFormDialog(...args: Parameters<typeof PostFormDialog>) {
  return (
    <DialogProvider>
      <div>
        <PostFormDialog {...args[0]} />
      </div>
    </DialogProvider>
  );
}

const setup = (...[props]: Parameters<typeof PostFormDialog> | []) => {
  return {
    user: userEvent.setup(),
    ...render(<WrappedPostFormDialog {...props} />),
  };
};

const assertCorrectPostFormDialog = async (user: UserEvent, name: RegExp) => {
  await user.click(screen.getByRole('button', { name }));
  expect(screen.getByRole('form', { name })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close/i }));
  expect(screen.queryByRole('form', { name })).toBeNull();
  expect(screen.getByRole('button', { name })).toBeInTheDocument();
};

describe('<PostFormDialog />', () => {
  it('should render create post trigger that opens a closable form modal', async () => {
    const { user } = setup();
    const name = /create/i;
    await assertCorrectPostFormDialog(user, name);
  });

  it('should render update post trigger that opens a closable form modal', async () => {
    const { user } = setup({ post });
    const name = /update|edit/i;
    await assertCorrectPostFormDialog(user, name);
  });

  it('should render delete post trigger that opens a closable form modal', async () => {
    const { user } = setup({ post, showDeleteForm: true });
    const name = /delete/i;
    await assertCorrectPostFormDialog(user, name);
  });

  it('should throw an error if asked to render a delete form without a post', () => {
    expect(() =>
      render(<WrappedPostFormDialog showDeleteForm={true} />)
    ).toThrowError(/a post/i);
  });
});
