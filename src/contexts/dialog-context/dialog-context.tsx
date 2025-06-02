'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export interface DialogData {
  body: React.ReactNode;
  title: React.ReactNode;
  footer?: React.ReactNode;
  description: React.ReactNode;
}

export interface DialogContextValue {
  showDialog: (data: DialogData) => void;
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

  const showDialog = (data: DialogData) => {
    setDialogData(data);
    setIsDialogOpen(true);
  };

  const hideDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <DialogContext value={{ showDialog, hideDialog }}>
      {children}
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        key={Date.now()}>
        <DialogContent className='sm:max-w-lg max-h-[calc(100vh-2rem)] overflow-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold'>
              {dialogData.title}
            </DialogTitle>
            <DialogDescription>{dialogData.description}</DialogDescription>
          </DialogHeader>
          {dialogData.body}
          <DialogFooter>{dialogData.footer}</DialogFooter>
        </DialogContent>
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
