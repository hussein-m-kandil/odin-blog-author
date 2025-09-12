'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogOverlay,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export interface DialogData {
  body: React.ReactNode;
  title: React.ReactNode;
  footer?: React.ReactNode;
  description: React.ReactNode;
}

const initShouldHideFn: () => Promise<boolean> | boolean = () => true;

export interface DialogContextValue {
  showDialog: (
    data: DialogData,
    shouldHideDialog?: typeof initShouldHideFn
  ) => void;
  hideDialog: () => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

const initData: DialogData = {
  title: 'Dialog title',
  footer: 'Dialog footer',
  description: 'Dialog description',
  body: 'You need to proved you dialog data to the `showDialog` function',
};

export function DialogProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [dialogData, setDialogData] = React.useState<DialogData>(initData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const overlayRef = React.useRef<HTMLDivElement>(null);
  const shouldHideRef = React.useRef(initShouldHideFn);
  const urlRef = React.useRef<URL>(null);

  const router = useRouter();

  React.useEffect(() => {
    if (!isDialogOpen) return;
    const hideOnPosState = () => setIsDialogOpen(false);
    window.addEventListener('popstate', hideOnPosState);
    return () => window.removeEventListener('popstate', hideOnPosState);
  }, [isDialogOpen]);

  const showDialog: DialogContextValue['showDialog'] = (
    data: DialogData,
    shouldHideDialog
  ) => {
    setDialogData(data);
    setIsDialogOpen(true);
    shouldHideRef.current = shouldHideDialog || initShouldHideFn;
    urlRef.current = new URL(window.location.href);
    router.push('#dialog', { scroll: false });
  };

  const hideDialog: DialogContextValue['hideDialog'] = () => {
    setDialogData(initData);
    setIsDialogOpen(false);
    shouldHideRef.current = initShouldHideFn;
    window.setTimeout(() => {
      const oldURl = urlRef.current;
      if (oldURl) {
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = oldURl.hash;
        if (currentUrl.href == oldURl.href) {
          router.replace(oldURl.hash, { scroll: false });
        }
      }
    }, 500);
  };

  const handleOpenChange = async (open: boolean) => {
    const canHide = await shouldHideRef.current();
    if (!open === canHide) hideDialog();
  };

  const handleOverlayInteraction: React.ComponentProps<
    typeof DialogContent
  >['onInteractOutside'] = (e) => {
    const overlay = overlayRef.current;
    if (overlay && !overlay.isEqualNode(e.target as Node)) {
      e.preventDefault();
    }
  };

  const contextValue: DialogContextValue = { showDialog, hideDialog };

  return (
    <DialogContext value={contextValue}>
      {children}
      <Dialog
        key={Date.now()}
        open={isDialogOpen}
        onOpenChange={handleOpenChange}>
        <DialogOverlay ref={overlayRef}>
          <DialogContent
            onInteractOutside={handleOverlayInteraction}
            onPointerDownOutside={handleOverlayInteraction}
            className='sm:max-w-lg max-h-dvh overflow-auto gap-0'>
            <DialogHeader>
              <DialogTitle className='text-xl font-bold'>
                {dialogData.title}
              </DialogTitle>
              <DialogDescription>{dialogData.description}</DialogDescription>
            </DialogHeader>
            {dialogData.body}
            {dialogData.footer && (
              <DialogFooter>{dialogData.footer}</DialogFooter>
            )}
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </DialogContext>
  );
}

export function useDialog() {
  const dialog = React.useContext(DialogContext);

  if (!dialog) {
    throw new Error('`useDialog` must be called within `DialogProvider`');
  }

  return dialog;
}
