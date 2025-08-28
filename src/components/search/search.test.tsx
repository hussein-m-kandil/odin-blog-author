import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Search from './search';
import userEvent from '@testing-library/user-event';

describe('<Search />', () => {
  afterEach(vi.clearAllMocks);

  const props = { onSearch: vi.fn() };

  it('should have the given className', () => {
    const { container } = render(<Search {...props} className='test-class' />);
    expect(container.firstElementChild).toHaveClass('test-class');
  });

  it('should have the given props', () => {
    render(<Search {...props} id={'x'} aria-label='x-label' />);
    expect(screen.getByLabelText('x-label')).toHaveAttribute('id', 'x');
  });

  it('should the input to have the given placeholder', () => {
    render(<Search {...props} placeholder='Test' />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Test');
  });

  it('should the input to have no initial value by default', () => {
    render(<Search {...props} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('should the input to have the given initial value', () => {
    render(<Search {...props} initQuery='test query' />);
    expect(screen.getByRole('textbox')).toHaveValue('test query');
  });

  it('should the submit button to be disabled if the input is empty', () => {
    render(<Search {...props} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should the submit button to not be disabled if given the initial value', () => {
    render(<Search {...props} initQuery='test query' />);
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('should call the given `onChange`', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Search {...props} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'xyz');
    await user.clear(screen.getByRole('textbox'));
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenNthCalledWith(4, '');
    expect(onChange).toHaveBeenNthCalledWith(3, 'xyz');
    expect(onChange).toHaveBeenNthCalledWith(2, 'xy');
    expect(onChange).toHaveBeenNthCalledWith(1, 'x');
  });

  it('should call the given `onChange` with the initial value', async () => {
    const user = userEvent.setup();
    render(<Search {...props} initQuery='Test' />);
    await user.click(screen.getByRole('button', { name: /search/i }));
    expect(props.onSearch).toHaveBeenCalledTimes(1);
    expect(props.onSearch).toHaveBeenNthCalledWith(1, 'Test');
  });

  it('should call the given `onChange` with the entered value', async () => {
    const user = userEvent.setup();
    render(<Search {...props} />);
    await user.type(screen.getByRole('textbox'), 'Test');
    await user.click(screen.getByRole('button'));
    expect(props.onSearch).toHaveBeenCalledTimes(1);
    expect(props.onSearch).toHaveBeenNthCalledWith(1, 'Test');
  });
});
