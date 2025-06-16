import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Blogs } from './blogs';
import { post } from '@/test-utils';

const posts = [post, { ...post, id: 'test-post-2', title: 'Test Post #2' }];

describe('<Blogs />', () => {
  it('should have the given class', () => {
    const htmlClass = 'test-class';
    const { container } = render(<Blogs posts={posts} className={htmlClass} />);
    expect(container.firstElementChild).toHaveClass(htmlClass);
  });

  it('should display the given headline', () => {
    const headText = 'Blog Posts';
    render(<Blogs posts={posts} headline={<h1>{headText}</h1>} />);
    expect(screen.getByRole('heading', { name: headText })).toBeInTheDocument();
  });

  it('should display a message informs the user that there are no posts', () => {
    render(<Blogs posts={[]} />);
    expect(screen.getByText(/no posts/i)).toBeInTheDocument();
  });

  it('should display all the given posts', () => {
    render(<Blogs posts={posts} />);
    expect(
      screen.getAllByRole('link', { name: /read/i }).length
    ).toBeGreaterThanOrEqual(posts.length);
    expect(
      screen.getAllByText(new RegExp(post.author.username, 'i'))
    ).toHaveLength(posts.length);
    for (const post of posts) {
      expect(screen.getByText(post.title)).toBeInTheDocument();
    }
  });
});
