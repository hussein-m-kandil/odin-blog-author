import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from './header';

describe('<Header />', () => {
  it('should render the given children', () => {
    const name = 'test text';
    render(
      <Header>
        <h1>{name}</h1>
      </Header>
    );
    expect(screen.getByRole('heading', { name })).toBeInTheDocument();
  });

  it('should have the given className', () => {
    const className = 'test-class';
    render(
      <Header className={className}>
        <h1>Hello!</h1>
      </Header>
    );
    expect(screen.getByRole('banner')).toHaveClass(className);
  });
});
