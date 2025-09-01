import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InputGroup } from './input-group';

describe('<InputGroup />', () => {
  it('should display an input with given props', () => {
    const props = { type: 'password', id: 'test-id', ['aria-label']: 'label' };
    render(<InputGroup {...props} className='test-class' />);
    const input = screen.getByLabelText('label');
    expect(input).toHaveClass('test-class');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should display a button with the given props and the given children as its content', () => {
    render(
      <InputGroup
        buttonProps={{
          ['aria-label']: 'label',
          className: 'test-class',
          disabled: true,
          type: 'reset',
        }}>
        <span>B</span>
      </InputGroup>
    );
    const button = screen.getByRole('button');
    const buttonChild = button.firstElementChild as HTMLElement;
    expect(button).toHaveAttribute('aria-label', 'label');
    expect(button).toHaveAttribute('type', 'reset');
    expect(button).toHaveClass('test-class');
    expect(button).toBeDisabled();
    expect(buttonChild.tagName).toBe('SPAN');
    expect(buttonChild).toHaveTextContent('B');
  });

  it('should call the given `onChange` while typing', async () => {
    const user = userEvent.setup();
    const inputValues: string[] = [];
    const onChangeMock = vi.fn((e: React.SyntheticEvent) => {
      inputValues.push((e.target as HTMLInputElement).value);
    });
    render(<InputGroup onChange={onChangeMock} />);
    await user.type(screen.getByRole('textbox'), 'blah');
    expect(onChangeMock).toHaveBeenCalledTimes(4);
    expect(inputValues).toStrictEqual(['b', 'bl', 'bla', 'blah']);
  });

  it('should call the given `onClick` when clicking the button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<InputGroup buttonProps={{ onClick }} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
