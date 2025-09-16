import React from 'react';
import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { PostsWrapper, PostsWrapperSkeleton } from '@/components/posts-wrapper';
import { AppStats, AppStatsSkeleton } from '@/components/app-stats';
import { getServerAuthData } from '@/lib/auth';
import { H1 } from '@/components/typography/';
import { Header } from '@/components/header';
import { SearchParams } from '@/types';

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const authData = await getServerAuthData();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryFn: () => authData.authFetch('/stats'),
    queryKey: ['stats'],
  });

  return (
    <>
      <Header>
        <H1>{process.env.NEXT_PUBLIC_APP_NAME || 'Home Page'}</H1>
      </Header>
      <main>
        <React.Suspense fallback={<AppStatsSkeleton />}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <div className='my-4'>
              <AppStats />
            </div>
          </HydrationBoundary>
        </React.Suspense>
        <React.Suspense fallback={<PostsWrapperSkeleton />}>
          <PostsWrapper searchParams={searchParams} authData={authData} />
        </React.Suspense>
      </main>
    </>
  );
}
