import { PostsWrapper } from '@/components/posts-wrapper';
import { getServerAuthData } from '@/lib/auth';
import { H1 } from '@/components/typography/';
import { Header } from '@/components/header';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const urlSearchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(await searchParams).map(([k, v]) => {
        if (Array.isArray(v)) {
          return [k, v.map((str) => [k, str])];
        } else if (!v) {
          return [k, 'true'];
        }
        return [k, v];
      })
    )
  );

  const authData = await getServerAuthData();

  const postsUrl = `/posts?${urlSearchParams.toString()}`;

  return (
    <>
      <Header>
        <H1>{process.env.NEXT_PUBLIC_APP_NAME || 'Home Page'}</H1>
      </Header>
      <main>
        <PostsWrapper postsUrl={postsUrl} authData={authData} />
      </main>
    </>
  );
}
