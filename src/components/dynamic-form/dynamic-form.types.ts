/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormReturn, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

export interface DynamicFormFieldAttrs {
  type?: 'text' | 'password' | 'textarea' | 'checkbox' | undefined;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue: string | boolean;
  schema: z.ZodSchema;
}

export type DynamicFormAttrs = Record<string, DynamicFormFieldAttrs>;

export type DynamicFormSchema = z.ZodSchema<any, any>;

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
  onSubmit: DynamicFormSubmitHandler<Record<string, any>>;
  hookFormRef?: React.Ref<UseFormReturn>;
  submitterIcon?: React.ReactNode;
  submitterLabel?: SubmitterLabel;
  topChildren?: React.ReactNode;
  formSchema: DynamicFormSchema;
  formAttrs: DynamicFormAttrs;
  submitterClassName?: string;
  isDisabled?: boolean;
}
