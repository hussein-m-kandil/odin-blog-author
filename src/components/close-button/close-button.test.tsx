import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CloseButton } from './close-button';

const onClose = vi.fn();

describe('<CloseButton />', () => {
  it('should have the given type', () => {
    render(<CloseButton onClose={onClose} type='submit' />);
    expect(screen.getByRole('button', { name: /close/i })).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('should have the given className', () => {
    render(<CloseButton onClose={onClose} className='test-class' />);
    expect(screen.getByRole('button', { name: /close/i })).toHaveClass(
      'test-class'
    );
  });

  it('should Replace the default children with given children', () => {
    render(
      <CloseButton onClose={onClose}>
        <span>Test child</span>
      </CloseButton>
    );
    expect(
      screen.getByRole('button', { name: 'Test child' })
    ).toBeInTheDocument();
  });

  it('should not display the close button if `onClose` prop is `undefined`', () => {
    render(<CloseButton onClose={undefined} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('should not display the close button if `onClose` prop is `null`', () => {
    render(<CloseButton onClose={null} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('should display the close button if given `onClose` prop', () => {
    render(<CloseButton onClose={onClose} />);
    expect(screen.getByRole('button')).toHaveTextContent('Close');
  });

  it('should call the given `onClose` after clicking the close button', async () => {
    const user = userEvent.setup();
    render(<CloseButton onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
