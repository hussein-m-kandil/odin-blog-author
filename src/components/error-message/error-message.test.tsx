import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ErrorMessage from './error-message';

const message = 'Hello error!';
const className = 'text-9xl';

describe('<ErrorMessage />', () => {
  it('should display the given message with the given className', () => {
    render(<ErrorMessage className={className}>{message}</ErrorMessage>);
    const errMsg = screen.getByText(message);
    expect(errMsg).toBeInTheDocument();
    expect(errMsg).toHaveClass(className);
  });
});
