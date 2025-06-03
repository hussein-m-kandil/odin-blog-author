'use client'; // Error boundaries must be Client Components

import { ErrorComponent } from 'next/dist/client/components/error-boundary';
import { PageError } from '@/components/page-error/page-error';

export default function ErrorBoundary(
  props: React.ComponentProps<ErrorComponent>
) {
  return <PageError {...props} />;
}
