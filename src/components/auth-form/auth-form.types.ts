export type FormType = 'signin' | 'signup' | 'update';

export interface AuthFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  formType: FormType;
}
