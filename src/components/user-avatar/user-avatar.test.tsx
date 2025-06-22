import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserAvatar } from './user-avatar';
import { author } from '@/test-utils';

describe('<UserAvatar />', () => {
  it('should display a question mark (?) if not given a user (without any characters)', () => {
    render(<UserAvatar />);
    expect(screen.queryByText(/\w/)).toBeNull();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should display at least the 1st characters of the user name (without ?)', () => {
    render(<UserAvatar user={author} />);
    expect(screen.queryByText(/\?/)).toBeNull();
    expect(
      screen.getByText(new RegExp(author.fullname[0], 'i'))
    ).toBeInTheDocument();
  });

  it('should have the given class', () => {
    const className = 'test-class';
    const { container } = render(
      <UserAvatar user={author} className={className} />
    );
    expect(container.firstElementChild).toHaveClass(className);
  });
});
