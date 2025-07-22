import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UsernameLink } from './username-link';
import { author } from '@/test-utils';

describe('<UsernameLink />', () => {
  it('should render nothing if not given a user', () => {
    const { container } = render(<UsernameLink />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render an anchor tag with the given user name prefixed by @', () => {
    render(<UsernameLink user={author} />);
    expect(screen.getByRole('link')).toHaveTextContent(`@${author.username}`);
  });

  it('should render an anchor tag with the given user name prefixed by the given prefix', () => {
    const prefix = '$';
    render(<UsernameLink user={author} prefix={prefix} />);
    expect(screen.getByRole('link')).toHaveTextContent(
      `${prefix}${author.username}`
    );
  });

  it('should have the give className', () => {
    const className = 'test-class';
    render(<UsernameLink user={author} className={className} />);
    expect(screen.getByRole('link')).toHaveClass(className);
  });

  it('should have the give id', () => {
    const id = 'test-id';
    render(<UsernameLink user={author} id={id} />);
    expect(screen.getByRole('link')).toHaveAttribute('id', id);
  });
});
