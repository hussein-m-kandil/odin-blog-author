import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Img } from './img';

vi.mock('next/image', () => {
  const FakeImage = ({
    onLoad,
    ...imgProps
  }: React.ComponentProps<'img'> & { onLoad: () => void }) => {
    React.useEffect(() => {
      const id = window.setTimeout(() => onLoad(), 0);
      return () => window.clearTimeout(id);
    }, [onLoad]);
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />;
  };
  return { default: FakeImage };
});

const props = {
  width: 50,
  height: 50,
  fallback: 'fb',
  alt: 'test-alt',
  src: '/test.png',
};

describe('<Img />', () => {
  it('should display the fallback at until the image is loaded', () => {
    render(<Img {...props} />);
    expect(screen.getByText(props.fallback)).toBeInTheDocument();
  });

  it('should have the give attributes', async () => {
    render(<Img {...props} />);
    const img = await screen.findByRole('img');
    expect(img).toHaveAttribute('alt', props.alt);
    expect(img).toHaveAttribute('width', props.width.toString());
    expect(img).toHaveAttribute('height', props.height.toString());
  });

  it('should display the fallback if not given `src`', async () => {
    render(<Img {...{ ...props, src: undefined }} />);
    expect(() => screen.findByRole('img')).rejects.toThrowError();
    expect(screen.getByText(props.fallback)).toBeInTheDocument();
  });
});
