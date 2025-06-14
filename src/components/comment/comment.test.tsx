import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Comment } from './comment';
import { post } from '@/test-utils';

const comment = post.comments[0];
const authorId = post.authorId;

const props = { post, comment };

const optsRegex = /open.*options/i;

describe('<Comments />', () => {
  it('should fetch and render the post comments', async () => {
    render(<Comment {...props} />);
    expect(screen.getByText(comment.content)).toBeInTheDocument();
  });

  it('should not render comment options menu if not given the current user id', async () => {
    render(<Comment {...props} />);
    expect(screen.queryByRole('button', { name: optsRegex })).toBeNull();
  });

  it('should not render comment options menu for a user who is not for post author, nor comment author', async () => {
    render(<Comment {...props} currentUserId={'foreign-user'} />);
    expect(screen.queryByRole('button', { name: optsRegex })).toBeNull();
  });

  it('should render (collapsed) comment options menu if given current user id', async () => {
    render(<Comment {...props} currentUserId={authorId} />);
    expect(screen.getByRole('button', { name: optsRegex })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /update/i })).toBeNull();
  });

  it('should options menu have delete & update options for a user who is comment author', async () => {
    const user = userEvent.setup();
    render(<Comment {...props} currentUserId={authorId} />);
    await user.click(screen.getByRole('button', { name: optsRegex }));
    expect(screen.getByRole('button', { name: /update/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /delete/i })).toBeVisible();
  });

  it('should options menu have only a delete option for a user who is post author, but not comment author', async () => {
    const user = userEvent.setup();
    const otherPostAuthorId = 'other-author';
    const otherPost = {
      ...post,
      authorId: otherPostAuthorId,
      author: { ...post.author, id: otherPostAuthorId },
    };
    render(
      <Comment
        {...{ ...props, post: otherPost }}
        currentUserId={otherPostAuthorId}
      />
    );
    await user.click(screen.getByRole('button', { name: optsRegex }));
    expect(screen.getByRole('button', { name: /delete/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /update/i })).toBeNull();
  });
});
