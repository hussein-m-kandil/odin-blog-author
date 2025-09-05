import { post, initAuthData, mockDialogContext, author } from '@/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { axiosMock } from '@/__mocks__/axios';
import { Posts } from './posts';
import { AuthProvider } from '@/contexts/auth-context';
import PostsSkeleton from './posts.skeleton';

mockDialogContext();

const postsUrl = `/posts?author=${author.username}`;

const PostsWrapper = (
  props: Omit<React.ComponentProps<typeof Posts>, 'postsUrl'>
) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }>
      <AuthProvider initAuthData={initAuthData}>
        <Posts postsUrl={postsUrl} {...props} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const posts = [post, { ...post, id: 'test-post-2', title: 'Test Post #2' }];

describe('<Posts />', () => {
  beforeEach(() => axiosMock.onGet().reply(200, posts));

  it('should call axios with given url', () => {
    render(<PostsWrapper />);
    expect(axiosMock.history.get[0].url).toStrictEqual(
      `${initAuthData.backendUrl}${postsUrl}`
    );
  });

  it('should display a message informs the user that there are no posts', async () => {
    axiosMock.onGet().reply(200, []);
    render(<PostsWrapper />);
    await waitFor(() =>
      expect(screen.getByText(/no posts/i)).toBeInTheDocument()
    );
  });

  it('should show error message on error', async () => {
    axiosMock.onGet().networkError();
    render(<PostsWrapper />);
    await waitFor(() =>
      expect(screen.getByText(/could(n't| not).*posts/i)).toBeInTheDocument()
    );
  });

  it('should show error message on abort', async () => {
    axiosMock.onGet().abortRequest();
    render(<PostsWrapper />);
    await waitFor(() =>
      expect(screen.getByText(/could(n't| not).*posts/i)).toBeInTheDocument()
    );
  });

  it('should display all the given posts', async () => {
    render(<PostsWrapper />);
    await waitFor(() => screen.getAllByRole('link', { name: /read/i }));
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

describe('<PostsSkeleton />', () => {
  it('should have the given class', () => {
    const className = 'test-class';
    const { container } = render(<PostsSkeleton className={className} />);
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should have the given id', () => {
    const id = 'test-id';
    const { container } = render(<PostsSkeleton id={id} />);
    expect(container.firstElementChild).toHaveAttribute('id', id);
  });

  it('should display 3 card-skeletons bay default', () => {
    const { container } = render(<PostsSkeleton />);
    expect(
      ((container.firstElementChild as Element).lastElementChild as Element)
        .children
    ).toHaveLength(3);
  });

  it('should displayed card-skeletons matches the given count', () => {
    const count = 5;
    const { container } = render(<PostsSkeleton count={count} />);
    expect(
      ((container.firstElementChild as Element).lastElementChild as Element)
        .children
    ).toHaveLength(count);
  });
});
