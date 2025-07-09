'use client';

import React from 'react';
import Image from 'next/image';
import { ImageToolkit } from '@/components/image-toolkit';
import { MutableImageProps } from './mutable-image.types';
import { cn, loadSupabaseImg } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

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
        'relative w-full aspect-video my-2 bg-muted-foreground text-background overflow-hidden',
        className
      )}>
      {(!image || loading) && (
        <ImageIcon
          aria-label='Image placeholder icon'
          className={cn(
            'absolute top-1/2 left-1/2 -translate-1/2 w-1/3 h-1/3 text-muted',
            loading && 'animate-pulse'
          )}
        />
      )}
      {image && (
        <>
          <Image
            fill
            tabIndex={0}
            ref={imgRef}
            alt={image.alt || ''}
            loader={loadSupabaseImg}
            onLoad={() => setLoading(false)}
            src={`${image.src}?now=${Date.now()}`} // Force the browser to refetch it, in case of update under the same source url
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
        </>
      )}
    </div>
  );
}

export default MutableImage;
