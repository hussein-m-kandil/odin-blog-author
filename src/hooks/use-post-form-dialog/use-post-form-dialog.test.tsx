import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePostFormDialog } from './use-post-form-dialog';
import { DialogProvider } from '@/contexts/dialog-context';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { initAuthData, post } from '@/test-utils';
import { describe, expect, it } from 'vitest';
import { Toaster } from 'sonner';
import { Post } from '@/types';

const PostFormDialog = ({ post }: { post?: Post }) => {
  const { showPostForm } = usePostFormDialog({ post });
  return (
    <button type='button' onClick={showPostForm}>
      Show post form
    </button>
  );
};

const PostFormDialogWrapper = (
  props: React.ComponentProps<typeof PostFormDialog>
) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <AuthProvider initAuthData={initAuthData}>
        <DialogProvider>
          <PostFormDialog {...props} />
          <Toaster />
        </DialogProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('usePostFormDialog', () => {
  it('should not display a create post form before clicking show dialog', () => {
    render(<PostFormDialogWrapper />);
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should not display an update post form before clicking show dialog', () => {
    render(<PostFormDialogWrapper post={post} />);
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should display a create post form after clicking show dialog', async () => {
    const user = userEvent.setup();
    render(<PostFormDialogWrapper />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /create/i })).toBeInTheDocument();
  });

  it('should display an update post form after clicking show dialog', async () => {
    const user = userEvent.setup();
    render(<PostFormDialogWrapper post={post} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /update/i })).toBeInTheDocument();
  });

  it('should update post form have the given post data', async () => {
    const user = userEvent.setup();
    render(<PostFormDialogWrapper post={post} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue(
      post.title
    );
    expect(screen.getByRole('textbox', { name: /body/i })).toHaveValue(
      post.content
    );
    for (const tag of post.tags) {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    }
  });

  it('should close the post form dialog', async () => {
    const user = userEvent.setup();
    render(<PostFormDialogWrapper post={post} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getAllByRole('button', { name: /close/i })[0]);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
  });
});
