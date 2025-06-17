import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthPage, PageType } from './auth-page';

describe('<AuthPage />', () => {
  const pageTypes: PageType[] = ['signin', 'signup'];

  for (const pageType of pageTypes) {
    const oppositeSuffix = pageType === 'signup' ? 'in' : 'up';

    it('should display descriptive heading', () => {
      render(<AuthPage pageType={pageType} />);
      expect(
        screen.getByRole('heading', { name: /sign/i })
      ).toBeInTheDocument();
    });

    it('should display a form', () => {
      render(<AuthPage pageType={pageType} />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it(`should display a link for signing ${oppositeSuffix}`, () => {
      render(<AuthPage pageType={pageType} />);
      expect(
        screen.getByRole('link', {
          name: new RegExp(`sign ?${oppositeSuffix}`, 'i'),
        })
      ).toBeInTheDocument();
    });
  }
});
