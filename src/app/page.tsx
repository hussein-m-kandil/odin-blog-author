import React from 'react';
import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { PostsWrapper, PostsWrapperSkeleton } from '@/components/posts-wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppStats, AppStatsSkeleton } from '@/components/app-stats';
import { getServerAuthData } from '@/lib/auth';
import { H1 } from '@/components/typography/';
import { Header } from '@/components/header';
import { SearchParams } from '@/types';
import { Bell } from 'lucide-react';

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
        <Alert className='w-fit max-w-2xl mx-auto my-4 text-start'>
          <Bell />
          <AlertTitle>This is a Demo Website!</AlertTitle>
          <AlertDescription className='*:leading-snug!'>
            <p>
              I built this project to showcase what I am learning in web
              development, and I do not plan to keep maintaining it; therefore,
              I added a reset feature to periodically delete any non-admin data.
              See the{' '}
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://github.com/hussein-m-kandil/odin-blog-author'
                className={`font-medium decoration-muted-foreground/75
                  underline underline-offset-2 decoration-0 decoration-dotted
                  hover:decoration-muted-foreground active:text-foreground`}>
                GitHub repository
              </a>{' '}
              for more information.
            </p>
          </AlertDescription>
        </Alert>
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
