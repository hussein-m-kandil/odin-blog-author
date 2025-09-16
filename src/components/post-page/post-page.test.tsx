import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { post, author, initAuthData, image } from '@/test-utils';
import { PostPageSkeleton } from './post-page.skeleton';
import { AuthProvider } from '@/contexts/auth-context';
import { axiosMock } from '@/__mocks__/axios';
import { PostPage } from './post-page';

const loaderRegex = /loading .* post page/i;

const getInitAuthData = vi.fn(() => initAuthData);

const PostPageWrapper = (
  props: Omit<React.ComponentProps<typeof PostPage>, 'postUrl' | 'postId'>
) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: 'static' } },
        })
      }>
      <AuthProvider initAuthData={getInitAuthData()}>
        <PostPage postUrl={'https://example.com'} postId={post.id} {...props} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('<PostPage />', () => {
  beforeEach(() => axiosMock.onGet().reply(200, post));

  it('should show loader', () => {
    render(<PostPageWrapper />);
    expect(screen.getByLabelText(loaderRegex)).toBeInTheDocument();
  });

  it('should show error message on error', async () => {
    axiosMock.onGet().networkError();
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(screen.getByText(/could(n't| not) .* post/i)).toBeInTheDocument();
  });

  it('should show error message on reject', async () => {
    axiosMock.onGet().reply(400);
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(screen.getByText(/could(n't| not) .* post/i)).toBeInTheDocument();
  });

  it('should have the given className on loading', () => {
    const className = 'test-class';
    const { container } = render(<PostPageWrapper className={className} />);
    expect(screen.getByLabelText(loaderRegex)).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should have the given className on loading successful', async () => {
    const className = 'test-class';
    const { container } = render(<PostPageWrapper className={className} />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should have the given className on loading error', async () => {
    axiosMock.onGet().reply(400);
    const className = 'test-class';
    const { container } = render(<PostPageWrapper className={className} />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should display a heading with the posts title', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(
      screen.getByRole('heading', { name: post.title })
    ).toBeInTheDocument();
  });

  it('should display post content', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(screen.getByText(post.content)).toBeInTheDocument();
  });

  it('should display a heading for the comments ', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(
      screen.getByRole('heading', { name: /comments/i })
    ).toBeInTheDocument();
  });

  it('should display the post comments', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    for (const comment of post.comments) {
      expect(screen.getByText(comment.content)).toBeInTheDocument();
    }
  });

  it('should display the post tags', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    for (const { name } of post.tags) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('should display the post options menu if current user is its author', async () => {
    getInitAuthData.mockImplementationOnce(() => ({
      ...initAuthData,
      user: author,
    }));
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(
      screen.getByRole('button', { name: /post options/i })
    ).toBeInTheDocument();
  });

  it('should not display the post options menu if current user is not its author', async () => {
    getInitAuthData.mockImplementationOnce(() => ({
      ...initAuthData,
      user: { ...author, id: 'x' },
    }));
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(screen.queryByRole('button', { name: /post options/i })).toBeNull();
  });

  it('should not display the post options menu if there is no current user at all', async () => {
    getInitAuthData.mockImplementationOnce(() => ({
      ...initAuthData,
      user: null,
    }));
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(screen.queryByRole('button', { name: /post options/i })).toBeNull();
  });

  it('should display the post author name', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(screen.getAllByText(new RegExp(post.author.username))).toHaveLength(
      post.comments.filter((c) => c.author.username === post.author.username)
        .length + 1
    );
  });

  it('should display the post image', async () => {
    render(<PostPageWrapper />);
    const { src } = image;
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect((screen.getByRole('img') as HTMLImageElement).src).toMatch(
      new RegExp(`${src}|${encodeURIComponent(src)}`)
    );
  });

  it('should not display an image if the post do not have one', async () => {
    axiosMock.onGet().reply(200, { ...post, image: null });
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(loaderRegex));
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('<PostPageSkeleton />', () => {
  it('should have the given className', () => {
    const className = 'test-class';
    render(<PostPageSkeleton className={className} />);
    expect(screen.getByLabelText(loaderRegex)).toHaveClass(className);
  });
});
