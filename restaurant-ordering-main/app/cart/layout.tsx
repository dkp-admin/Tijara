'use client';

import { ThemeContainer } from '@/components/ui/ThemeProvider';

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <ThemeContainer>{children}</ThemeContainer>;
}
