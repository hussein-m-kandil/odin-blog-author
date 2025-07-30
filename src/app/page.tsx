import { API_BASE_URL, getServerAuthData, URL_HEADER_KEY } from '@/lib/auth';
import { H1 } from '@/components/typography/';
import { Header } from '@/components/header';
import { headers } from 'next/headers';
import { ServerPosts } from '@/components/server-posts';

export default async function Home() {
  const authData = await getServerAuthData();

  const headerStore = await headers();

  const currentUrl =
    headerStore.get(URL_HEADER_KEY) || headerStore.get('referer');
  const postsUrl = `${API_BASE_URL}/posts${
    currentUrl ? new URL(currentUrl).search : ''
  }`;

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
