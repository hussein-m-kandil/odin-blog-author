import React from 'react';
import { AxiosResponse } from 'axios';
import { P } from '@/components/typography/p';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/error-message';
import { Loader2, PanelLeftClose, Trash2 } from 'lucide-react';
import { getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';

export function DeleteForm({
  subject,
  delReqFn,
  onCancel,
  onSuccess,
  ...formProps
}: Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  delReqFn: () => Promise<AxiosResponse> | AxiosResponse;
  onCancel: React.MouseEventHandler<HTMLButtonElement>;
  onSuccess?: (res: AxiosResponse) => void;
  subject: string;
}) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const delRes = await delReqFn();
      onSuccess?.(delRes);
    } catch (error) {
      setErrorMessage(
        parseAxiosAPIError(error).message || getUnknownErrorMessage(error)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      {...formProps}
      onSubmit={handleSubmit}
      aria-label={`Delete confirmation form for ${subject}`}>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <P>
        Do you really want to delete
        <span className='font-bold'>{` "${
          subject.length > 24 ? subject.slice(0, 21) + '...' : subject
        }"`}</span>
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
