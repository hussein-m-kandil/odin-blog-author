import { User, Post } from '@/types';

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
