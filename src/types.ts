export type ID = string | number;

export interface User {
  id: string;
  order: number;
  isAdmin: boolean;
  username: string;
  fullname: string;
  createdAt: string;
  updatedAt: string;
  bio: string | null;
  avatar?: string | null;
}

export interface AuthRes {
  token: string;
  user: User;
}

export interface InitAuthData {
  backendUrl: string;
  user?: User | null;
  token?: string;
}

export interface AuthData extends InitAuthData {
  authFetch: typeof fetch;
}

export interface Image {
  id: string;
  src: string;
  alt: string;
  owner: User;
  info: string;
  size: number;
  xPos: number;
  yPos: number;
  order: number;
  scale: number;
  width: number;
  height: number;
  ownerId: string;
  mimetype: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  postId: string;
  categoryName: string;
}

export interface Vote {
  id: string;
  user: User;
  order: number;
  userId: string;
  postId: string;
  isUpvote: boolean;
}

export interface Comment {
  id: string;
  order: number;
  author: User;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  order: number;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  categories: Category[];
  comments: Comment[];
  image: Image | null;
  votes: Vote[];
  author: User;
  _count: { comments: number; votes: number };
}
