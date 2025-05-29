export interface User {
  id: string;
  isAdmin: boolean;
  username: string;
  fullname: string;
  createdAt: string;
  updatedAt: string;
  bio: string | null;
}

export interface AuthRes {
  token: string;
  user: User;
}
