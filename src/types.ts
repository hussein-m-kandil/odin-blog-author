export type ID = string | number;

export interface User {
  id: string;
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

export interface AuthData {
  backendUrl: string;
  user?: User | null;
  token?: string;
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
  userId: string;
  postId: string;
  isUpvote: boolean;
}

export interface Comment {
  id: string;
  author: User;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  categories: Category[];
  comments: Comment[];
  votes: Vote[];
  author: User;
}
