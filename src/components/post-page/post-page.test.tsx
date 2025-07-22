import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { delay, post, mockAuthContext, author } from '@/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PostPage } from './post-page';

const PostPageWrapper = (
  props: Omit<React.ComponentProps<typeof PostPage>, 'postUrl'>
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 'static' } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PostPage postUrl={'https://example.com'} {...props} />
    </QueryClientProvider>
  );
};

const fetchMock = vi.fn(
  () =>
    new Promise<Response>((resolve) =>
      delay(() => resolve(Response.json(post)))
    )
);

vi.spyOn(window, 'fetch').mockImplementation(fetchMock);

const { authData, useAuthData, setAuthData } = mockAuthContext();
authData.authFetch = window.fetch;

afterEach(() => {
  vi.clearAllMocks();
  useAuthData.mockImplementation(() => ({ authData, setAuthData }));
});

describe('<PostPage />', () => {
  it('should show loader', () => {
    render(<PostPageWrapper />);
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('should show error message on error', async () => {
    fetchMock.mockImplementationOnce(() => {
      throw Error('Test Error');
    });
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(screen.getByText(/could(n't| not) .* post/i)).toBeInTheDocument();
  });

  it('should show error message on reject', async () => {
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((_, reject) =>
          delay(() => reject(Response.json(null, { status: 404 })))
        )
    );
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(screen.getByText(/could(n't| not) .* post/i)).toBeInTheDocument();
  });

  it('should have the given className on loading', () => {
    const className = 'test-class';
    const { container } = render(<PostPageWrapper className={className} />);
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should have the given className on loading successful', async () => {
    const className = 'test-class';
    const { container } = render(<PostPageWrapper className={className} />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should have the given className on loading error', async () => {
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((_, reject) =>
          delay(() => reject(Response.json(null, { status: 404 })))
        )
    );
    const className = 'test-class';
    const { container } = render(<PostPageWrapper className={className} />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should display a heading with the posts title', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(
      screen.getByRole('heading', { name: post.title })
    ).toBeInTheDocument();
  });

  it('should display post content', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(screen.getByText(post.content)).toBeInTheDocument();
  });

  it('should display a heading for the comments ', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(
      screen.getByRole('heading', { name: /comments/i })
    ).toBeInTheDocument();
  });

  it('should display the post comments', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    for (const comment of post.comments) {
      expect(screen.getByText(comment.content)).toBeInTheDocument();
    }
  });

  it('should display the post categories', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    for (const { categoryName } of post.categories) {
      expect(screen.getByText(categoryName)).toBeInTheDocument();
    }
  });

  it('should display the post options menu if current user is its author', async () => {
    useAuthData.mockImplementation(() => ({
      authData: { ...authData, user: author },
      setAuthData,
    }));
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(
      screen.getByRole('button', { name: /post options/i })
    ).toBeInTheDocument();
  });

  it('should not display the post options menu if current user is not its author', async () => {
    useAuthData.mockImplementation(() => ({
      authData: { ...authData, user: { ...author, id: 'x' } },
      setAuthData,
    }));
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(screen.queryByRole('button', { name: /post options/i })).toBeNull();
  });

  it('should not display the post options menu if there is no current user at all', async () => {
    useAuthData.mockImplementation(() => ({
      authData: { ...authData, user: null },
      setAuthData,
    }));
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(screen.queryByRole('button', { name: /post options/i })).toBeNull();
  });

  it('should display the post author name', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(screen.getAllByText(new RegExp(post.author.username))).toHaveLength(
      post.comments.filter((c) => c.author.username === post.author.username)
        .length + 1
    );
  });

  it('should display the post image', async () => {
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect((screen.getByRole('img') as HTMLImageElement).src).toMatch(
      new RegExp(post.image?.src as string)
    );
  });

  it('should not display an image if the post do not have one', async () => {
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) =>
          delay(() => resolve(Response.json({ ...post, image: null })))
        )
    );
    render(<PostPageWrapper />);
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(screen.queryByRole('img')).toBeNull();
  });
});
