export type FormType = 'signin' | 'signup' | 'update';

export interface AuthFormProps {
  onSuccess?: () => void;
  formType: FormType;
  className?: string;
}
