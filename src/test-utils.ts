import { User, Post, AuthData } from '@/types';
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
  return authMockedMethods;
};

export const dates = {
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const author: User = {
  ...dates,
  bio: null,
  isAdmin: false,
  id: 'blahblah123user',
  username: 'nowhere_man',
  fullname: 'Nowhere-Man',
};

export const initAuthData: AuthData = {
  backendUrl: 'https://test.com/api/v1',
  token: 'test-token',
  user: author,
};

export const post: Post = {
  author,
  ...dates,
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
      authorId: author.id,
      content: 'Test comment',
      id: 'blahblah123comment',
      postId: 'blahblah123post',
    },
  ],
  votes: [
    {
      user: author,
      isUpvote: true,
      userId: author.id,
      id: 'blahblah123vote',
      postId: 'blahblah123post',
    },
  ],
};
