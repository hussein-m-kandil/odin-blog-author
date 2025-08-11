import { Loader } from 'lucide-react';

export default function Loading() {
  return (
    <main className='absolute top-0 left-0 w-full h-full flex items-center justify-center z-50'>
      <div>
        <span className='sr-only'>Loading...</span>
        <Loader className='h-8 w-8 text-primary-background animate-spin' />
      </div>
    </main>
  );
}
