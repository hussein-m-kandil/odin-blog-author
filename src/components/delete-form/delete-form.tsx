import React from 'react';
import { P } from '@/components/typography/p';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/error-message';
import { Loader2, PanelLeftClose, Trash2 } from 'lucide-react';

export interface DeleteFormProps extends React.ComponentProps<'form'> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onCancel: React.MouseEventHandler<HTMLButtonElement>;
  errorMessage?: string;
  subject?: string;
}

export function DeleteForm({
  errorMessage,
  subject,
  onCancel,
  onSubmit,
  ...formProps
}: DeleteFormProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    ...args
  ) => {
    setSubmitting(true);
    await onSubmit(...args);
    setSubmitting(false);
  };

  return (
    <form
      {...formProps}
      onSubmit={handleSubmit}
      aria-label={`Delete confirmation form${
        subject ? ' for ' + subject : ''
      }`}>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <P>
        Do you really want to delete
        {subject && (
          <span className='font-bold'>{` "${
            subject.length > 24 ? subject.slice(0, 21) + '...' : subject
          }"`}</span>
        )}
        ?
      </P>
      <div className='flex justify-end gap-4 mt-5'>
        <Button
          type='reset'
          variant='outline'
          onClick={onCancel}
          disabled={submitting}>
          <PanelLeftClose />
          Cancel
        </Button>
        <Button type='submit' variant='destructive' disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className='animate-spin' /> Deleting
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
