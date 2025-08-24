import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useImageInputState } from './use-image-input-state';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ImageInput } from './image-input';
import { image } from '@/test-utils';
import { Toaster } from 'sonner';

const LABEL = 'Image';

const getUploadPercentMock = vi.fn(() => -1);

let currentImageFile: File | null;

const ImageInputWrapper = (
  props: Omit<
    React.ComponentProps<typeof ImageInput>,
    | 'ref'
    | 'newImage'
    | 'submitting'
    | 'uploadPercent'
    | 'clearNewImage'
    | 'applyNewImage'
    | 'setNewImage'
    | 'imageFile'
  >
) => {
  const [submitting, setSubmitting] = React.useState(false);

  const {
    applyNewImage,
    clearNewImage,
    setNewImage,
    newImage,
    imageFile,
    fileInputRef,
  } = useImageInputState(props.image);

  currentImageFile = imageFile;

  const uploadPercent = getUploadPercentMock();

  return (
    <form onSubmit={(e) => e.preventDefault()} aria-label='test-form'>
      <ImageInput
        {...props}
        label={LABEL}
        ref={fileInputRef}
        newImage={newImage}
        submitting={submitting}
        uploadPercent={uploadPercent}
        clearNewImage={clearNewImage}
        applyNewImage={applyNewImage}
        setNewImage={setNewImage}
        imageFile={imageFile}
      />
      <Toaster />
      <button
        type='submit'
        onClick={() => {
          setSubmitting(true);
          setTimeout(() => setSubmitting(false), 100);
        }}>
        Submit
      </button>
    </form>
  );
};

describe('<ImageInput />', () => {
  afterEach(vi.clearAllMocks);

  it('should the container have the given container className', () => {
    const className = 'test-class';
    render(<ImageInputWrapper containerClassName={className} />);
    expect(screen.getByRole('form').firstElementChild).toHaveClass(className);
  });

  it('should the container have the given container props', () => {
    const props = { id: 'test-id', ['aria-label']: 'test-label' };
    render(<ImageInputWrapper containerProps={props} />);
    for (const [k, v] of Object.entries(props)) {
      expect(screen.getByRole('form').firstElementChild).toHaveAttribute(k, v);
    }
  });
  it('should have the given className', () => {
    const className = 'test-class';
    render(<ImageInputWrapper className={className} />);
    expect(screen.getByLabelText(LABEL)).toHaveClass(className);
  });

  it('should have the given props', () => {
    const props = { ['data-attr']: 'test-attr', ['aria-label']: 'test-label' };
    render(<ImageInputWrapper {...props} />);
    for (const [k, v] of Object.entries(props)) {
      expect(screen.getByLabelText(LABEL)).toHaveAttribute(k, v);
    }
  });

  it('should show a placeholder of an image if not given an image', () => {
    render(<ImageInputWrapper />);
    expect(screen.getByLabelText(/image.* placeholder/i)).toBeInTheDocument();
  });

  it('should display the given image', () => {
    render(<ImageInputWrapper image={image} />);
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.src).toMatch(new RegExp(`^${image.src}`));
  });

  it('should be disabled while submitting', async () => {
    const user = userEvent.setup();
    render(<ImageInputWrapper />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByLabelText(LABEL)).toBeDisabled();
  });

  it('should show image loader while submitting', async () => {
    const user = userEvent.setup();
    render(<ImageInputWrapper />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/loading.* image/i)).toBeInTheDocument();
  });

  it('should show progress bar with the current upload percentage', async () => {
    const user = userEvent.setup();
    const uploadPercent = 35;
    getUploadPercentMock.mockImplementation(() => uploadPercent);
    render(<ImageInputWrapper />);
    await user.click(screen.getByRole('button'));
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar.firstElementChild).toHaveStyle(
      `transform: translateX(${uploadPercent - 100}%)`
    );
    getUploadPercentMock.mockReset();
  });

  it('should pick image file', async () => {
    const user = userEvent.setup();
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    render(<ImageInputWrapper />);
    await user.upload(screen.getByLabelText(LABEL), file);
    expect(currentImageFile).toBeInstanceOf(File);
    if (currentImageFile) {
      expect(currentImageFile.name).toBe('hello.png');
      expect(currentImageFile.type).toBe('image/png');
    }
  });

  it('should not pick non-image file', async () => {
    const user = userEvent.setup();
    const file = new File(['hello'], 'hello.png', { type: 'text/html' });
    render(<ImageInputWrapper />);
    await user.upload(screen.getByLabelText(LABEL), file);
    expect(currentImageFile).toBeNull();
  });
});
