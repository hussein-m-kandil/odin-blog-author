import { DialogData, DialogProvider, useDialog } from './dialog-context';
import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
    <button type='button' onClick={() => showDialog(dialogData)}>
      Show Dialog
    </button>
  );
}

describe('DialogContext', () => {
  it('should `useDialog` throw if used outside of `DialogProvider`', () => {
    expect(() =>
      render(
        <div>
          <DialogConsumer />
        </div>
      )
    ).toThrowError(/DialogProvider/i);
    expect(() =>
      render(
        <DialogProvider>
          <div>
            <DialogConsumer />
          </div>
        </DialogProvider>
      )
    ).not.toThrowError();
  });

  it('should show/hide the given dialog data correctly', async () => {
    const user = userEvent.setup();
    render(
      <DialogProvider>
        <div>
          <DialogConsumer />
        </div>
      </DialogProvider>
    );
    expect(screen.queryByRole('button', { name: /hide/i })).toBeNull();
    expect(screen.queryByText(dialogData.title as string)).toBeNull();
    expect(screen.queryByText(dialogData.footer as string)).toBeNull();
    expect(screen.queryByText(dialogData.description as string)).toBeNull();
    await user.click(screen.getByRole('button', { name: /show/i }));
    expect(screen.getByText(dialogData.title as string)).toBeInTheDocument();
    expect(screen.getByText(dialogData.footer as string)).toBeInTheDocument();
    expect(
      screen.getByText(dialogData.description as string)
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /hide/i }));
    expect(screen.queryByRole('button', { name: /hide/i })).toBeNull();
    expect(screen.queryByText(dialogData.title as string)).toBeNull();
    expect(screen.queryByText(dialogData.footer as string)).toBeNull();
    expect(screen.queryByText(dialogData.description as string)).toBeNull();
  });
});
