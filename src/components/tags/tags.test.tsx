import { TagsSkeleton } from './tags.skeleton';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tags } from './tags';

describe('<Tags />', () => {
  it('should render the given tags with the given className as unordered list', () => {
    const className = 'test';
    const tags = ['test'];
    render(<Tags tags={tags} className={className} />);
    const list = screen.getByRole('list');
    expect(list).toHaveClass(className);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(tags[0]);
  });
});

describe('<TagsSkeleton />', () => {
  it('should have the given className', () => {
    const className = 'test-class';
    render(<TagsSkeleton className={className} />);
    expect(screen.getByLabelText(/loading .* post tags/i)).toHaveClass(
      className
    );
  });
});
