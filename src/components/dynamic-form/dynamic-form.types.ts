import { UseFormReturn, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

export interface DynamicFormFieldAttrs {
  type?: 'text' | 'password' | undefined;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue: string;
  schema: z.ZodSchema;
}

export type DynamicFormAttrs = Record<string, DynamicFormFieldAttrs>;

export type DynamicFormSchema = z.ZodSchema;

export type DynamicFormSubmitHandler<T> = (
  hookForm: UseFormReturn,
  ...args: Parameters<SubmitHandler<T>>
) => ReturnType<SubmitHandler<T>>;

export type SubmitterLabel = {
  submitting: string;
  idle: string;
};

export interface DynamicFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSubmit: DynamicFormSubmitHandler<object>;
  submitterLabel?: SubmitterLabel;
  formSchema: DynamicFormSchema;
  formAttrs: DynamicFormAttrs;
  submitterClassName?: string;
}
