'use client';

import React from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { MoveVertical, RefreshCcw, Trash } from 'lucide-react';
import { ImageToolkitProps } from './image-toolkit.types';
import { Separator } from '@/components/ui/separator';
import { cn, wrapNum, clampNum } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Small } from '@/components/typography';
import { useDrag } from '@/hooks/use-drag';

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
  onEnterReset,
  onUpdate,
  onDelete,
  onReset,
  imgRef,
  image,
}: ImageToolkitProps) {
  const [mode, setMode] = React.useState<
    'update' | 'delete' | 'reset' | 'idle'
  >('idle');

  const initImgObjPosRef = React.useRef<string>('');

  React.useEffect(() => {
    if (imgRef.current) {
      if (!imgRef.current.style.objectFit) {
        imgRef.current.style.objectFit = DEFAULT_OBJ_FIT;
      }
      if (!imgRef.current.style.objectPosition) {
        imgRef.current.style.objectPosition = DEFAULT_OBJ_POS;
      }
      initImgObjPosRef.current = imgRef.current.style.objectPosition;
    }
  }, [imgRef]);

  const updating = mode === 'update';
  const deleting = mode === 'delete';
  const resetting = mode === 'reset';
  const idle = mode === 'idle';

  const resetMode = React.useCallback(
    (options = { cancelPosition: false }) => {
      setMode('idle');
      const img = imgRef.current;
      if (img) {
        if (options.cancelPosition) {
          img.style.objectPosition = initImgObjPosRef.current;
        }
        img.classList.remove(CURSOR_CN);
        img.focus();
      }
    },
    [imgRef, initImgObjPosRef]
  );

  const enterDelete = () => {
    setMode('delete');
    onEnterDelete?.();
  };

  const enterUpdate = () => {
    setMode('update');
    onEnterUpdate?.();
    if (imgRef.current) {
      initImgObjPosRef.current = imgRef.current.style.objectPosition;
      imgRef.current.classList.add(CURSOR_CN);
    }
  };

  const enterReset = () => {
    setMode('reset');
    onEnterReset?.();
  };

  const updateImage = React.useCallback(() => {
    resetMode();
    if (imgRef.current) {
      const yPos = getImgYPos(imgRef.current);
      onUpdate({ ...(image || {}), yPos });
    }
  }, [image, imgRef, onUpdate, resetMode]);

  const deleteImage = () => {
    resetMode();
    onDelete();
  };

  const resetImage = () => {
    resetMode();
    onReset();
  };

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
              setImgYPos(img, wrapNum(getImgYPos(img), -1, 0, 100));
            } else if (e.key === 'ArrowUp') {
              setImgYPos(img, wrapNum(getImgYPos(img), 1, 0, 100));
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
        const absPDY = Math.abs(pointerDY);
        const dYSign = absPDY !== 0 ? pointerDY / absPDY : 1;
        const dYPercent = dYSign * Math.ceil((absPDY * 100) / img.height);
        setImgYPos(img, clampNum(getImgYPos(img) - dYPercent, 0, 100));
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
            className='absolute top-0 right-0 z-30 flex flex-col p-2 space-y-2'>
            {[
              ...(image
                ? [
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
                  ]
                : []),
              {
                className: '',
                label: 'Reset the image',
                onClick: enterReset,
                icon: <RefreshCcw />,
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
            exit={{ translateY: '-100%' }}
            animate={{ translateY: '0%' }}
            initial={{ translateY: '-100%' }}
            className={cn(
              'absolute top-0 left-0 w-full backdrop-blur-xs text-foreground bg-background/75',
              'z-30 flex justify-between items-baseline px-2 py-1'
            )}>
            {deleting || resetting ? (
              <>
                <Small className='text-xs'>
                  Do you want to {mode} this image?
                </Small>
                <div className='shrink-0 flex items-center space-x-1'>
                  <Button
                    {...commonBtnProps}
                    onClick={deleting ? deleteImage : resetImage}
                    className={cn(
                      commonBtnProps.className,
                      'text-destructive!'
                    )}>
                    Yes
                  </Button>
                  <Separator orientation='vertical' className='min-h-4' />
                  <Button
                    autoFocus
                    {...commonBtnProps}
                    onClick={() => resetMode()}>
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
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default ImageToolkit;
