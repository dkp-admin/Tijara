'use client';

import { cx } from '@/utils/styles';

interface QuantityCounterProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'small' | 'large' | 'xlarge';
  showCounter: boolean;
  onAdd: () => void;
  onHide: () => void;
  onInitialAdd?: () => void;
}

export function QuantityCounter({
  quantity,
  onIncrement,
  onDecrement,
  size = 'large',
  showCounter,
  onAdd,
  onHide,
  onInitialAdd,
}: QuantityCounterProps) {
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity <= 1) {
      onHide(); // Hide counter when quantity would go below 1
    }
    onDecrement();
  };

  if (!showCounter) {
    return (
      <button
        onClick={(e) =>
          handleClick(e, () => {
            onInitialAdd?.();
            onAdd();
          })
        }
        className={cx(
          'rounded-[18px] font-medium',
          'bg-[#EBEBEB] dark:bg-[#2A2A2A]',
          'text-[#FF4201] dark:text-[#FF6B00]',
          size === 'xlarge'
            ? 'h-[44px] px-7 text-lg'
            : size === 'large'
              ? 'h-[28px] px-4 text-sm'
              : size === 'small'
                ? 'h-[24px] w-[70px] text-xs'
                : '',
        )}
      >
        ADD
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cx(
        'flex items-center rounded-[18px]',
        'bg-[#EBEBEB] dark:bg-[#2A2A2A]',
        size === 'xlarge'
          ? 'h-[44px] w-[130px]'
          : size === 'large'
            ? 'h-[28px] w-[90px]'
            : 'h-[24px] w-[70px]',
      )}
    >
      <button
        onClick={handleDecrement}
        className={cx(
          size === 'xlarge' ? 'w-10 h-full text-2xl' : 'w-6 h-full',
          'flex items-center justify-center',
          'text-[#FF4201] dark:text-[#FF6B00]',
          'border-r border-black/5 dark:border-white/10',
        )}
      >
        <span
          className={cx(
            size === 'xlarge' ? 'text-2xl' : 'text-xs',
            'transform scale-x-110 scale-y-75',
          )}
        >
          −
        </span>
      </button>
      <div
        className={cx(
          'flex-1 text-center px-2',
          'text-black dark:text-white',
          size === 'xlarge' ? 'text-lg' : size === 'large' ? 'text-sm' : 'text-xs',
        )}
      >
        {quantity}
      </div>
      <button
        onClick={(e) => handleClick(e, onIncrement)}
        className={cx(
          size === 'xlarge' ? 'w-10 h-full text-2xl' : 'w-6 h-full',
          'flex items-center justify-center',
          'text-[#FF4201] dark:text-[#FF6B00]',
          'border-l border-black/5 dark:border-white/10',
        )}
      >
        <span className={cx(size === 'xlarge' ? 'text-2xl' : 'text-xs')}>+</span>
      </button>
    </div>
  );
}
