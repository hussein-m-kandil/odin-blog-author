import PostCardSkeleton from './post-card.skeleton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { post, mockDialogContext } from '@/test-utils';
import { describe, expect, it } from 'vitest';
import { PostCard } from './post-card';

mockDialogContext();

const PostCardWrapper = (props: React.ComponentProps<typeof PostCard>) => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <PostCard {...props} />
    </QueryClientProvider>
  );
};

describe('<PostCard />', () => {
  it('should render some of the post data', () => {
    render(<PostCardWrapper post={post} isMutable={false} />);
    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText(post.content)).toBeInTheDocument();
    const readLinks = screen.getAllByRole('link', {
      name: /read/i,
    }) as HTMLAnchorElement[];
    expect(readLinks.length).toBeTruthy();
    for (const readLink of readLinks) {
      expect(readLink.href).toMatch(new RegExp(`/${post.id}$`));
    }
    const authorLink = screen.getByRole('link', {
      name: new RegExp(`${post.author.username}|${post.author.fullname}`, 'i'),
    }) as HTMLAnchorElement;
    expect(authorLink.href).toMatch(new RegExp(`/profile/${post.authorId}$`));
  });

  it('should show action button with mutation actions for a mutable post', () => {
    render(<PostCardWrapper post={post} isMutable={true} />);
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
  });

  it('should show action button without mutation actions for an immutable post', () => {
    render(<PostCardWrapper post={post} isMutable={false} />);
    expect(screen.queryByRole('button', { name: /open/i })).toBeNull();
  });
});

describe('<PostCardSkeleton />', () => {
  it('should have the given className', () => {
    const className = 'test-class';
    render(<PostCardSkeleton className={className} />);
    expect(screen.getByLabelText(/loading .* post/i)).toHaveClass(className);
  });
});
