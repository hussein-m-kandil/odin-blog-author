import { DialogProvider } from '@/contexts/dialog-context';
import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { CreatePostDialog } from './create-post-dialog';
import { describe, expect, it } from 'vitest';

const setup = (...[props]: Parameters<typeof CreatePostDialog> | []) => {
  return {
    user: userEvent.setup(),
    ...render(
      <DialogProvider>
        <div>
          <CreatePostDialog {...props} />
        </div>
      </DialogProvider>
    ),
  };
};

describe('<NewPostFormDialog />', () => {
  it('should render create post trigger that opens a closable form modal', async () => {
    const { user } = setup();
    const triggerQueryOpts = { name: /create/i };
    await user.click(screen.getByRole('button', triggerQueryOpts));
    expect(screen.getByRole('form', triggerQueryOpts)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('form', triggerQueryOpts)).toBeNull();
    expect(screen.getByRole('button', triggerQueryOpts)).toBeInTheDocument();
  });
});
