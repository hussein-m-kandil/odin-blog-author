import React from 'react';
import { Post } from '@/types';
import { P } from '@/components/typography/p';
import { Button } from '@/components/ui/button';
import { Loader2, PanelLeftClose, Trash2 } from 'lucide-react';
import { getResErrorMessageOrThrow, getUnknownErrorMessage } from '@/lib/utils';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function DeletePostForm({
  post,
  onCancel,
  onSuccess,
  ...formProps
}: React.ComponentProps<'form'> & {
  post: Post;
  onSuccess: () => void;
  onCancel: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const apiRes = await fetch(`${apiBaseUrl}/posts/${post.id}`, {
        method: 'DELETE',
      });
      if (apiRes.ok) {
        return onSuccess();
      } else {
        setErrorMessage(await getResErrorMessageOrThrow(apiRes));
      }
    } catch (error) {
      setErrorMessage(getUnknownErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      {...formProps}
      onSubmit={handleSubmit}
      aria-label={`Delete confirmation form for ${post.title}`}>
      {errorMessage && (
        <P className='text-destructive text-sm text-center'>{errorMessage}</P>
      )}
      <P>
        Do you really want to delete &quot;
        <span className='font-bold'>{`${post.title.slice(0, 21)}${
          post.title.length > 24 ? '...' : ''
        }`}</span>
        &quot;?
      </P>
      <div className='flex justify-end gap-4 mt-5'>
        <Button
          type='reset'
          variant='outline'
          onClick={onCancel}
          disabled={submitting}
          aria-description={`Cancel the deletion of ${post.title}`}>
          <PanelLeftClose />
          Cancel
        </Button>
        <Button
          type='submit'
          variant='destructive'
          disabled={submitting}
          aria-description={`Delete ${post.title}`}>
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

export default DeletePostForm;
