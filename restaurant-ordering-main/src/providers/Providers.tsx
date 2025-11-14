'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserProvider } from '@/contexts/UserContext';
import { OrderTypeProvider } from '@/contexts/OrderTypeContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <OrderTypeProvider>{children}</OrderTypeProvider>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
