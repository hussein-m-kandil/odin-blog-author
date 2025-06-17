import { Metadata } from 'next';
import { AuthPage } from '@/components/auth-page';

export const metadata: Metadata = {
  description: 'Create a new Odin Blog Author account.',
  title: 'Sign Up',
};

export default function Signup() {
  return <AuthPage pageType='signup' />;
}
