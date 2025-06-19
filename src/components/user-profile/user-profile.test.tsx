import { author, mockDialogContext } from '@/test-utils';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UserProfile from './user-profile';
import userEvent from '@testing-library/user-event';

const { showDialog } = mockDialogContext();

describe('<UserProfile />', () => {
  it('should display an uppercase abbreviation of the user fullname', () => {
    const name = author.fullname;
    const abbrev = `${name[0]}${
      (name.includes(' ') && name.split(' ').at(-1)?.[0]) || ''
    }`.toUpperCase();
    render(<UserProfile user={author} />);
    expect(screen.getByText(abbrev)).toBeInTheDocument();
  });

  it('should display user fullname', () => {
    render(<UserProfile user={author} />);
    expect(screen.getByText(author.fullname)).toBeInTheDocument();
  });

  it('should display user username', () => {
    render(<UserProfile user={author} />);
    expect(screen.getByText(new RegExp(author.username))).toBeInTheDocument();
  });

  it('should display user bio', () => {
    const bio = 'Test bio...';
    render(<UserProfile user={{ ...author, bio }} />);
    expect(screen.getByText(bio)).toBeInTheDocument();
  });

  it('should show edit profile button', () => {
    render(<UserProfile user={author} />);
    expect(
      screen.getByRole('button', { name: /edit|update/i })
    ).toBeInTheDocument();
  });

  it('should show a dialog after clicking on edit profile button', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={author} />);
    await user.click(screen.getByRole('button', { name: /edit|update/i }));
    expect(showDialog).toHaveBeenCalledOnce();
  });
});
