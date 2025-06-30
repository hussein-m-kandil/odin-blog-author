'use client';

import React from 'react';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

export function Img({
  src,
  alt,
  onLoad,
  fallback,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Image>, 'src'> & {
  src?: string | StaticImport | null;
  fallback: React.ReactNode;
}) {
  const [loading, setLoading] = React.useState(true);

  return (
    <>
      {src && (
        <Image
          {...props}
          src={src}
          alt={alt}
          onLoad={(e) => (setLoading(false), onLoad?.(e))}
          className={loading ? 'absolute opacity-0 -z-50' : className}
        />
      )}
      {(!src && fallback) ||
        (loading && <span className='animate-pulse'>{fallback}</span>)}
    </>
  );
}

export default Img;
