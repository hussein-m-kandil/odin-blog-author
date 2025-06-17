import { DynamicFormAttrs } from '@/components/dynamic-form';
import { z } from 'zod';

export const injectDefaultValuesInDynamicFormAttrs = (
  formAttrs: DynamicFormAttrs,
  defaultValues: object
): DynamicFormAttrs => {
  const values = Object.fromEntries(Object.entries(defaultValues));
  return Object.fromEntries(
    Object.entries(formAttrs).map(([name, attrs]) => [
      name,
      {
        ...attrs,
        defaultValue:
          attrs.type === 'password'
            ? ''
            : String(values[name] ?? attrs.defaultValue),
      },
    ])
  );
};

export const transformDynamicFormAttrsIntoSchema = (
  postFormAttrs: DynamicFormAttrs
) => {
  return z.object(
    Object.fromEntries(
      Object.entries(postFormAttrs).map(([name, attrs]) => [name, attrs.schema])
    )
  );
};
