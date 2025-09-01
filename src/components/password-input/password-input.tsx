'use client';

import React from 'react';
import { InputGroup } from '@/components/input-group';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordInput(
  props: React.ComponentProps<'input'>
): React.JSX.Element {
  const [hidden, setHidden] = React.useState<boolean>(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  let inpType: string, btnLabel: string, EyeIcon: typeof Eye;

  if (hidden) {
    btnLabel = 'Show password';
    inpType = 'password';
    EyeIcon = EyeOff;
  } else {
    btnLabel = 'Hide password';
    inpType = 'text';
    EyeIcon = Eye;
  }

  const toggleVisibility = () => {
    setHidden(!hidden);
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
    }
  };

  return (
    <InputGroup
      {...props}
      ref={inputRef}
      type={inpType}
      buttonProps={{
        ['aria-label']: btnLabel,
        onClick: toggleVisibility,
        type: 'button',
      }}>
      <EyeIcon />
    </InputGroup>
  );
}

export default PasswordInput;
