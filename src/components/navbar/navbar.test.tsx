import { DialogProvider } from '@/contexts/dialog-context';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { author, initAuthData } from '@/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { Navbar } from './navbar';

const getAuthDataMock = vi.fn(() => initAuthData);

const NavbarWrapper = () => {
  return (
    <AuthProvider initAuthData={getAuthDataMock()}>
      <DialogProvider>
        <Navbar />
      </DialogProvider>
    </AuthProvider>
  );
};

describe('<Navbar/>', () => {
  it('should display the app name as link to the home page', () => {
    render(<NavbarWrapper />);
    expect(
      screen.getByRole('link', { name: process.env.NEXT_PUBLIC_APP_NAME })
    ).toHaveAttribute('href', '/');
  });

  it('should display authenticated avatar', () => {
    const fullname = 'Foo Bar';
    getAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      user: { ...author, fullname },
    }));
    render(<NavbarWrapper />);
    expect(screen.getByText(fullname[0])).toBeInTheDocument();
  });

  it('should render "?" for unauthenticated user', () => {
    getAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      user: null,
    }));
    render(<NavbarWrapper />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should render an unauthenticated user options menu after clicking the avatar', async () => {
    const user = userEvent.setup();
    getAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      user: null,
    }));
    render(<NavbarWrapper />);
    await user.click(screen.getByRole('button', { name: /options/i }));
    expect(
      screen.getByRole('menu', { name: /user options/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /home/i })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /profile/i })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /new post/i })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /sign ?out/i })).toBeNull();
    expect(screen.getByRole('menuitem', { name: /sign ?in/i })).toHaveAttribute(
      'href',
      '/signin'
    );
    expect(screen.getByRole('menuitem', { name: /sign ?up/i })).toHaveAttribute(
      'href',
      '/signup'
    );
  });

  it('should render an authenticated user options menu after clicking the avatar', async () => {
    getAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      user: author,
    }));
    const user = userEvent.setup();
    render(<NavbarWrapper />);
    await user.click(screen.getByRole('button', { name: /options/i }));
    expect(
      screen.getByRole('menu', { name: /user options/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /sign ?in/i })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /sign ?up/i })).toBeNull();
    expect(
      screen.getByRole('menuitem', { name: /sign ?out/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /new post/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /home/i })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('menuitem', { name: /profile/i })).toHaveAttribute(
      'href',
      `/profile/${author.username}`
    );
  });

  it('should render theme button for an unauthenticated user', () => {
    getAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      user: null,
    }));
    render(<NavbarWrapper />);
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
  });

  it('should render theme button for an authenticated user', () => {
    getAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      user: author,
    }));
    render(<NavbarWrapper />);
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
  });

  it('should render theme menu after clicking theme button', async () => {
    const user = userEvent.setup();
    render(<NavbarWrapper />);
    await user.click(screen.getByRole('button', { name: /theme/i }));
    expect(screen.getByRole('menu', { name: /theme/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /light/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /system/i })
    ).toBeInTheDocument();
  });
});
