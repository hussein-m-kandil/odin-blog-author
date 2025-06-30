'use client';

import React from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { Separator } from '@/components/ui/separator';
import { ImageIcon, Move, Trash } from 'lucide-react';
import { cn, loadSupabaseImg } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Small } from '@/components/typography';
import { Image as ImageType } from '@/types';

export function MutableImage({ image }: { image?: ImageType | null }) {
  const isImage = !!image;

  const [yPos, setYPos] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(isImage);
  const [mode, setMode] = React.useState<'idle' | 'editing' | 'deleting'>(
    'idle'
  );

  const resetState = () => setMode('idle');

  const commonBtnProps: React.ComponentProps<typeof Button> = {
    size: 'sm',
    type: 'button',
    variant: 'ghost',
  };
  const btnCN = 'p-2';

  return (
    <div
      onDragCapture={(e) => {
        if (isImage && mode === 'editing') {
          e.preventDefault();
          e.stopPropagation();
          setYPos(e.nativeEvent.clientY + yPos);
          console.log(e.nativeEvent);
        }
      }}
      className={cn(
        'relative w-full aspect-video my-2 bg-muted-foreground text-background overflow-hidden',
        mode === 'editing' && 'cursor-move'
      )}>
      {isImage && (
        <Image
          fill
          alt={image?.alt || ''}
          loader={loadSupabaseImg}
          style={{ objectFit: 'cover', objectPosition: `center ${yPos}px` }}
          onLoad={() => setIsLoading(false)}
          className={cn(isLoading && 'absolute opacity-0 -z-50')}
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          // src={`${image.src}?now=${Date.now()}`} // Force the browser to refetch it, in case of update under the same source url
          src={image.src}
        />
      )}
      {(!isImage || isLoading) && (
        <ImageIcon
          className={cn(
            'absolute top-1/2 left-1/2 -translate-1/2 w-1/3 h-1/3 text-muted',
            isLoading && 'animate-pulse'
          )}
        />
      )}
      <MotionConfig transition={{ duration: 0.35 }}>
        <AnimatePresence>
          {isImage &&
            !isLoading &&
            (mode === 'idle' ? (
              <motion.div
                key={mode}
                exit={{ translateX: '100%' }}
                animate={{ translateX: '0%' }}
                initial={{ translateX: '100%' }}
                className='absolute top-0 right-0 flex flex-col p-2 space-y-2'>
                {[
                  {
                    onClick: () => setMode('deleting'),
                    className: 'text-destructive!',
                    icon: <Trash />,
                    label: 'Delete the image',
                  },
                  {
                    onClick: () => setMode('editing'),
                    className: '',
                    icon: <Move />,
                    label: 'Move the image',
                  },
                ].map((btnData) => (
                  <Button
                    size='icon'
                    type='button'
                    variant='secondary'
                    key={btnData.label}
                    aria-label={btnData.label}
                    className={cn(
                      btnCN,
                      btnData.className,
                      'rounded-full p-1 size-fit opacity-70 hover:opacity-100 focus-visible:opacity-100 *:size-2.5!'
                    )}
                    onClick={btnData.onClick}>
                    {btnData.icon}
                  </Button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                className='relative'
                exit={{ translateY: '-100%' }}
                animate={{ translateY: '0%' }}
                initial={{ translateY: '-100%' }}>
                <span className='absolute top-0 left-0 w-full h-full backdrop-blur-xs'></span>
                <div className='relative flex justify-between items-center p-2 text-foreground bg-background/75'>
                  {mode === 'deleting' ? (
                    <>
                      <Small>Do you want to delete this image?</Small>
                      <div className='relative *:first:me-2 *:last:ms-2'>
                        <Button
                          {...commonBtnProps}
                          className={cn(btnCN, 'text-destructive!')}
                          onClick={resetState}>
                          Yes
                        </Button>
                        <Separator
                          orientation='vertical'
                          className='absolute top-1/2 left-1/2 -translate-1/2 h-full'
                        />
                        <Button
                          className={btnCN}
                          {...commonBtnProps}
                          onClick={resetState}>
                          No
                        </Button>
                      </div>
                    </>
                  ) : mode === 'editing' ? (
                    <>
                      <Button
                        {...commonBtnProps}
                        className={btnCN}
                        onClick={resetState}>
                        Save
                      </Button>
                      <Button
                        className={cn(btnCN, 'text-muted-foreground!')}
                        {...commonBtnProps}
                        onClick={resetState}>
                        Cancel
                      </Button>
                    </>
                  ) : null}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}

export default MutableImage;
