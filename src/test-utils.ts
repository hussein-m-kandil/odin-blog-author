import { User, Post, Image, InitAuthData, AuthData } from '@/types';
import { vi } from 'vitest';

export const delay = (fn: () => void, ms = 100) => setTimeout(fn, ms);

export const mockDialogContext = () => {
  const dialogMockedMethods = vi.hoisted(() => {
    const showDialog = vi.fn();
    const hideDialog = vi.fn();
    const useDialog = vi.fn(() => ({ showDialog, hideDialog }));
    return { useDialog, showDialog, hideDialog };
  });
  vi.mock('@/contexts/dialog-context', () => ({
    useDialog: dialogMockedMethods.useDialog,
  }));
  return dialogMockedMethods;
};

export const mockAuthContext = () => {
  const authMockedMethods = vi.hoisted(() => {
    const authData: AuthData = {
      authFetch: window.fetch, // This won't work,
      backendUrl: 'https://new-test.com/api/v1',
      token: 'new-test-token',
      user: null,
    };
    const setAuthData = vi.fn();
    const useAuthData = vi.fn(() => ({ authData, setAuthData }));
    return { useAuthData, setAuthData, authData };
  });
  vi.mock('@/contexts/auth-context', () => ({
    useAuthData: authMockedMethods.useAuthData,
  }));
  const { authData, setAuthData, useAuthData } = authMockedMethods;
  useAuthData.mockImplementation(() => {
    // because the hoisted code executes before the environment itself
    return { setAuthData, authData: { ...authData, authFetch: window.fetch } };
  });
  return authMockedMethods;
};

export const dates = {
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const author: User = {
  ...dates,
  order: 1,
  bio: null,
  isAdmin: false,
  id: crypto.randomUUID(),
  username: 'nowhere_man',
  fullname: 'Nowhere-Man',
};

export const initAuthData: InitAuthData = {
  backendUrl: 'https://test.com/api/v1',
  token: 'test-token',
  user: author,
};

export const image: Image = {
  ...dates,
  order: 1,
  ownerId: author.id,
  owner: { ...author },
  id: crypto.randomUUID(),
  src: 'https://example.com/test-image.jpg',
  mimetype: 'image/jpeg',
  alt: 'Test image',
  size: 750000,
  height: 1080,
  width: 1920,
  scale: 1.0,
  xPos: 0,
  yPos: 0,
  info: '',
};

const postId = crypto.randomUUID();

export const post: Post = {
  author,
  ...dates,
  order: 1,
  image: image,
  published: true,
  title: 'Test Post',
  id: postId,
  authorId: author.id,
  content: 'Just for testing...',
  categories: [
    {
      postId,
      name: 'Software',
      id: crypto.randomUUID(),
    },
  ],
  comments: Array.from({ length: 5 }).map((_, i) => ({
    ...dates,
    author,
    postId,
    order: i + 1,
    id: crypto.randomUUID(),
    content: `Test comment #${i + 1}`,
    authorId: !i ? author.id : crypto.randomUUID(),
  })),
  votes: Array.from({ length: 5 }).map((_, i) => ({
    postId,
    user: author,
    order: i + 1,
    isUpvote: true,
    userId: crypto.randomUUID(),
    id: !i ? author.id : crypto.randomUUID(),
  })),
  _count: { comments: 5, votes: 5 },
};
