import type React from 'react';

import './globals.css';

import { Providers } from '@/app/providers';

export const metadata = {
  title: 'Cloud Team Chat',
  description: 'Powered by Azure OpenAI Service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="page-wrapper">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
