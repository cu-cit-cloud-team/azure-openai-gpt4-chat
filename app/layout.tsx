import type React from 'react';
import './globals.scss';

import { Providers } from '@/app/providers';

export const metadata = {
  title: 'GPT Chat Demo',
  description: 'Powered by Azure OpenAI GPT models',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="page-wrapper">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
