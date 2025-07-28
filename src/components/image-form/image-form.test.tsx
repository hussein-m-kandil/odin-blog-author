import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { image, initAuthData } from '@/test-utils';
import { axiosMock } from '@/__mocks__/axios';
import { ImageForm } from './image-form';

describe('<ImageForm />', () => {
  const onSuccess = vi.fn();
  const onFailed = vi.fn();

  const ImageFormWrapper = (props: React.ComponentProps<typeof ImageForm>) => {
    return (
      <AuthProvider initAuthData={initAuthData}>
        <ImageForm {...props} />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    axiosMock.onPost().reply(200, image);
    vi.clearAllMocks();
  });

  it('should display upload form', () => {
    render(<ImageFormWrapper />);
    expect(screen.getByRole('form', { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('should display update form if given an image', () => {
    render(<ImageFormWrapper image={image} />);
    expect(screen.getByRole('form', { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('should use the given className and id', () => {
    const id = 'test-id';
    const className = 'test-class';
    render(<ImageFormWrapper className={className} id={id} />);
    const form = screen.getByRole('form');
    expect(form).toHaveClass(className);
    expect(form).toHaveAttribute('id', id);
  });

  it('should call the given `onFailed` when an error have occurred', async () => {
    const user = userEvent.setup();
    axiosMock.onPost().networkError();
    render(<ImageFormWrapper onFailed={onFailed} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button'));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/uploading/i));
    expect(onFailed).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should call the given `onFailed` on rejection', async () => {
    const message = 'test error';
    const user = userEvent.setup();
    axiosMock.onPost().reply(400, message);
    render(<ImageFormWrapper onFailed={onFailed} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button'));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/uploading/i));
    expect(onFailed).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onFailed.mock.calls[0][0].response.data).toEqual(message);
  });

  it('should call the given `onSuccess` and not call `onFailed`', async () => {
    const user = userEvent.setup();
    render(<ImageFormWrapper onFailed={onFailed} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button'));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/uploading/i));
    expect(onFailed).not.toHaveBeenCalled();
    expect(onSuccess.mock.calls[0][0]).toEqual(image);
  });
});
