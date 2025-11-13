'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/assets/placeholder.png',
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  return (
    <Image src={error ? fallbackSrc : src} alt={alt} onError={() => setError(true)} {...props} />
  );
}
