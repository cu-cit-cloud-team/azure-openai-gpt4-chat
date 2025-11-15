import { Provider } from 'jotai';
import { ThemeProvider } from 'next-themes';
import type React from 'react';

import { themes } from '@/app/utils/themes';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <ThemeProvider attribute="data-theme" defaultTheme="dark" themes={themes}>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

Providers.displayName = 'Providers';

export default Providers;
