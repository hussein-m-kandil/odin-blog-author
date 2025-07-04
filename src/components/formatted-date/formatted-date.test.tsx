import { render, screen } from '@testing-library/react';
import { FormattedDate } from './formatted-date';
import { describe, expect, it } from 'vitest';

describe('<FormattedDate />', () => {
  it('should have the given class', () => {
    const id = 'test-id';
    const className = 'test-class';
    const { container } = render(
      <FormattedDate createdAt={new Date()} className={className} id={id} />
    );
    expect(container.firstElementChild).toHaveClass(className);
    expect(container.firstElementChild).toHaveAttribute('id', id);
  });

  it('should display the given creation date', () => {
    const createdAt = new Date().toISOString();
    render(<FormattedDate createdAt={createdAt} />);
    expect(
      new Date(
        screen.getByRole('time').getAttribute('datetime') as string
      ).toISOString()
    ).toStrictEqual(createdAt);
  });

  it('should display the given update date if it is a minute after the creation date', () => {
    const createdAt = new Date(Date.now() - 65 * 1000).toISOString();
    const updatedAt = new Date().toISOString();
    render(<FormattedDate createdAt={createdAt} updatedAt={updatedAt} />);
    expect(
      new Date(
        screen.getAllByRole('time')[1].getAttribute('datetime') as string
      ).toISOString()
    ).toStrictEqual(updatedAt);
  });

  it('should not display the given update date if it is less than a minute after the creation date', () => {
    const createdAt = new Date(Date.now() - 55 * 1000).toISOString();
    const updatedAt = new Date().toISOString();
    render(<FormattedDate createdAt={createdAt} updatedAt={updatedAt} />);
    expect(screen.getAllByRole('time')).toHaveLength(1);
  });
});
