import * as React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import useSound from '@/hooks/useSound';

interface SoundButtonProps extends ButtonProps {
  soundType?: 'click' | 'success' | 'notification';
}

const SoundButton = React.forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ soundType = 'click', onClick, ...props }, ref) => {
    const { playClick, playSuccess, playNotification } = useSound();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play the appropriate sound
      switch (soundType) {
        case 'success':
          playSuccess();
          break;
        case 'notification':
          playNotification();
          break;
        default:
          playClick();
      }

      // Call the original onClick handler
      onClick?.(e);
    };

    return <Button ref={ref} onClick={handleClick} {...props} />;
  }
);

SoundButton.displayName = 'SoundButton';

export { SoundButton };
