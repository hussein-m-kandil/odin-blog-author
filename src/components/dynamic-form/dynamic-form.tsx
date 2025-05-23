'use client';

import React from 'react';

import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '@/components/password-input';
import { DynamicFormProps } from './dynamic-form.types';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { z } from 'zod';

export function DynamicForm({
  submitterLabel = { idle: 'Submit', submitting: 'Submitting' },
  submitterClassName,
  formSchema,
  formAttrs,
  className,
  onSubmit,
  ...formProps
}: DynamicFormProps) {
  const hookForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.fromEntries(
      Object.entries(formAttrs).map(([name, attrs]) => [
        name,
        attrs.defaultValue,
      ])
    ),
  });

  const { setFocus } = hookForm;

  const getFirstFieldName = React.useCallback(() => {
    return Object.keys(formAttrs)[0];
  }, [formAttrs]);

  React.useEffect(() => {
    setFocus(getFirstFieldName());
  }, [setFocus, getFirstFieldName]);

  const handleSubmit = hookForm.handleSubmit((...args) => {
    return onSubmit(hookForm, ...args);
  });

  const submitterLabels = Object.values(submitterLabel);
  const submitterLabelLengths = submitterLabels.map((s) => s.length);
  const submitterMaxLabelLen = Math.max(...submitterLabelLengths);
  const submitterMaxWidthPX = `${Math.round(submitterMaxLabelLen * 12.8)}px`;

  return (
    <Form {...hookForm}>
      <form
        {...formProps}
        onSubmit={handleSubmit}
        className={cn('space-y-5', className)}>
        {Object.entries(formAttrs).map(([name, attrs]) => (
          <FormField
            key={name}
            control={hookForm.control}
            name={name}
            render={({ field }) => {
              const fieldProps = { ...field, placeholder: attrs.placeholder };
              return (
                <FormItem>
                  <FormLabel>{attrs.label}</FormLabel>
                  <FormControl>
                    {attrs.type === 'password' ? (
                      <PasswordInput {...fieldProps} autoComplete='off' />
                    ) : (
                      <Input {...fieldProps} autoComplete='on' />
                    )}
                  </FormControl>
                  {attrs.description && (
                    <FormDescription>{attrs.description}</FormDescription>
                  )}
                  <div className='h-3.5'>
                    <FormMessage />
                  </div>
                </FormItem>
              );
            }}
          />
        ))}
        <Button
          type='submit'
          disabled={
            hookForm.formState.isSubmitting || hookForm.formState.isLoading
          }
          className={cn(`min-w-[${submitterMaxWidthPX}]`, submitterClassName)}>
          {hookForm.formState.isSubmitting ? (
            <>
              <Loader2 className='animate-spin' />
              {submitterLabel.submitting}
            </>
          ) : (
            submitterLabel.idle
          )}
        </Button>
      </form>
    </Form>
  );
}

export default DynamicForm;
