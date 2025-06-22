import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OptionsMenu } from './options-menu';

const itemsText = ['item 1', 'item 2'];
const items = itemsText.map((text, i) => <div key={i}>{text}</div>);
const props = { className: 'test-class', 'aria-label': 'test-label' };

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

  it('should the trigger have the given props', () => {
    render(<OptionsMenu triggerProps={props} menuItems={items} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass(props.className);
    expect(trigger).toHaveAttribute('aria-label', props['aria-label']);
  });

  it('should the menu have the given props', async () => {
    const user = userEvent.setup();
    render(<OptionsMenu menuProps={props} menuItems={items} />);
    await user.click(screen.getByRole('button'));
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass(props.className);
    expect(menu).toHaveAttribute('aria-label', props['aria-label']);
  });

  it('should only the given trigger be visible if not clicked', () => {
    render(<OptionsMenu triggerProps={props} menuItems={items} />);
    expect(screen.getByRole('button')).toBeVisible();
    for (const text of itemsText) {
      expect(screen.queryByText(text)).toBeNull();
    }
  });

  it('should the items be visible after clicking the trigger', async () => {
    const user = userEvent.setup();
    render(<OptionsMenu triggerProps={props} menuItems={items} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText(itemsText[0])).toBeVisible();
  });

  it('should render a menu with single item', async () => {
    const user = userEvent.setup();
    render(<OptionsMenu triggerProps={props} menuItems={items} />);
    await user.click(screen.getByRole('button'));
    for (const text of itemsText) {
      expect(screen.getByText(text)).toBeVisible();
    }
  });

  it('should render only the truthy items if given a menu with falsy items', async () => {
    const user = userEvent.setup();
    const mixedItems = [items[0], '', false, ...items.slice(1), null, -0, +0];
    const truthyItemsCount = items.length + 2; // Should render any 0 in a menu-item element
    render(<OptionsMenu triggerProps={props} menuItems={mixedItems} />);
    await user.click(screen.getByRole('button'));
    // Use `children` instead of `childNodes`, because all items should be wrapped in a menu-item element
    expect(screen.getByRole('menu').children).toHaveLength(truthyItemsCount);
  });
});
