'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PasswordInput(
  props: React.ComponentProps<'input'>
): React.JSX.Element {
  const [hidden, setHidden] = React.useState<boolean>(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  let currentType: string, togglerLabel: string, TogglerIcon: typeof Eye;

  if (hidden) {
    togglerLabel = 'Show password';
    currentType = 'password';
    TogglerIcon = EyeOff;
  } else {
    togglerLabel = 'Hide password';
    currentType = 'text';
    TogglerIcon = Eye;
  }

  const handleToggleVisibility = () => {
    setHidden(!hidden);
    inputRef.current?.focus();
  };

  return (
    <div className='relative'>
      <Input {...props} type={currentType} ref={inputRef} />
      <div className='absolute top-0 right-0 text-gray-500'>
        <Button
          className='border-0 rounded-l-none shadow-none bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:text-foreground'
          type='button'
          variant='outline'
          aria-label={togglerLabel}
          onClick={handleToggleVisibility}>
          <TogglerIcon />
        </Button>
      </div>
    </div>
  );
}

export default PasswordInput;
