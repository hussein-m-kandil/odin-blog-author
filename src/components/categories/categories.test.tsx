import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Categories from './categories';

describe('<Categories />', () => {
  it('should render the given categories with the given className as unordered list', () => {
    const className = 'test';
    const categories = ['test'];
    render(<Categories categories={categories} className={className} />);
    const list = screen.getByRole('list');
    expect(list).toHaveClass(className);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(categories[0]);
  });
});
