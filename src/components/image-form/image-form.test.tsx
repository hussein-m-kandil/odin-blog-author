import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { delay, image, mockAuthContext } from '@/test-utils';
import { userEvent } from '@testing-library/user-event';
import { ImageForm } from './image-form';

mockAuthContext();

const onSuccess = vi.fn();
const onFailed = vi.fn();

const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(() => {
  return new Promise<Response>((resolve) =>
    delay(() => resolve(Response.json(image)))
  );
});

beforeEach(() => vi.clearAllMocks);

describe('<ImageForm />', () => {
  it('should display upload form', () => {
    render(<ImageForm />);
    expect(screen.getByRole('form', { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('should display update form if given an image', () => {
    render(<ImageForm image={image} />);
    expect(screen.getByRole('form', { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('should use the given className and id', () => {
    const id = 'test-id';
    const className = 'test-class';
    render(<ImageForm className={className} id={id} />);
    const form = screen.getByRole('form');
    expect(form).toHaveClass(className);
    expect(form).toHaveAttribute('id', id);
  });

  it('should call the given `onFailed` when an error have occurred', async () => {
    const user = userEvent.setup();
    const error = new Error('test error');
    fetchMock.mockImplementationOnce(() => {
      throw error;
    });
    render(<ImageForm onFailed={onFailed} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button'));
    expect(onFailed).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onFailed.mock.calls[0][0]).toEqual(error);
  });

  it('should call the given `onFailed` on rejection', async () => {
    const user = userEvent.setup();
    const message = 'test error';
    fetchMock.mockImplementationOnce(() => Promise.reject(message));
    render(<ImageForm onFailed={onFailed} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button'));
    expect(onFailed).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onFailed.mock.calls[0][0]).toEqual(message);
  });

  it('should call the given `onSuccess` and not call `onFailed`', async () => {
    const user = userEvent.setup();
    render(<ImageForm onFailed={onFailed} onSuccess={onSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Image'), file);
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(onFailed).not.toHaveBeenCalled();
    expect(onSuccess.mock.calls[0][0]).toEqual(image);
  });
});
