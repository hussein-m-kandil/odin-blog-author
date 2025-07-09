import React from 'react';
import { UseDragProps } from './use-drag.types';

export function useDrag({
  onDrag,
  htmlElementRef,
  disabled = false,
}: UseDragProps) {
  React.useEffect(() => {
    const htmlElement = htmlElementRef.current;
    if (!disabled && htmlElement) {
      let pointerDown = false;
      let deltaX = 0;
      let deltaY = 0;
      let x = 0;
      let y = 0;
      const cleanupFns: Array<() => void> = [];
      const startDrag = (e: MouseEvent) => {
        if (e.button === 0) {
          x = e.clientX;
          y = e.clientY;
          pointerDown = true;
        }
      };
      const endDrag = (e: MouseEvent) => {
        if (e.button === 0) {
          pointerDown = false;
          deltaX = 0;
          deltaY = 0;
          x = 0;
          y = 0;
        }
      };
      const dragImage = (e: MouseEvent) => {
        const currentX = e.clientX;
        const currentY = e.clientY;
        const currentDeltaX = currentX - x;
        const currentDeltaY = currentY - y;
        if (pointerDown && (currentDeltaY !== 0 || currentDeltaX !== 0)) {
          x = currentX;
          y = currentY;
          deltaX = currentDeltaX;
          deltaY = currentDeltaY;
          onDrag({ deltaY, deltaX }, e);
        }
      };
      if (window.PointerEvent) {
        const startPointerDrag = (e: PointerEvent) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          startDrag(e);
        };
        const dragPointer = (e: PointerEvent) => {
          e.preventDefault();
          dragImage(e);
        };
        const endPointerDrag = (e: PointerEvent) => {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          endDrag(e);
        };
        htmlElement.addEventListener('pointerdown', startPointerDrag);
        htmlElement.addEventListener('pointermove', dragPointer);
        htmlElement.addEventListener('pointerup', endPointerDrag);
        htmlElement.addEventListener('pointercancel', endPointerDrag);
        cleanupFns.push(() => {
          htmlElement.removeEventListener('pointerdown', startPointerDrag);
          htmlElement.removeEventListener('pointermove', dragPointer);
          htmlElement.removeEventListener('pointerup', endPointerDrag);
          htmlElement.removeEventListener('pointercancel', endPointerDrag);
        });
      } else {
        htmlElement.addEventListener('mousedown', startDrag);
        htmlElement.addEventListener('mousemove', dragImage);
        htmlElement.addEventListener('mouseup', endDrag);
        cleanupFns.push(() => {
          htmlElement.removeEventListener('mousedown', startDrag);
          htmlElement.removeEventListener('mousemove', dragImage);
          htmlElement.removeEventListener('mouseup', endDrag);
        });
      }
      if (window.TouchEvent) {
        const preventTouchScroll = (e: TouchEvent) => {
          if (e.target === htmlElement) {
            e.preventDefault();
            e.stopPropagation();
          }
        };
        const opts = { passive: false, capture: true } as EventListenerOptions;
        htmlElement.addEventListener('touchstart', preventTouchScroll, opts);
        cleanupFns.push(() => {
          htmlElement.removeEventListener(
            'touchstart',
            preventTouchScroll,
            opts
          );
        });
      }
      const preventDefaultDrag = (e: DragEvent) => {
        e.preventDefault();
      };
      htmlElement.addEventListener('dragstart', preventDefaultDrag);
      cleanupFns.push(() => {
        htmlElement.removeEventListener('dragstart', preventDefaultDrag);
      });
      return () => {
        cleanupFns.forEach((fn) => fn());
      };
    }
  }, [htmlElementRef, disabled, onDrag]);
}
