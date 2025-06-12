import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OptionsMenu } from './options-menu';

const triggerLabel = 'Open menu';
const itemsText = ['item 1', 'item 2'];
const items = itemsText.map((text, i) => <div key={i}>{text}</div>);

describe('<OptionsMenu />', () => {
  it('should render nothing if not given items', () => {
    const { container } = render(<OptionsMenu />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing if given an empty array items', () => {
    const { container } = render(<OptionsMenu menuItems={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing if given an array of falsy items', () => {
    const falsyItems = [null, false, '', 0, undefined];
    const { container } = render(<OptionsMenu menuItems={falsyItems} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should only the given trigger be visible if not clicked', () => {
    render(<OptionsMenu triggerLabel={triggerLabel} menuItems={items} />);
    expect(screen.getByLabelText(triggerLabel)).toBeVisible();
    for (const text of itemsText) {
      expect(screen.queryByText(text)).toBeNull();
    }
  });

  it('should the items be visible after clicking the trigger', async () => {
    const user = userEvent.setup();
    render(<OptionsMenu triggerLabel={triggerLabel} menuItems={items} />);
    await user.click(screen.getByLabelText(triggerLabel));
    expect(screen.getByText(itemsText[0])).toBeVisible();
  });

  it('should render a menu with single item', async () => {
    const user = userEvent.setup();
    render(<OptionsMenu triggerLabel={triggerLabel} menuItems={items} />);
    await user.click(screen.getByLabelText(triggerLabel));
    for (const text of itemsText) {
      expect(screen.getByText(text)).toBeVisible();
    }
  });

  it('should render only the truthy items if given a menu with falsy items', async () => {
    const user = userEvent.setup();
    const mixedItems = [items[0], '', false, ...items.slice(1), null, -0, +0];
    const truthyItemsCount = items.length + 2; // Should render any 0 in a menu-item element
    render(<OptionsMenu triggerLabel={triggerLabel} menuItems={mixedItems} />);
    await user.click(screen.getByLabelText(triggerLabel));
    // Use `children` instead of `childNodes`, because all items should be wrapped in a menu-item element
    expect(screen.getByRole('menu').children).toHaveLength(truthyItemsCount);
  });

  it('should the trigger has the given class', async () => {
    const htmlClass = 'blah';
    render(
      <OptionsMenu
        triggerLabel={triggerLabel}
        triggerCN={htmlClass}
        menuItems={items}
      />
    );
    expect(screen.getByLabelText(triggerLabel)).toHaveClass(htmlClass);
  });
});
