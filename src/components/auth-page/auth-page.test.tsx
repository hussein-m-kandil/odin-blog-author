import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthPage, PageType } from './auth-page';
import { describe, expect, it } from 'vitest';
import { initAuthData } from '@/test-utils';

const AuthPageWrapper = (props: React.ComponentProps<typeof AuthPage>) => {
  return (
    <AuthProvider initAuthData={initAuthData}>
      <AuthPage {...props} />
    </AuthProvider>
  );
};

describe('<AuthPage />', () => {
  const pageTypes: PageType[] = ['signin', 'signup'];

  for (const pageType of pageTypes) {
    const oppositeSuffix = pageType === 'signup' ? 'in' : 'up';

    it('should display descriptive heading', () => {
      render(<AuthPageWrapper pageType={pageType} />);
      expect(
        screen.getByRole('heading', { name: /sign/i })
      ).toBeInTheDocument();
    });

    it('should display a form', () => {
      render(<AuthPageWrapper pageType={pageType} />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it(`should display a link for signing ${oppositeSuffix}`, () => {
      render(<AuthPageWrapper pageType={pageType} />);
      expect(
        screen.getByRole('link', {
          name: new RegExp(`sign ?${oppositeSuffix}`, 'i'),
        })
      ).toBeInTheDocument();
    });
  }
});
