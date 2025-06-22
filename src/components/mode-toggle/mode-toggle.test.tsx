import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModeToggle } from './mode-toggle';

const props = { className: 'test-class', id: 'test-id' };

describe('<ModeToggle />', () => {
  it('should the toggler have the given props', () => {
    render(<ModeToggle triggerProps={props} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass(props.className);
    expect(trigger).toHaveAttribute('id', props.id);
  });

  it('should the menu have the given props', async () => {
    const user = userEvent.setup();
    render(<ModeToggle menuProps={props} />);
    await user.click(screen.getByRole('button'));
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass(props.className);
    expect(menu).toHaveAttribute('id', props.id);
  });
});
