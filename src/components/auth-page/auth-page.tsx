import Link from 'next/link';
import { P } from '@/components/typography/p';
import { H1 } from '@/components/typography/h1';
import { AuthForm } from '@/components/auth-form';
import { FormType } from '../auth-form/auth-form.types';

export type PageType = FormType;

export function AuthPage({ pageType }: { pageType: PageType }) {
  let title, titleId, qPrefix, qLinkHref, qLinkText;
  if (pageType === 'signup') {
    title = 'Sign Up';
    qPrefix = 'Already';
    qLinkHref = '/signin';
    qLinkText = 'Sign in';
    titleId = 'signup-page-title';
  } else {
    title = 'Sign In';
    qPrefix = 'Do not';
    qLinkHref = '/signup';
    qLinkText = 'Sign up';
    titleId = 'signin-page-title';
  }

  return (
    <>
      <header className='mt-8'>
        <H1 id={titleId} className='text-center'>
          {title}
        </H1>
      </header>
      <main className='mb-4'>
        <AuthForm formType={pageType} formLabelId={titleId} />
        <P className='text-center'>
          {qPrefix} have an account?{' '}
          <Link href={qLinkHref} className='p-0'>
            {qLinkText}
          </Link>
        </P>
      </main>
    </>
  );
}

export default AuthPage;
