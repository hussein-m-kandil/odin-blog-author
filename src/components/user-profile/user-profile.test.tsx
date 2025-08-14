import { author, initAuthData, mockDialogContext } from '@/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { UserProfile } from './user-profile';

const randomUUID = crypto.randomUUID();

const { showDialog } = mockDialogContext();

const getAuthDataMock = vi.fn(() => initAuthData);

const UserProfileWrapper = (
  props: React.ComponentProps<typeof UserProfile>
) => {
  return (
    <AuthProvider initAuthData={getAuthDataMock()}>
      <UserProfile {...props} />
    </AuthProvider>
  );
};

afterEach(vi.clearAllMocks);

describe('<UserProfile />', () => {
  it('should display an uppercase abbreviation of the user fullname', () => {
    const name = author.fullname;
    const abbrev = `${name[0]}${
      (name.includes(' ') && name.split(' ').at(-1)?.[0]) || ''
    }`.toUpperCase();
    render(<UserProfileWrapper user={author} />);
    expect(screen.getByText(abbrev)).toBeInTheDocument();
  });

  it('should display user fullname', () => {
    render(<UserProfileWrapper user={author} />);
    expect(screen.getByText(author.fullname)).toBeInTheDocument();
  });

  it('should display user username', () => {
    render(<UserProfileWrapper user={author} />);
    expect(screen.getByText(new RegExp(author.username))).toBeInTheDocument();
  });

  it('should display user bio', () => {
    const bio = 'Test bio...';
    render(<UserProfileWrapper user={{ ...author, bio }} />);
    expect(screen.getByText(bio)).toBeInTheDocument();
  });

  it('should show edit profile button', () => {
    render(<UserProfileWrapper user={author} />);
    expect(
      screen.getByRole('button', { name: /edit profile/i })
    ).toBeInTheDocument();
  });

  it('should show a dialog after clicking on edit profile button', async () => {
    const user = userEvent.setup();
    render(<UserProfileWrapper user={author} />);
    await user.click(screen.getByRole('button', { name: /edit profile/i }));
    expect(showDialog).toHaveBeenCalledOnce();
  });

  it('should show edit avatar button', () => {
    render(<UserProfileWrapper user={author} />);
    expect(
      screen.getByRole('button', { name: /edit avatar/i })
    ).toBeInTheDocument();
  });

  it('should show a dialog after clicking on edit avatar button', async () => {
    const user = userEvent.setup();
    render(<UserProfileWrapper user={author} />);
    await user.click(screen.getByRole('button', { name: /edit avatar/i }));
    expect(showDialog).toHaveBeenCalledOnce();
  });

  it('should not show edit profile button for users other than the owner', () => {
    getAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      user: { ...author, id: randomUUID },
    }));
    render(<UserProfileWrapper user={author} />);
    expect(screen.queryByRole('button', { name: /edit profile/i })).toBeNull();
  });

  it('should not show edit avatar button for users other than the owner', () => {
    getAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      user: { ...author, id: randomUUID },
    }));
    render(<UserProfileWrapper user={author} />);
    expect(screen.queryByRole('button', { name: /edit avatar/i })).toBeNull();
  });
});
