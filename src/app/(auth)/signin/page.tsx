import { Metadata } from 'next';
import { AuthPage } from '@/components/auth-page';

export const metadata: Metadata = {
  description: 'Sign in to your Odin Blog Author account.',
  title: 'Sign In',
};

export default function Signin() {
  return <AuthPage pageType='signin' />;
}
