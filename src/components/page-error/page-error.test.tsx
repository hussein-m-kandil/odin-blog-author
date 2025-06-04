import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageError } from './page-error';
import logger from '@/lib/logger';

const errorLogMock = vi.fn();
vi.spyOn(logger, 'error').mockImplementation(errorLogMock);

const testSuite = describe('<PageError />', () => {
  it('should render default error message', () => {
    render(<PageError error={new Error('Test error')} />);
    expect(screen.getByText(/something .*wrong/i)).toBeInTheDocument();
  });

  it('should not render reset button if not given a resetter', () => {
    render(<PageError error={new Error('Test error')} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('should render reset button that calls the given resetter', async () => {
    const user = userEvent.setup();
    const resetterMock = vi.fn();
    render(<PageError error={new Error('Test error')} reset={resetterMock} />);
    const resetBtn = screen.getByRole('button');
    expect(resetBtn).toBeInTheDocument();
    await user.click(resetBtn);
    expect(resetterMock).toHaveBeenCalledOnce();
  });

  it('should render reset button with the given label', () => {
    const name = 'Retry';
    render(
      <PageError
        error={new Error('Test error')}
        resetterLabel={name}
        reset={vi.fn()}
      />
    );
    const resetBtn = screen.getByRole('button', { name });
    expect(resetBtn).toBeInTheDocument();
  });

  it('should render the given error message', () => {
    const message = 'Custom error message';
    render(
      <PageError error={new Error('Test error')} errorMessage={message} />
    );
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should the container has the given className', () => {
    const className = 'text-red-950';
    const { container } = render(
      <PageError error={new Error('Test error')} className={className} />
    );
    expect(container.firstChild).toHaveClass(className);
  });

  it('should render the given children at the bottom by default', () => {
    const childText = '** child element **';
    const { container } = render(
      <PageError error={new Error('Test error')} reset={vi.fn()}>
        <div>{childText}</div>
      </PageError>
    );
    const childNode = screen.getByText(childText);
    const children = container.firstElementChild?.children;
    expect(children?.[2].textContent).toBe(childNode.textContent);
  });

  const places = ['top', 'middle', 'bottom'];
  for (let i = 0; i < places.length; i++) {
    const place = places[i] as 'top' | 'middle' | 'bottom';
    it(`should render the given children at the ${place}`, () => {
      const childText = '** child element **';
      const { container } = render(
        <PageError
          error={new Error('Test error')}
          childrenPlace={place}
          reset={vi.fn()}>
          <div>{childText}</div>
        </PageError>
      );
      const childNode = screen.getByText(childText);
      const children = container.firstElementChild?.children;
      expect(children?.[i].textContent).toBe(childNode.textContent);
    });
  }

  it('should call the logger.error once for each render', () => {
    render(<PageError error={new Error('Test error')} />);
    expect(errorLogMock).toHaveBeenCalledTimes(testSuite.tasks.length);
  });
});
