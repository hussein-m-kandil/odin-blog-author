'use client';

import React from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { Plus } from 'lucide-react';
import { H1 } from '../typography/h1';
import { Button } from '../ui/button';
import { PostForm } from '../post-form';
import { usePathname } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

export function Navbar({ user = null }: { user?: User | null }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <nav className='flex items-center justify-between p-4 shadow-sm shadow-secondary'>
      <H1 className='text-3xl'>
        <Link href='/'>Odin Blog Author</Link>
      </H1>
      {user ? (
        <div className='flex items-center gap-4'>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type='button'
                title='Create new post'
                aria-label='Create new post'>
                <Plus className='size-5 stroke-3' />
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-lg'>
              <DialogHeader>
                <DialogTitle className='text-xl font-bold'>
                  Create a New Post
                </DialogTitle>
                <DialogDescription>
                  Create a new blog post here. Click &quot;Create Post&quot;
                  when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <PostForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <form
            action={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signout`}
            method='post'>
            <Button type='submit' className='font-bold'>
              Sign out
            </Button>
          </form>
        </div>
      ) : (
        <Button type='button' asChild>
          {pathname === '/signin' ? (
            <Link href='/signup'>Sign up</Link>
          ) : (
            <Link href='/signin'>Sign in</Link>
          )}
        </Button>
      )}
    </nav>
  );
}

export default Navbar;
