import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ImageToolkitProps } from './image-toolkit.types';
import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ImageToolkit } from './image-toolkit';
import { image } from '@/test-utils';

const onEnterUpdate = vi.fn();
const onEnterDelete = vi.fn();
const onUpdate = vi.fn();
const onDelete = vi.fn();

const props: ImageToolkitProps = {
  imgRef: { current: new Image() },
  onEnterUpdate,
  onEnterDelete,
  onUpdate,
  onDelete,
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
  it('should display delete and position buttons', () => {
    render(<ImageToolkitWrapper />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /position/i })
    ).toBeInTheDocument();
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

  it('should cancel the positioning when clicking on the cancel button', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /position/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onUpdate).not.toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
    );
    expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull();
  });

  it('should cancel the positioning when pressing the Escape key', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /position/i }));
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
    );
    expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull();
    expect(onUpdate).not.toHaveBeenCalledOnce();
  });

  it('should call the given `onEnterDelete` when clicking on delete button', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onEnterDelete).toHaveBeenCalledOnce();
  });

  it('should display delete confirmation when clicking on the delete button', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/delete.*\?/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
  });

  it('should confirm the deletion when clicking on the Yes button', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /yes/i }));
    expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /yes/i })).toBeNull()
    );
    expect(screen.queryByRole('button', { name: /no/i })).toBeNull();
  });

  it('should not confirm the deletion when pressing the Enter key (To avoid delete by mistake)', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.keyboard('{Enter}');
    });
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalledOnce();
  });

  it('should cancel the deletion when clicking on the No button', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /no/i }));
    expect(onDelete).not.toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /yes/i })).toBeNull()
    );
    expect(screen.queryByRole('button', { name: /no/i })).toBeNull();
  });

  it('should cancel the deletion when pressing the Escape key', async () => {
    const user = userEvent.setup();
    render(<ImageToolkitWrapper />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /yes/i })).toBeNull()
    );
    expect(screen.queryByRole('button', { name: /no/i })).toBeNull();
    expect(onDelete).not.toHaveBeenCalledOnce();
  });
});
