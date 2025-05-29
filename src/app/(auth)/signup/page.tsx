import { Metadata } from 'next';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = {
  description: 'Create a new Odin Blog Author account.',
  title: 'Sign Up',
};

export default function Signup() {
  return <AuthForm formType='signup' />;
}
