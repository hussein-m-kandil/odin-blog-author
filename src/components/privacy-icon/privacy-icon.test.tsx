import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrivacyIcon } from './privacy-icon';

describe('<PrivacyIcon />', () => {
  it('should indicate to a private state by default', () => {
    render(<PrivacyIcon />);
    expect(screen.queryByLabelText(/public/i)).toBeNull();
    expect(screen.getByLabelText(/private/i)).toBeInTheDocument();
  });

  it('should indicate to a private state base on a given prop', () => {
    render(<PrivacyIcon isPublic={false} />);
    expect(screen.queryByLabelText(/public/i)).toBeNull();
    expect(screen.getByLabelText(/private/i)).toBeInTheDocument();
  });

  it('should indicate to a public state base on a given prop', () => {
    render(<PrivacyIcon isPublic={true} />);
    expect(screen.queryByLabelText(/private/i)).toBeNull();
    expect(screen.getByLabelText(/public/i)).toBeInTheDocument();
  });

  it('should apply the given class', () => {
    const className = 'test-class';
    render(<PrivacyIcon isPublic={false} className={className} />);
    expect(screen.getByLabelText(/private/i)).toHaveClass(className);
  });

  it('should apply the given size', () => {
    const size = '42';
    render(<PrivacyIcon isPublic={false} size={size} />);
    for (const attr of ['width', 'height']) {
      expect(
        screen.getByLabelText(/private/i).firstElementChild
      ).toHaveAttribute(attr, size);
    }
  });
});
