import { User, Post, Image, BaseAuthData } from '@/types';
import { vi } from 'vitest';

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

export const initAuthData: BaseAuthData = {
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
