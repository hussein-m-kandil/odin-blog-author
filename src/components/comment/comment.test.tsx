import { initAuthData, mockDialogContext, post, author } from '@/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { describe, expect, it } from 'vitest';
import { Comment } from './comment';

const comment = post.comments[0];

const props = { post, comment };

const optsRegex = /open.*options/i;

mockDialogContext();

const CommentWrapper = (props: React.ComponentProps<typeof Comment>) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <AuthProvider initAuthData={initAuthData}>
        <Comment {...props} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('<Comment />', () => {
  it('should render the post comments', async () => {
    render(<CommentWrapper {...props} />);
    expect(screen.getByText(comment.content)).toBeInTheDocument();
  });

  it('should have the given class', async () => {
    const htmlClass = 'blah';
    const { container } = render(
      <CommentWrapper {...props} className={htmlClass} />
    );
    expect(container.firstElementChild).toHaveClass(htmlClass);
  });

  it('should not render comment options menu if not given the current user id', async () => {
    render(<CommentWrapper {...props} />);
    expect(screen.queryByRole('button', { name: optsRegex })).toBeNull();
  });

  it('should not render comment options menu for a user who is not for post author, nor comment author', async () => {
    render(
      <CommentWrapper
        {...props}
        user={{ ...author, id: crypto.randomUUID() }}
      />
    );
    expect(screen.queryByRole('button', { name: optsRegex })).toBeNull();
  });

  it('should render (collapsed) comment options menu if given current user id', async () => {
    render(<CommentWrapper {...props} user={author} />);
    expect(screen.getByRole('button', { name: optsRegex })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /delete/i })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /update/i })).toBeNull();
  });

  it('should options menu have delete & update options for a user who is comment author', async () => {
    const user = userEvent.setup();
    render(<CommentWrapper {...props} user={author} />);
    await user.click(screen.getByRole('button', { name: optsRegex }));
    expect(screen.getByRole('menuitem', { name: /update/i })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /delete/i })).toBeVisible();
  });

  it('should options menu have only a delete option for a user who is post author, but not comment author', async () => {
    const user = userEvent.setup();
    const otherPostAuthorId = crypto.randomUUID();
    const otherPost = {
      ...post,
      authorId: otherPostAuthorId,
      author: { ...post.author, id: otherPostAuthorId },
    };
    render(
      <CommentWrapper
        {...{ ...props, post: otherPost }}
        user={otherPost.author}
      />
    );
    await user.click(screen.getByRole('button', { name: optsRegex }));
    expect(screen.getByRole('menuitem', { name: /delete/i })).toBeVisible();
    expect(screen.queryByRole('menuitem', { name: /update/i })).toBeNull();
  });

  it('should show update comment form on update, and hide it after update', async () => {
    const user = userEvent.setup();
    render(<CommentWrapper {...props} user={author} />);
    await user.click(screen.getByRole('button', { name: optsRegex }));
    await user.click(screen.getByRole('menuitem', { name: /update/i }));
    expect(screen.getByRole('form', { name: /update/i })).toBeInTheDocument();
  });
});
