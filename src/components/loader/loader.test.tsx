import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loader from './loader';

describe('<Loader />', () => {
  it('should render loader with the given props', () => {
    render(<Loader id='test-id' className='test-class' data-test='test' />);
    const loader = screen.getByLabelText(/loading/i);
    expect(loader).toHaveClass('test-class');
    expect(loader).toHaveAttribute('id', 'test-id');
    expect(loader).toHaveAttribute('data-test', 'test');
  });
});
