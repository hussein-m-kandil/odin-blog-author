import { Metadata } from 'next';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = {
  description: 'Sign in to your Odin Blog Author account.',
  title: 'Sign In',
};

export default function Signin() {
  return <AuthForm formType='signin' />;
}
