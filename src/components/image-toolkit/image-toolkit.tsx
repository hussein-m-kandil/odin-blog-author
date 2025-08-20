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
const DEFAULT_OBJ_POS = '50% 50%';
const DEFAULT_OBJ_FIT = 'cover';

const getImgYPos = (img: HTMLImageElement) => {
  const matches = (img.style.objectPosition || DEFAULT_OBJ_POS)
    .matchAll(/\d+/g)
    .toArray()
    .map(([match]) => match);
  return Number(matches[matches.length - 1]);
};

const setImgYPos = (img: HTMLImageElement, yPos: number) => {
  img.style.objectPosition = `50% ${yPos}%`;
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
  const [initImgObjPos, setInitImgObjPos] = React.useState('');

  React.useEffect(() => {
    if (imgRef.current) {
      if (!imgRef.current.style.objectFit) {
        imgRef.current.style.objectFit = DEFAULT_OBJ_FIT;
      }
      if (!imgRef.current.style.objectPosition) {
        imgRef.current.style.objectPosition = DEFAULT_OBJ_POS;
      }
      setInitImgObjPos(imgRef.current.style.objectPosition);
    }
  }, [imgRef]);

  const deleting = mode === 'delete';
  const updating = mode === 'update';
  const idle = mode === 'idle';

  const resetMode = React.useCallback(
    (options = { cancelPosition: false }) => {
      setMode('idle');
      const img = imgRef.current;
      if (img) {
        if (options.cancelPosition) {
          img.style.objectPosition = initImgObjPos;
        }
        img.classList.remove(CURSOR_CN);
        img.focus();
      }
    },
    [imgRef, initImgObjPos]
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
          resetMode({ cancelPosition: true });
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
            if (e.key === 'Enter') {
              updateImage();
            } else if (e.key === 'ArrowDown') {
              const oldY = getImgYPos(img);
              const newY = oldY === 0 ? 100 : oldY - 1;
              setImgYPos(img, newY);
            } else if (e.key === 'ArrowUp') {
              const oldY = getImgYPos(img);
              const newY = oldY === 100 ? 0 : oldY + 1;
              setImgYPos(img, newY);
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
    onDrag: ({ deltaY: pointerDY }) => {
      const img = imgRef.current;
      if (img) {
        const scaleFactor = img.width / img.naturalWidth;
        const fullImgH = img.naturalHeight * scaleFactor;
        const minImgDY = fullImgH / 100;
        const absPDY = Math.abs(pointerDY);
        const dYSign = absPDY !== 0 ? pointerDY / absPDY : 1;
        const dY = dYSign * (absPDY < minImgDY ? minImgDY : absPDY);
        const dYPercent = Math.round((dY * 100) / fullImgH);
        const oldYPos = getImgYPos(img);
        const newYPos = oldYPos - dYPercent;
        const clampedYPos = Math.min(100, Math.max(0, newYPos));
        setImgYPos(img, clampedYPos);
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
                    onClick={() => resetMode({ cancelPosition: true })}
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
