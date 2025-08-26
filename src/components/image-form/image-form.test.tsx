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
  const onError = vi.fn();

  const ImageFormWrapper = (props: React.ComponentProps<typeof ImageForm>) => {
    return (
      <AuthProvider initAuthData={initAuthData}>
        <ImageForm {...props} />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onPost().reply(200, image);
    axiosMock.onPut().reply(200, image);
    vi.clearAllMocks();
  });

  it('should display upload form', () => {
    render(<ImageFormWrapper />);
    const form = screen.getByRole('form', { name: /upload/i });
    const submitter = screen.getByRole('button', { name: /upload/i });
    expect(form).toBeInTheDocument();
    expect(submitter).toBeDisabled();
    expect(submitter).toHaveAttribute('type', 'submit');
  });

  it('should display upload form if given an image', () => {
    render(<ImageFormWrapper image={image} />);
    const form = screen.getByRole('form', { name: /update/i });
    const submitter = screen.getByRole('button', { name: /update/i });
    expect(form).toBeInTheDocument();
    expect(submitter).toBeDisabled();
    expect(submitter).toHaveAttribute('type', 'submit');
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
    render(<ImageFormWrapper onError={onError} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button', { name: /upload/i }));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/uploading/i));
    expect(onError).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should call the given `onFailed` on rejection', async () => {
    const message = 'test error';
    const user = userEvent.setup();
    axiosMock.onPost().reply(400, message);
    render(<ImageFormWrapper onError={onError} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button', { name: /upload/i }));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/uploading/i));
    expect(onError).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError.mock.calls[0][0].response.data).toEqual(message);
  });

  it('should call the given `onSuccess` and not call `onFailed`', async () => {
    const user = userEvent.setup();
    render(<ImageFormWrapper onError={onError} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button', { name: /upload/i }));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/uploading/i));
    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess.mock.calls[0][0]).toEqual(image);
  });

  it('should add-avatar form has label of Avatar', () => {
    const props = { onError, onSuccess, isAvatar: true };
    render(<ImageFormWrapper {...props} />);
    expect(screen.getByRole('form', { name: /avatar/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Avatar')).toBeInTheDocument();
  });

  it('should update-avatar form has label of Avatar', () => {
    const props = { image, onError, onSuccess, isAvatar: true };
    render(<ImageFormWrapper {...props} />);
    expect(screen.getByRole('form', { name: /avatar/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Avatar')).toBeInTheDocument();
  });

  it('should add the `userid` field to request data if it is add-avatar form', async () => {
    const user = userEvent.setup();
    const props = { onError, onSuccess, isAvatar: true };
    render(<ImageFormWrapper {...props} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button', { name: /upload/i }));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/uploading/i));
    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess.mock.calls[0][0]).toEqual(image);
    expect(axiosMock.history).toHaveLength(1);
    expect(axiosMock.history.post[0].data).toHaveProperty(
      'userid',
      initAuthData.user!.id
    );
  });

  it('should add the `userid` field to request data if it is update-avatar form', async () => {
    const user = userEvent.setup();
    const props = { image, onError, onSuccess, isAvatar: true };
    render(<ImageFormWrapper {...props} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button', { name: /upload/i }));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/uploading/i));
    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess.mock.calls[0][0]).toEqual(image);
    expect(axiosMock.history).toHaveLength(1);
    expect(axiosMock.history.put[0].data).toHaveProperty(
      'userid',
      initAuthData.user!.id
    );
  });
});
