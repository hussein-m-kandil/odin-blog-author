import React from 'react';
import { ErrorMessage } from '@/components/error-message';
import { PanelLeftClose, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { P } from '@/components/typography/p';
import { Loader } from '@/components/loader';

export function DeleteForm({
  errorMessage = '',
  deleting = false,
  subject,
  onCancel,
  onDelete,
  children,
  ...formProps
}: Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  errorMessage?: string;
  deleting?: boolean;
  subject: string;
  onDelete?: () => void;
  onCancel?: () => void;
}) {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onDelete?.();
  };

  return (
    <form
      {...formProps}
      method='dialog'
      onSubmit={handleSubmit}
      aria-label={`Delete confirmation form for ${subject}`}>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      {children || (
        <P className='max-sm:text-center'>
          Do you really want to delete
          <span className='font-bold'>{` "${
            subject.length > 24 ? subject.slice(0, 21) + '...' : subject
          }"`}</span>
          ?
        </P>
      )}
      <div className='flex justify-end max-[320px]:flex-col max-sm:justify-center gap-4 mt-5 *:min-w-26'>
        <Button
          type='reset'
          variant='outline'
          disabled={deleting}
          onClick={() => onCancel?.()}>
          <PanelLeftClose />
          Cancel
        </Button>
        <Button type='submit' variant='destructive' disabled={deleting}>
          {deleting ? (
            <>
              <Loader /> Deleting
            </>
          ) : (
            <>
              <Trash2 /> Delete
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default DeleteForm;
