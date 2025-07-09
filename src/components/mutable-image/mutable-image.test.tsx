import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MutableImage } from './mutable-image';
import { image } from '@/test-utils';

vi.mock('next/image', async (importOriginal) => {
  const { default: Image, ...originalData } = await importOriginal<
    typeof import('next/image')
  >();
  const WrappedImage = ({
    onLoad,
    ...imgProps
  }: React.ComponentProps<typeof Image>) => {
    React.useEffect(() => {
      const id = window.setTimeout(
        () => onLoad?.({} as React.SyntheticEvent<HTMLImageElement, Event>),
        50
      );
      return () => window.clearTimeout(id);
    }, [onLoad]);
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...imgProps} />;
  };
  return { default: WrappedImage, ...originalData };
});

const deleteMock = vi.fn();
const updateMock = vi.fn();

const props: React.ComponentProps<typeof MutableImage> = {
  image,
  mutation: { update: updateMock, delete: deleteMock },
};

const { src, alt, xPos, yPos } = image;

afterEach(vi.clearAllMocks);

describe('<MutableImage />', () => {
  it('should the container have the give className', () => {
    const className = 'test-class';
    const { container } = render(<MutableImage {...{ ...props, className }} />);
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should display the image placeholder the image is loaded', () => {
    render(<MutableImage {...props} />);
    expect(
      screen.getByLabelText(/(image.*icon)|(icon.*image)/i)
    ).toBeInTheDocument();
  });

  it('should display the given image', async () => {
    render(<MutableImage {...props} />);
    const img = (await screen.findByRole('img')) as HTMLImageElement;
    expect(img).toHaveAttribute('alt', alt);
    expect(img.src).toMatch(new RegExp(`^${src}`));
    expect(img.style.objectFit).toBe('cover');
    expect(img.style.objectPosition).toBe(`${xPos}% ${yPos}%`);
  });

  it('should display the mutation buttons if given the callbacks', async () => {
    render(<MutableImage {...props} />);
    expect(
      await screen.findByRole('button', { name: /delete/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /position/i })
    ).toBeInTheDocument();
  });

  it('should not display the mutation buttons if not given the callbacks', async () => {
    render(<MutableImage {...{ ...props, mutation: undefined }} />);
    await screen.findByRole('img');
    await expect(() =>
      screen.findByRole('button', { name: /delete/i })
    ).rejects.toThrowError();
    expect(screen.queryByRole('button', { name: /position/i })).toBeNull();
  });

  it('should not display the image, nor the mutation buttons if not given any thing', async () => {
    render(<MutableImage />);
    await expect(() => screen.findByRole('img')).rejects.toThrowError();
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /position/i })).toBeNull();
  });
});
