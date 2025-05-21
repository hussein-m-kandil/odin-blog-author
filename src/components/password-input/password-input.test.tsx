import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PasswordInput } from './password-input';

describe('<PasswordInput />', () => {
  it('should contains an password input', () => {
    render(<PasswordInput />);
    const passInp = screen.getByDisplayValue('');
    expect(passInp).toBeInTheDocument();
    expect(passInp.getAttribute('type')).toBe('password');
  });

  it('should contains an password input with the given attributes', () => {
    const attrs = { name: 'password', 'aria-label': 'Password' };
    render(<PasswordInput {...attrs} />);
    const passInp = screen.getByLabelText(attrs['aria-label']);
    expect(passInp).toBeInTheDocument();
    expect(passInp.getAttribute('name')).toBe(attrs.name);
    expect(passInp.getAttribute('type')).toBe('password');
  });

  it('should contains an password input with a button to show/hide the password', async () => {
    const showBtnOpts = { name: /show /i };
    const hideBtnOpts = { name: /hide /i };
    const user = userEvent.setup();
    render(<PasswordInput />);
    const passInp = screen.getByDisplayValue('');
    const showPassBtn = screen.getByRole('button', showBtnOpts);
    expect(passInp).toBeInTheDocument();
    expect(showPassBtn).toBeInTheDocument();
    expect(passInp.getAttribute('type')).toBe('password');
    await user.click(showPassBtn);
    const hidePassBtn = screen.getByRole('button', hideBtnOpts);
    expect(passInp).toBeInTheDocument();
    expect(hidePassBtn).toBeInTheDocument();
    expect(screen.queryByRole('button', showBtnOpts)).toBeNull();
    expect(passInp.getAttribute('type')).toBe('text');
    await user.click(hidePassBtn);
    expect(screen.getByRole('button', showBtnOpts)).toBeInTheDocument();
    expect(passInp.getAttribute('type')).toBe('password');
  });
});
