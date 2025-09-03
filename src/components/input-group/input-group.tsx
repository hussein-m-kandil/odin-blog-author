import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function InputGroup({
  buttonProps: { className: buttonCN, ...buttonProps } = {},
  className: inputCN,
  id: inputId,
  children,
  ...inputProps
}: React.ComponentProps<typeof Input> & {
  buttonProps?: React.ComponentProps<typeof Button>;
}) {
  const reactId = React.useId();

  const id = inputId || reactId;

  if (buttonProps.disabled === undefined) {
    buttonProps.disabled = inputProps.disabled;
  }

  return (
    <div className='relative'>
      <Input
        {...{
          id,
          type: 'text',
          name: 'input-group',
          autoComplete: 'off',
          ...inputProps,
        }}
        className={cn('pe-12', inputCN)}
      />
      <Button
        {...{
          size: 'icon',
          type: 'button',
          variant: 'outline',
          ...buttonProps,
        }}
        className={cn(
          'absolute top-0 right-0 border-0 shadow-none bg-transparent',
          'rounded-l-none focus-visible:rounded-l-md',
          buttonCN
        )}>
        {children || '?'}
      </Button>
    </div>
  );
}

export default InputGroup;
