import type { Metadata } from 'next';
import { Red_Hat_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/src/providers/Providers';
import { cx } from '@/utils/styles';
import NextTopLoader from 'nextjs-toploader';

const redHat = Red_Hat_Display({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Restaurant Menu',
  description: 'Digital menu experience',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cx(redHat.className, 'antialiased')}>
        <NextTopLoader color="#FF4201" height={3} showSpinner={false} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
