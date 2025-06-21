import { Metadata } from 'next';
import { AuthPage } from '@/components/auth-page';

export const metadata: Metadata = {
  description: `Sign in to your ${process.env.NEXT_PUBLIC_APP_NAME} account.`,
  title: 'Sign In',
};

export default function Signin() {
  return <AuthPage pageType='signin' />;
}
