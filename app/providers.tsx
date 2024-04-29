import { ThemeProvider } from 'next-themes';
import type React from 'react';

import { DefaultsProvider } from '@/app/contexts/DefaultsContext';
import { RefsProvider } from '@/app/contexts/RefsContext';
import { UserMetaProvider } from '@/app/contexts/UserMetaContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider attribute="data-theme" defaultTheme="dark">
        <DefaultsProvider>
          <RefsProvider>
            <UserMetaProvider>{children}</UserMetaProvider>
          </RefsProvider>
        </DefaultsProvider>
      </ThemeProvider>
    </>
  );
};

Providers.displayName = 'Providers';

export default Providers;
