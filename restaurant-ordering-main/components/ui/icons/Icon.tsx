'use client';

interface IconProps {
  icon: 'search' | 'close' | 'ar';
  size?: number;
  className?: string;
}

export function Icon({ icon, size = 24, className = '' }: IconProps) {
  const icons = {
    search: <path d="M11 11 L21 21 M11 11 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" />,
    close: <path d="M18 6L6 18M6 6l12 12" />,
    ar: <path d="M12 18l-6-6 6-6M7 12h14" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      {icons[icon]}
    </svg>
  );
}
