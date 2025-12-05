import { Provider } from 'jotai';
import { ThemeProvider } from 'next-themes';
import type React from 'react';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </Provider>
  );
};

Providers.displayName = 'Providers';

export default Providers;
