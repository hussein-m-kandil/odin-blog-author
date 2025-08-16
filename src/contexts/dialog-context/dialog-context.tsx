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
  // React interpret function state-value as state initializer/updater
  // So, initialize/update function state-value via a wrapper function
  const [shouldHide, setShouldHide] = React.useState(() => initShouldHideFn);
  const [dialogData, setDialogData] = React.useState<DialogData>(initData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const overlayRef = React.useRef<HTMLDivElement>(null);

  const contextValue: DialogContextValue = {
    showDialog: (data: DialogData, shouldHideDialog) => {
      setShouldHide(() => shouldHideDialog || initShouldHideFn);
      setIsDialogOpen(true);
      setDialogData(data);
    },
    hideDialog: () => setIsDialogOpen(false),
  };

  const handleOpenChange = async (open: boolean) => {
    const hide = await shouldHide();
    setIsDialogOpen(open === false ? !hide : open);
  };

  const handleOverlayInteraction: React.ComponentProps<
    typeof DialogContent
  >['onInteractOutside'] = (e) => {
    const overlay = overlayRef.current;
    if (overlay && !overlay.isEqualNode(e.target as Node)) {
      e.preventDefault();
    }
  };

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
            className='sm:max-w-lg max-h-[calc(100vh-2rem)] overflow-auto'>
            <DialogHeader>
              <DialogTitle className='text-xl font-bold'>
                {dialogData.title}
              </DialogTitle>
              <DialogDescription>{dialogData.description}</DialogDescription>
            </DialogHeader>
            {dialogData.body}
            <DialogFooter>{dialogData.footer}</DialogFooter>
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
