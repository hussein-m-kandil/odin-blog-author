import { DialogData, DialogProvider, useDialog } from './dialog-context';
import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const shouldHideMock = vi.fn<() => boolean | Promise<boolean>>(() => true);

let dialogData: DialogData;

function DialogConsumer() {
  const { showDialog, hideDialog } = useDialog();
  dialogData = {
    title: 'Test Dialog Context',
    footer: 'Footer for dialog context test',
    description: 'This component is used for testing...',
    body: (
      <button type='button' onClick={hideDialog}>
        Hide Dialog
      </button>
    ),
  };
  return (
    <DialogProvider>
      <div>
        <button
          type='button'
          onClick={() => showDialog(dialogData, shouldHideMock)}>
          Show Dialog
        </button>
      </div>
    </DialogProvider>
  );
}

const DialogConsumerWrapper = () => {
  return (
    <DialogProvider>
      <div>
        <DialogConsumer />
      </div>
    </DialogProvider>
  );
};

const assertDialogHidden = () => {
  expect(screen.queryByRole('button', { name: /hide/i })).toBeNull();
  expect(screen.queryByText(dialogData.title as string)).toBeNull();
  expect(screen.queryByText(dialogData.footer as string)).toBeNull();
  expect(screen.queryByText(dialogData.description as string)).toBeNull();
};

const assertDialogVisible = () => {
  expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument();
  expect(screen.getByText(dialogData.title as string)).toBeInTheDocument();
  expect(screen.getByText(dialogData.footer as string)).toBeInTheDocument();
  expect(
    screen.getByText(dialogData.description as string)
  ).toBeInTheDocument();
};

afterEach(vi.clearAllMocks);

describe('DialogContext', () => {
  it('should `useDialog` throw if used outside of `DialogProvider`', () => {
    expect(() => render(<DialogConsumer />)).toThrowError(/DialogProvider/i);
    expect(() => render(<DialogConsumerWrapper />)).not.toThrowError();
  });

  it('should show/hide the given dialog data correctly', async () => {
    const user = userEvent.setup();
    render(<DialogConsumerWrapper />);
    assertDialogHidden();
    await user.click(screen.getByRole('button', { name: /show/i }));
    assertDialogVisible();
    await user.click(screen.getByRole('button', { name: /hide/i }));
    assertDialogHidden();
  });

  it('should close after clicking the close button', async () => {
    const user = userEvent.setup();
    render(<DialogConsumerWrapper />);
    await user.click(screen.getByRole('button', { name: /show/i }));
    assertDialogVisible();
    await user.click(screen.getByRole('button', { name: /close/i }));
    assertDialogHidden();
  });

  it('should not close after clicking the close button', async () => {
    shouldHideMock.mockImplementationOnce(() => false);
    const user = userEvent.setup();
    render(<DialogConsumerWrapper />);
    await user.click(screen.getByRole('button', { name: /show/i }));
    assertDialogVisible();
    await user.click(screen.getByRole('button', { name: /close/i }));
    assertDialogVisible();
  });

  it('should close after clicking the close button, and awaiting `shouldHide`', async () => {
    shouldHideMock.mockImplementationOnce(() => Promise.resolve(true));
    const user = userEvent.setup();
    render(<DialogConsumerWrapper />);
    await user.click(screen.getByRole('button', { name: /show/i }));
    assertDialogVisible();
    await user.click(screen.getByRole('button', { name: /close/i }));
    assertDialogHidden();
  });

  it('should not close after clicking the close button, and awaiting `shouldHide`', async () => {
    shouldHideMock.mockImplementationOnce(() => Promise.resolve(false));
    const user = userEvent.setup();
    render(<DialogConsumerWrapper />);
    await user.click(screen.getByRole('button', { name: /show/i }));
    assertDialogVisible();
    await user.click(screen.getByRole('button', { name: /close/i }));
    assertDialogVisible();
  });
});
