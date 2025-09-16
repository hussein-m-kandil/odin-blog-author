'use client';

import React from 'react';
import Image from 'next/image';
import { MutableImageSkeleton } from './mutable-image.skeleton';
import { ImageToolkit } from '@/components/image-toolkit';
import { MutableImageProps } from './mutable-image.types';
import { cn, setURlParams } from '@/lib/utils';

export function MutableImage({
  image,
  mutation,
  className,
  ...props
}: MutableImageProps) {
  const [loading, setLoading] = React.useState(!!image);

  const imgRef = React.useRef<HTMLImageElement>(null);

  return (
    <div
      {...props}
      className={cn(
        'relative w-full aspect-video my-2 overflow-hidden',
        className
      )}>
      {image ? (
        <Image
          fill
          priority
          tabIndex={0}
          ref={imgRef}
          alt={image.alt || ''}
          onLoad={() => setLoading(false)}
          className={cn(loading && 'absolute opacity-0 -z-50')}
          // 1024px is the max width of `main` in post page
          sizes='(max-width: 1024px) 100vw, 1024px'
          src={
            // Use image update time to revalidate the "painful" browser-cache ;)
            image.updatedAt
              ? setURlParams(image.src, { updatedAt: image.updatedAt })
              : image.src
          }
          style={{
            objectPosition: `50% ${image.yPos}%`,
            objectFit: 'cover',
          }}
        />
      ) : (
        <MutableImageSkeleton
          className='m-0 animate-none'
          aria-label='Image placeholder'
        />
      )}
      {loading ? (
        <MutableImageSkeleton className='m-0' />
      ) : (
        mutation && (
          <ImageToolkit
            onReset={mutation.reset}
            onDelete={mutation.delete}
            onUpdate={mutation.update}
            imgRef={imgRef}
            image={image}
          />
        )
      )}
    </div>
  );
}

export default MutableImage;
