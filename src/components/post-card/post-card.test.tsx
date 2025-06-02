import { DialogProvider } from '@/contexts/dialog-context';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PostCard } from './post-card';
import { post } from '@/test-utils';

describe('<PostCard />', () => {
  it('should render some of the post data', () => {
    render(<PostCard post={post} isMutable={false} />);
    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText(post.content)).toBeInTheDocument();
    const readLinks = screen.getAllByRole('link', {
      name: /read/i,
    }) as HTMLAnchorElement[];
    expect(readLinks.length).toBeTruthy();
    for (const readLink of readLinks) {
      expect(readLink.href).toMatch(new RegExp(`/blog/${post.id}$`));
    }
    const authorLink = screen.getByRole('link', {
      name: new RegExp(`${post.author.username}|${post.author.fullname}`, 'i'),
    }) as HTMLAnchorElement;
    expect(authorLink.href).toMatch(new RegExp(`/users/${post.authorId}$`));
  });

  it('should show action button with mutation actions for a mutable post', async () => {
    const user = userEvent.setup();
    render(
      <DialogProvider>
        <div>
          <PostCard post={post} isMutable={true} />
        </div>
      </DialogProvider>
    );
    await user.click(screen.getByRole('button', { name: /action/i }));
    expect(screen.getByText(/action/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /update|edit/i })
    ).toBeInTheDocument();
  });

  it('should show action button without mutation actions for an immutable post', async () => {
    const user = userEvent.setup();
    render(<PostCard post={post} isMutable={false} />);
    await user.click(screen.getByRole('button', { name: /action/i }));
    expect(screen.getByText(/action/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /update|edit/i })).toBeNull();
  });
});
