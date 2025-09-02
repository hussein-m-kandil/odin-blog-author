import { Loader } from '@/components/loader';

export default function Loading() {
  return (
    <main className='absolute top-0 left-0 w-full h-full flex items-center justify-center z-50'>
      <div>
        <Loader className='h-8 w-8' />
      </div>
    </main>
  );
}
