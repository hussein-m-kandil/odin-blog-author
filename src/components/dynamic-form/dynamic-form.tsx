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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '@/components/password-input';
import { DynamicFormProps } from './dynamic-form.types';
import { Loader } from '@/components/loader';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { z } from 'zod';

export function DynamicForm({
  isDisabled = false,
  submitterLabel = { idle: 'Submit', submitting: 'Submitting' },
  submitterClassName,
  submitterIcon,
  formSchema,
  formAttrs,
  className,
  onSubmit,
  children,
  topChildren,
  hookFormRef,
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

  React.useImperativeHandle(hookFormRef, () => hookForm, [hookForm]);

  const handleSubmit = hookForm.handleSubmit((...args) => {
    return onSubmit(hookForm, ...args);
  });

  const submitterLabels = Object.values(submitterLabel);
  const submitterLabelLengths = submitterLabels.map((s) => s.length);
  const submitterMaxLabelLen = Math.max(...submitterLabelLengths);
  const submitterMaxWidthPX = `${Math.round(submitterMaxLabelLen * 12.8)}px`;
  const disabled =
    hookForm.formState.isSubmitting ||
    hookForm.formState.isLoading ||
    isDisabled;

  return (
    <Form {...hookForm}>
      <form
        noValidate
        {...formProps}
        onSubmit={handleSubmit}
        className={cn('space-y-5', className)}>
        {topChildren}
        {Object.entries(formAttrs).map(([name, attrs], i) => (
          <FormField
            key={name}
            control={hookForm.control}
            name={name}
            render={({ field: { value, ...field } }) => {
              const fieldProps = {
                ...field,
                disabled,
                autoFocus: i === 0,
                placeholder: attrs.placeholder,
                value:
                  attrs.type !== 'checkbox' ? (value as string) : undefined,
              };
              return (
                <FormItem>
                  {attrs.type === 'checkbox' ? (
                    <FormItem className='flex flex-row-reverse justify-end gap-2'>
                      <FormControl>
                        <Checkbox
                          {...field}
                          disabled={disabled}
                          defaultChecked={Boolean(attrs.defaultValue)}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>{attrs.label}</FormLabel>
                    </FormItem>
                  ) : (
                    <>
                      <FormLabel>{attrs.label}</FormLabel>
                      <FormControl>
                        {(() => {
                          switch (attrs.type) {
                            case 'password':
                              return <PasswordInput {...fieldProps} />;
                            case 'textarea':
                              return <Textarea {...fieldProps} />;
                            default:
                              return (
                                <Input {...fieldProps} autoComplete='on' />
                              );
                          }
                        })()}
                      </FormControl>
                    </>
                  )}
                  {attrs.description && (
                    <FormDescription>{attrs.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        ))}
        {children}
        <Button
          type='submit'
          disabled={disabled}
          className={cn(`min-w-[${submitterMaxWidthPX}]`, submitterClassName)}>
          {hookForm.formState.isSubmitting ? (
            <>
              <Loader />
              {submitterLabel.submitting}
            </>
          ) : (
            <>
              {submitterIcon}
              {submitterLabel.idle}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

export default DynamicForm;
