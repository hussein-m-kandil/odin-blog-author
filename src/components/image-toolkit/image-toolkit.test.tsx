import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ImageToolkitProps } from './image-toolkit.types';
import { userEvent } from '@testing-library/user-event';
import { ImageToolkit } from './image-toolkit';
import { image } from '@/test-utils';

const onEnterUpdate = vi.fn();
const onEnterDelete = vi.fn();
const onEnterReset = vi.fn();
const onUpdate = vi.fn();
const onDelete = vi.fn();
const onReset = vi.fn();

const props: ImageToolkitProps = {
  imgRef: { current: new Image() },
  onEnterUpdate,
  onEnterDelete,
  onEnterReset,
  onUpdate,
  onDelete,
  onReset,
  image,
};

const TEST_ID = 'test-id';

function ImageToolkitWrapper() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  return (
    <div>
      <canvas width={500} height={500} ref={canvasRef} data-testid={TEST_ID} />
      <ImageToolkit
        {...{
          ...props,
          imgRef: canvasRef as React.RefObject<HTMLImageElement | null>,
        }}
      />
    </div>
  );
}

afterEach(vi.clearAllMocks);

describe('<ImageToolkit />', () => {
  it('should display position, delete and reset buttons', () => {
    render(<ImageToolkitWrapper />);
    expect(
      screen.getByRole('button', { name: /position/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('should call the given `onEnterUpdate` when clicking on position button', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /position/i }));
    expect(onEnterUpdate).toHaveBeenCalledOnce();
  });

  it('should display update confirmation when clicking on the position button', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /position/i }));
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should change the position when dragging with the mouse', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    const target = screen.getByTestId(TEST_ID) as HTMLImageElement;
    const initialObjectPosition = target.style.objectPosition;
    await user.click(screen.getByRole('button', { name: /position/i }));
    await user.pointer([
      { keys: '[MouseLeft>]', target, coords: { clientX: 0, clientY: 7 } },
      { target, coords: { clientX: 42, clientY: 49 } },
      { keys: '[/MouseLeft]' },
    ]);
    const finalObjectPosition = target.style.objectPosition;
    expect(finalObjectPosition).not.toBe(initialObjectPosition);
  });

  it('should change the position when pressing ArrowDown/ArrowUp', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    const target = screen.getByTestId(TEST_ID) as HTMLImageElement;
    const initialObjectPosition = target.style.objectPosition;
    await user.click(screen.getByRole('button', { name: /position/i }));
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    const downObjectPosition = target.style.objectPosition;
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    const upObjectPosition = target.style.objectPosition;
    expect(downObjectPosition).not.toBe(initialObjectPosition);
    expect(upObjectPosition).not.toBe(downObjectPosition);
  });

  it('should confirm the positioning when clicking on the save button', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /position/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onUpdate).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
    );
    expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull();
  });

  it('should confirm the positioning when pressing the Enter key', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /position/i }));
    await user.keyboard('{Enter}');
    expect(onUpdate).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
    );
    expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull();
  });

  it('should cancel the positioning via the cancel button or the Escape key', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    const cancelFns = [
      () => user.click(screen.getByRole('button', { name: /cancel/i })),
      () => user.keyboard('{Escape}'),
    ];
    for (const cancel of cancelFns) {
      const target = screen.getByTestId(TEST_ID) as HTMLImageElement;
      const initialObjectPosition = target.style.objectPosition;
      await user.click(screen.getByRole('button', { name: /position/i }));
      await user.pointer([
        { keys: '[MouseLeft>]', target, coords: { clientX: 0, clientY: 7 } },
        { target, coords: { clientX: 42, clientY: 49 } },
        { keys: '[/MouseLeft]' },
      ]);
      await cancel();
      expect(onUpdate).not.toHaveBeenCalledOnce();
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
      );
      expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull();
      expect(screen.getByTestId(TEST_ID).style.objectPosition).toBe(
        initialObjectPosition
      );
    }
  });

  describe('Deleting & Resetting', () => {
    const modes = [
      { action: 'delete', onEnter: onEnterDelete, onAct: onDelete },
      { action: 'reset', onEnter: onEnterReset, onAct: onReset },
    ];
    for (const { action, onAct, onEnter } of modes) {
      it(`should call the given ${action}-callback when clicking on ${action} button`, async () => {
        const user = userEvent.setup();
        render(<ImageToolkitWrapper />);
        await user.click(
          screen.getByRole('button', { name: new RegExp(action, 'i') })
        );
        expect(onEnter).toHaveBeenCalledOnce();
      });

      it(`should display ${action} confirmation when clicking on the ${action} button`, async () => {
        const user = userEvent.setup();
        render(<ImageToolkitWrapper />);
        await user.click(
          screen.getByRole('button', { name: new RegExp(action, 'i') })
        );
        expect(
          screen.getByText(new RegExp(`${action}.*?`, 'i'))
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /yes/i })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
      });

      it(`should automatically focus on the No button from the ${action} confirmation options`, async () => {
        const user = userEvent.setup();
        render(<ImageToolkitWrapper />);
        await user.click(
          screen.getByRole('button', { name: new RegExp(action, 'i') })
        );
        expect(screen.getByRole('button', { name: /yes/i })).not.toHaveFocus();
        expect(screen.getByRole('button', { name: /no/i })).toHaveFocus();
        expect(onAct).not.toHaveBeenCalledOnce();
      });

      it(`should confirm the ${action} when clicking on the Yes button`, async () => {
        const user = userEvent.setup();
        render(<ImageToolkitWrapper />);
        await user.click(
          screen.getByRole('button', { name: new RegExp(action, 'i') })
        );
        await user.click(screen.getByRole('button', { name: /yes/i }));
        expect(onAct).toHaveBeenCalledOnce();
        await waitFor(() =>
          expect(screen.queryByRole('button', { name: /yes/i })).toBeNull()
        );
        expect(screen.queryByRole('button', { name: /no/i })).toBeNull();
      });

      it(`should cancel the ${action} via the No button or the Escape key`, async () => {
        const user = userEvent.setup();
        render(<ImageToolkitWrapper />);
        const cancelFns = [
          () => user.click(screen.getByRole('button', { name: /no/i })),
          () => user.keyboard('{Escape}'),
        ];
        for (const cancel of cancelFns) {
          await user.click(
            screen.getByRole('button', { name: new RegExp(action, 'i') })
          );
          await cancel();
          await waitFor(() =>
            expect(screen.queryByRole('button', { name: /yes/i })).toBeNull()
          );
          expect(screen.queryByRole('button', { name: /no/i })).toBeNull();
          expect(onAct).not.toHaveBeenCalledOnce();
        }
      });
    }
  });
});
