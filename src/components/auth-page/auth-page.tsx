import { H1 } from '@/components/typography/h1';
import { AuthForm, FormType } from '@/components/auth-form';

export type PageType = FormType;

export function AuthPage({ pageType }: { pageType: PageType }) {
  return (
    <>
      <header className='mt-8'>
        <H1 className='text-center'>
          Sign {pageType === 'signup' ? 'Up' : 'In'}
        </H1>
      </header>
      <main className='mb-4'>
        <AuthForm formType={pageType} />
      </main>
    </>
  );
}

export default AuthPage;
