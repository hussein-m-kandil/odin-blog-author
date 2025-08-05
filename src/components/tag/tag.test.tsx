import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tag } from './tag';
import userEvent from '@testing-library/user-event';

describe('<Tag />', () => {
  it('should render the given name as a link if not given `onRemove` prop', () => {
    const name = 'Test';
    render(<Tag name={name} />);
    expect(
      screen.getByRole('link', { name: new RegExp(name, 'i') })
    ).toBeInTheDocument();
  });

  it('should add the given className', () => {
    const className = 'text-9xl';
    render(<Tag name={'Test'} className={className} />);
    expect(screen.getByRole('link')).toHaveClass(className);
  });

  it('should render the given name as a button with a remove button if given `onRemove` prop', async () => {
    const name = 'Test';
    const user = userEvent.setup();
    const handleRemoveMock = vi.fn();
    render(<Tag name={name} onRemove={handleRemoveMock} />);
    expect(
      screen.getByRole('button', { name: new RegExp(`^${name}$`, 'i') })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(handleRemoveMock).toHaveBeenNthCalledWith(1, name);
  });
});
