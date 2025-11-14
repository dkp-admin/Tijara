'use client';

import Image from 'next/image';
import { memo, useCallback } from 'react';
import { cx } from '@/utils/styles';

interface ARButtonProps {
  hasAR: boolean;
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  position?: 'left' | 'right';
}

export const ARButton = memo(
  function ARButton({ hasAR, onClick, position = 'right' }: ARButtonProps) {
    const buttonClasses = cx(
      'absolute bottom-2 mobile-440:bottom-4 md:bottom-4',
      position === 'left' ? 'left-1' : 'right-1',
      'transition-opacity',
      !hasAR && 'pointer-events-none',
    );

    const imageClasses = cx(
      'object-contain transition-opacity duration-200',
      hasAR ? 'cursor-pointer hover:opacity-80' : 'opacity-50',
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (hasAR) onClick(e);
      },
      [hasAR, onClick],
    );

    return (
      <button
        type="button"
        data-ar-available={hasAR}
        aria-label={hasAR ? 'View in AR' : 'AR not available'}
        disabled={!hasAR}
        onClick={handleClick}
        className={buttonClasses}
      >
        <Image
          src={hasAR ? '/assets/AR icon.png' : '/assets/AR unavailable.png'}
          alt={hasAR ? 'AR available' : 'AR not available'}
          width={27}
          height={27}
          className={imageClasses}
          priority
        />
      </button>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.hasAR === nextProps.hasAR && prevProps.position === nextProps.position;
  },
);
