import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryError } from './query-error';

const refetchMock = vi.fn();

describe('<QueryError />', () => {
  it('should have the given className', () => {
    const className = 'test-class';
    const { container } = render(
      <QueryError className={className} onRefetch={refetchMock} />
    );
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should show default message if not given one', () => {
    render(<QueryError onRefetch={refetchMock} />);
    expect(screen.getByText(/.*could not.*/i)).toBeInTheDocument();
  });

  it('should show the given message', () => {
    const message = 'Blah blah ...';
    render(<QueryError onRefetch={refetchMock}>{message}</QueryError>);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should not call the given refetch callback if retry button not clicked', () => {
    render(<QueryError onRefetch={refetchMock} />);
    expect(refetchMock).not.toHaveBeenCalled();
  });

  it('should call the given refetch callback when retry button clicked', async () => {
    const user = userEvent.setup();
    render(<QueryError onRefetch={refetchMock} />);
    await user.click(screen.getByRole('button', { name: /try/i }));
    expect(refetchMock).toHaveBeenCalledOnce();
  });
});
