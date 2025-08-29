import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Querybox } from './querybox';

type QueryboxProps = React.ComponentProps<typeof Querybox>;

const QueryboxWrapper = (props: QueryboxProps) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <Querybox {...props} />
    </QueryClientProvider>
  );
};

const onSearch = vi.fn(() => ['x', 'y', 'z']);
const onValidate = vi.fn(() => true);
const onSelect = vi.fn();
const triggerText = 'Open';

const props: QueryboxProps = {
  blacklist: [],
  onSearch,
  onSelect,
  onValidate,
  triggerContent: triggerText,
};

describe('<Querybox />', () => {
  afterEach(vi.clearAllMocks);

  it('should display the given `triggerContent`', () => {
    render(<QueryboxWrapper {...props} />);
    expect(screen.getByText(triggerText)).toBeInTheDocument();
  });

  it('should display search input after clicking on the trigger', async () => {
    const user = userEvent.setup();
    render(<QueryboxWrapper {...props} />);
    await user.click(screen.getByText(triggerText));
    const searchInp = screen.getByLabelText(/search/i) as HTMLInputElement;
    expect(searchInp).toBeInTheDocument();
    expect(searchInp).toHaveAttribute('type', 'text');
  });

  it('should call `onSearch` while typing', async () => {
    const user = userEvent.setup();
    render(<QueryboxWrapper {...props} />);
    await user.click(screen.getByText(triggerText));
    await user.type(screen.getByLabelText(/search/i), 'xyz');
    expect(screen.getByDisplayValue('xyz')).toBeInTheDocument();
    expect(onSearch.mock.calls).toStrictEqual([['x'], ['xy'], ['xyz']]);
  });

  it('should call `onValidate` while typing', async () => {
    const user = userEvent.setup();
    render(<QueryboxWrapper {...props} />);
    await user.click(screen.getByText(triggerText));
    await user.type(screen.getByLabelText(/search/i), 'xyz');
    expect(screen.getByDisplayValue('xyz')).toBeInTheDocument();
    expect(onValidate.mock.calls).toStrictEqual([['x'], ['xy'], ['xyz']]);
  });

  it('should prevent typing invalid input', async () => {
    onValidate.mockImplementation(() => false);
    const user = userEvent.setup();
    render(<QueryboxWrapper {...props} />);
    await user.click(screen.getByText(triggerText));
    await user.type(screen.getByLabelText(/search/i), 'xyz');
    expect(onValidate.mock.calls).toStrictEqual([['x'], ['y'], ['z']]);
    expect(screen.queryByDisplayValue('xyz')).toBeNull();
    expect(onSearch).not.toHaveBeenCalled();
    onValidate.mockReset();
  });

  it('should display the typed text as the first option', async () => {
    const user = userEvent.setup();
    onSearch.mockImplementation(() => ['x', 'y', 'z']);
    render(<QueryboxWrapper {...{ ...props, blacklist: ['x', 'y'] }} />);
    await user.click(screen.getByText(triggerText));
    await user.type(screen.getByLabelText(/search/i), 'xyz');
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('xyz');
    onSearch.mockReset();
  });

  it('should show a list of the response result minus any value from the given blacklist', async () => {
    const user = userEvent.setup();
    onSearch.mockImplementation(() => ['xyz', 'xy', 'x']);
    render(<QueryboxWrapper {...{ ...props, blacklist: ['x', 'xy'] }} />);
    await user.click(screen.getByText(triggerText));
    await user.type(screen.getByLabelText(/search/i), 'x');
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('x');
    expect(screen.getAllByRole('option')[1]).toHaveTextContent('xyz');
    onSearch.mockReset();
  });

  it('should show the prefect match once at the start of the list', async () => {
    const user = userEvent.setup();
    onSearch.mockImplementation(() => ['xyz', 'xy', 'x']);
    render(<QueryboxWrapper {...{ ...props, blacklist: ['xy', 'x'] }} />);
    await user.click(screen.getByText(triggerText));
    await user.type(screen.getByLabelText(/search/i), 'xyz');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('xyz');
    onSearch.mockReset();
  });

  it('should call `onSelect` with the selected value and the search result', async () => {
    const user = userEvent.setup();
    render(<QueryboxWrapper {...props} />);
    await user.click(screen.getByText(triggerText));
    await user.type(screen.getByLabelText(/search/i), 'xyz');
    const options = screen.getAllByRole('option');
    await user.click(options[0]);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenNthCalledWith(
      1,
      options[0].textContent,
      options.slice(1).map((o) => o.textContent)
    );
  });
});
