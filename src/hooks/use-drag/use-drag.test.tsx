import React from 'react';
import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDrag } from './use-drag';

const TEST_ID = 'test-id';

const onDragMock = vi.fn();

const getDisabledFlag = vi.fn(() => false);

function UseDragWrapper() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useDrag({
    onDrag: onDragMock,
    htmlElementRef: canvasRef,
    disabled: getDisabledFlag(),
  });

  return (
    <div>
      <canvas width={500} height={500} ref={canvasRef} data-testid={TEST_ID} />
    </div>
  );
}

afterEach(vi.clearAllMocks);

describe('useDrag', () => {
  it('should call the given `onDrag` while dragging', async () => {
    const user = userEvent.setup();
    render(<UseDragWrapper />);
    const target = screen.getByTestId(TEST_ID);
    await user.pointer([
      { keys: '[MouseLeft>]', target, coords: { clientX: 0, clientY: 7 } },
      { target, coords: { clientX: 42, clientY: 49 } },
      { keys: '[/MouseLeft]' },
    ]);
    expect(onDragMock).toHaveBeenCalledOnce();
    expect(onDragMock.mock.calls[0][1]).toBeInstanceOf(MouseEvent);
    expect(onDragMock.mock.calls[0][0]).toEqual({ deltaX: 42, deltaY: 42 });
  });

  it('should call the given `onDrag` while dragging on the `x` axis only', async () => {
    const user = userEvent.setup();
    render(<UseDragWrapper />);
    const target = screen.getByTestId(TEST_ID);
    await user.pointer([
      { keys: '[MouseLeft>]', target, coords: { clientX: 0, clientY: 7 } },
      { target, coords: { clientX: 42, clientY: 7 } },
      { keys: '[/MouseLeft]' },
    ]);
    expect(onDragMock).toHaveBeenCalledOnce();
    expect(onDragMock.mock.calls[0][1]).toBeInstanceOf(MouseEvent);
    expect(onDragMock.mock.calls[0][0]).toEqual({ deltaX: 42, deltaY: 0 });
  });

  it('should call the given `onDrag` while dragging on the `y` axis only', async () => {
    const user = userEvent.setup();
    render(<UseDragWrapper />);
    const target = screen.getByTestId(TEST_ID);
    await user.pointer([
      { keys: '[MouseLeft>]', target, coords: { clientX: 0, clientY: 7 } },
      { target, coords: { clientX: 0, clientY: 49 } },
      { keys: '[/MouseLeft]' },
    ]);
    expect(onDragMock).toHaveBeenCalledOnce();
    expect(onDragMock.mock.calls[0][1]).toBeInstanceOf(MouseEvent);
    expect(onDragMock.mock.calls[0][0]).toEqual({ deltaX: 0, deltaY: 42 });
  });

  it('should not call the given `onDrag` on click (without drag)', async () => {
    const user = userEvent.setup();
    render(<UseDragWrapper />);
    const target = screen.getByTestId(TEST_ID);
    await user.pointer({ keys: '[TouchA>]', target });
    expect(onDragMock).not.toHaveBeenCalledOnce();
  });

  it('should not call the given `onDrag` if the give `disabled` flag is `true`', async () => {
    getDisabledFlag.mockImplementationOnce(() => true);
    const user = userEvent.setup();
    render(<UseDragWrapper />);
    const target = screen.getByTestId(TEST_ID);
    await user.pointer({ keys: '[TouchA>]', target });
    expect(onDragMock).not.toHaveBeenCalledOnce();
  });
});
