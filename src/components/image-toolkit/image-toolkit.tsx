'use client';

import React from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ImageToolkitProps } from './image-toolkit.types';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Small } from '@/components/typography';
import { MoveVertical, Trash } from 'lucide-react';
import { useDrag } from '@/hooks/use-drag';
import { cn } from '@/lib/utils';

const CURSOR_CN = 'cursor-ns-resize';

const getImgYPos = (img: HTMLImageElement) => {
  const matches = (img.style.objectPosition || '50% 50%')
    .matchAll(/\d+/g)
    .toArray()
    .map(([match]) => match);
  return Number(matches[matches.length - 1]);
};

const setImgYPos = (img: HTMLImageElement, yPos: number) => {
  if (yPos > 100) img.style.objectPosition = '50% 100%';
  else if (yPos < 0) img.style.objectPosition = '50% 0%';
  else img.style.objectPosition = `50% ${yPos}%`;
};

export function ImageToolkit({
  onEnterUpdate,
  onEnterDelete,
  onUpdate,
  onDelete,
  imgRef,
  image,
}: ImageToolkitProps) {
  const [mode, setMode] = React.useState<'idle' | 'update' | 'delete'>('idle');

  const deleting = mode === 'delete';
  const updating = mode === 'update';
  const idle = mode === 'idle';

  const resetMode = React.useCallback(
    (cancel = false) => {
      setMode('idle');
      const img = imgRef.current;
      if (img) {
        if (updating && cancel) setImgYPos(img, image.yPos);
        img.classList.remove(CURSOR_CN);
        img.focus();
      }
    },
    [imgRef, image.yPos, updating]
  );

  const enterDelete = () => {
    setMode('delete');
    onEnterDelete?.();
  };

  const enterUpdate = () => {
    setMode('update');
    onEnterUpdate?.();
    imgRef.current?.classList.add(CURSOR_CN);
  };

  const updateImage = React.useCallback(() => {
    onUpdate({
      ...image,
      yPos: imgRef.current ? getImgYPos(imgRef.current) : image.yPos,
    });
    resetMode();
  }, [image, imgRef, onUpdate, resetMode]);

  const deleteImage = React.useCallback(() => {
    onDelete(image);
    resetMode();
  }, [image, onDelete, resetMode]);

  React.useEffect(() => {
    if (!idle) {
      const cancelMutation = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          resetMode(true);
        }
      };
      window.addEventListener('keydown', cancelMutation, true);
      return () => {
        window.removeEventListener('keydown', cancelMutation, true);
      };
    }
  }, [idle, resetMode]);

  React.useEffect(() => {
    if (updating) {
      const watchUpdates = (e: KeyboardEvent) => {
        if (['Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          const img = imgRef.current;
          if (img) {
            if (e.key === 'Enter') updateImage();
            else {
              setImgYPos(
                img,
                getImgYPos(img) + (e.key === 'ArrowDown' ? -1 : 1)
              );
            }
            img.focus();
          }
        }
      };
      window.addEventListener('keydown', watchUpdates, true);
      return () => {
        window.removeEventListener('keydown', watchUpdates, true);
      };
    }
  }, [updateImage, updating, imgRef]);

  useDrag({
    disabled: !updating,
    htmlElementRef: imgRef,
    onDrag: ({ deltaY }) => {
      const img = imgRef.current;
      if (img) {
        const scaleFactor = img.width / img.naturalWidth;
        const fullImgH = img.naturalHeight * scaleFactor;
        const minDY = fullImgH / 100;
        const absDY = Math.abs(deltaY);
        const dSign = deltaY / absDY;
        const dY = dSign * (absDY < minDY ? minDY : deltaY);
        const dYPercent = Math.ceil((dY * 100) / fullImgH);
        const newImgYPos = getImgYPos(img) - dYPercent;
        setImgYPos(img, newImgYPos);
      }
    },
  });

  const commonBtnProps: React.ComponentProps<typeof Button> = {
    size: 'sm',
    type: 'button',
    variant: 'ghost',
    className: 'py-0 px-2!',
  };

  return (
    <MotionConfig transition={{ duration: 0.35 }}>
      <AnimatePresence>
        {idle ? (
          <motion.div
            key={mode}
            exit={{ translateX: '100%' }}
            animate={{ translateX: '0%' }}
            initial={{ translateX: '100%' }}
            className='absolute top-0 right-0 flex flex-col p-2 space-y-2'>
            {[
              {
                className: 'text-destructive!',
                label: 'Delete the image',
                onClick: enterDelete,
                icon: <Trash />,
              },
              {
                className: '',
                label: 'Position the image',
                onClick: enterUpdate,
                icon: <MoveVertical />,
              },
            ].map(({ icon, label, className, onClick }) => (
              <Button
                key={label}
                size='icon'
                type='button'
                onClick={onClick}
                aria-label={label}
                variant='secondary'
                className={cn(
                  'p-1 rounded-full size-fit opacity-70 hover:opacity-100 focus-visible:opacity-100',
                  className
                )}>
                {icon}
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
            <div className='relative flex justify-between items-baseline px-2 py-1 text-foreground bg-background/75'>
              {deleting ? (
                <>
                  <Small className='text-xs'>
                    Do you want to delete this image?
                  </Small>
                  <div className='shrink-0 flex items-center space-x-1'>
                    <Button
                      {...commonBtnProps}
                      onClick={deleteImage}
                      className={cn(
                        commonBtnProps.className,
                        'text-destructive!'
                      )}>
                      Yes
                    </Button>
                    <Separator orientation='vertical' className='min-h-4' />
                    <Button {...commonBtnProps} onClick={() => resetMode()}>
                      No
                    </Button>
                  </div>
                </>
              ) : updating ? (
                <>
                  <Button {...commonBtnProps} onClick={updateImage}>
                    Save
                  </Button>
                  <Button
                    {...commonBtnProps}
                    onClick={() => resetMode()}
                    className={cn(
                      commonBtnProps.className,
                      'text-muted-foreground!'
                    )}>
                    Cancel
                  </Button>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default ImageToolkit;
