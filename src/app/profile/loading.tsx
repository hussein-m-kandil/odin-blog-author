import { PostsWrapperSkeleton } from '@/components/posts-wrapper';
import { UserProfileSkeleton } from '@/components/user-profile';
import { Header } from '@/components/header';

export default function Loading() {
  return (
    <>
      <Header>
        <UserProfileSkeleton />
      </Header>
      <main>
        <PostsWrapperSkeleton />
      </main>
    </>
  );
}
