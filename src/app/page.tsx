import { API_BASE_URL, getCurrentUrl, getServerAuthData } from '@/lib/auth';
import { ServerPosts } from '@/components/server-posts';
import { H1 } from '@/components/typography/';
import { Header } from '@/components/header';

export default async function Home() {
  const authData = await getServerAuthData();

  let postsUrl = `${API_BASE_URL}/posts`;
  try {
    postsUrl += (await getCurrentUrl()).search;
  } catch {}

  return (
    <>
      <Header>
        <H1>{process.env.NEXT_PUBLIC_APP_NAME || 'Home Page'}</H1>
      </Header>
      <main>
        <ServerPosts postsUrl={postsUrl} authData={authData} />
      </main>
    </>
  );
}
