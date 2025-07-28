import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initAuthData, mockDialogContext, post } from '@/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { PostOptionsMenu } from './post-options-menu';
import { AuthProvider } from '@/contexts/auth-context';

const { showDialog } = mockDialogContext();

const PostOptionsMenuWrapper = (
  props: React.ComponentProps<typeof PostOptionsMenu>
) => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider initAuthData={initAuthData}>
        <PostOptionsMenu {...props} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

afterEach(vi.clearAllMocks);

describe('<PostOptionsMenu />', () => {
  it('should render menu button with hidden menu while it is not not clicked yet', () => {
    render(<PostOptionsMenuWrapper post={post} />);
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /delete/i })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /update|edit/i })).toBeNull();
  });

  it('should display the menu after clicking the menu button', async () => {
    const user = userEvent.setup();
    render(<PostOptionsMenuWrapper post={post} />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    expect(
      screen.getByRole('menuitem', { name: /delete/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /update|edit/i })
    ).toBeInTheDocument();
  });

  it('should show dialog after clicking update', async () => {
    const user = userEvent.setup();
    render(<PostOptionsMenuWrapper post={post} />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    await user.click(screen.getByRole('menuitem', { name: /update|edit/i }));
    expect(showDialog).toHaveBeenCalledOnce();
  });

  it('should show dialog after clicking delete', async () => {
    const user = userEvent.setup();
    render(<PostOptionsMenuWrapper post={post} />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    await user.click(screen.getByRole('menuitem', { name: /delete/i }));
    expect(showDialog).toHaveBeenCalledOnce();
  });
});
