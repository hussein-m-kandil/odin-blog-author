'use client';

import React from 'react';
import Image from 'next/image';
import { MutableImageSkeleton } from './mutable-image.skeleton';
import { ImageToolkit } from '@/components/image-toolkit';
import { MutableImageProps } from './mutable-image.types';
import { cn, loadSupabaseImg } from '@/lib/utils';

export function MutableImage({
  image,
  mutation,
  className,
  ...props
}: MutableImageProps) {
  const [loading, setLoading] = React.useState(!!image);

  const imgRef = React.useRef<HTMLImageElement>(null);

  if (!image && !props['aria-label']) props['aria-label'] = 'Image placeholder';

  return (
    <>
      {(!image || loading) && (
        <MutableImageSkeleton
          {...props}
          className={cn(!image && 'animate-none', className)}
        />
      )}
      {image && (
        <div
          {...props}
          className={cn(
            'relative w-full aspect-video my-2 bg-muted-foreground text-background overflow-hidden',
            className,
            loading && 'hidden'
          )}>
          <Image
            fill
            priority
            tabIndex={0}
            ref={imgRef}
            alt={image.alt || ''}
            loader={loadSupabaseImg}
            onLoad={() => setLoading(false)}
            src={`${image.src}${mutation ? '?now=' + Date.now() : ''}`} // Force the browser to refetch it, if under mutation
            className={cn(loading && 'absolute opacity-0 -z-50')}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            style={{
              objectPosition: `${image.xPos}% ${image.yPos}%`,
              objectFit: 'cover',
            }}
          />
          {!loading && mutation && (
            <ImageToolkit
              onDelete={mutation.delete}
              onUpdate={mutation.update}
              imgRef={imgRef}
              image={image}
            />
          )}
        </div>
      )}
    </>
  );
}

export default MutableImage;
