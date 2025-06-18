import { User } from '@/types';

export type FormType = 'signin' | 'signup';

export interface AuthFormProps {
  onSuccess?: () => void;
  formLabelId: string;
  formType: FormType;
  user?: User | null;
  className?: string;
}
