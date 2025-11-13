'use client';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen transition-colors duration-200 bg-background-light dark:bg-background-dark">
      {children}
    </div>
  );
}
