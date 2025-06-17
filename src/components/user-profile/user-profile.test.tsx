import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UserProfile from './user-profile';
import { author } from '@/test-utils';

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
});
