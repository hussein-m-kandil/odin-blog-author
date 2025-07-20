import { User, Post, Image, InitAuthData } from '@/types';
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
    const authData = {
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
  id: 'blahblah123user',
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
  id: 'blahblah123image',
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

export const post: Post = {
  author,
  ...dates,
  order: 1,
  image: image,
  published: true,
  title: 'Test Post',
  id: 'blahblah123post',
  authorId: author.id,
  content: 'Just for testing...',
  categories: [
    {
      id: 'blahblah123category',
      postId: 'blahblah123post',
      categoryName: 'Software',
    },
  ],
  comments: [
    {
      author,
      ...dates,
      order: 1,
      authorId: author.id,
      content: 'Test comment',
      id: 'blahblah123comment',
      postId: 'blahblah123post',
    },
  ],
  votes: [
    {
      order: 1,
      user: author,
      isUpvote: true,
      userId: author.id,
      id: 'blahblah123vote',
      postId: 'blahblah123post',
    },
  ],
};
