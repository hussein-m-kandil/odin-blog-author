import { render, screen } from '@testing-library/react';
import { post, author, dates, mockDialogContext } from '@/test-utils';
import { BlogComments } from './blog-comments';
import { describe, expect, it } from 'vitest';
import { Comment } from '@/types';

const comments: Comment[] = [1, 2, 3].map((n) => ({
  author,
  order: n,
  id: `comment-${n}`,
  authorId: author.id,
  content: `Test Comment #${n}`,
  postId: post.id,
  ...dates,
}));

const currentUserId = 'user-7';

const props = { post, comments, currentUserId };

mockDialogContext();

describe('<BlogComments />', () => {
  it('should not render new comment form if not given the current user id', () => {
    render(<BlogComments post={post} comments={comments} />);
    expect(screen.queryByRole('form', { name: /comment/i })).toBeNull();
  });

  it('should render new comment form if given the current user id', () => {
    render(<BlogComments {...props} />);
    expect(screen.getByRole('form', { name: /comment/i })).toBeInTheDocument();
  });

  it('should render the given list of comments', () => {
    render(<BlogComments {...props} />);
    const commentList = screen.getByRole('list', { name: /comments/i });
    expect(commentList).toBeInTheDocument();
    expect(commentList.children).toHaveLength(comments.length);
    for (const comment of comments) {
      expect(screen.getByText(comment.content)).toBeInTheDocument();
    }
  });

  it('should have the give class', () => {
    const htmlClass = 'test-class';
    const { container } = render(
      <BlogComments {...props} className={htmlClass} />
    );
    expect(container.firstElementChild).toHaveClass(htmlClass);
  });
});
