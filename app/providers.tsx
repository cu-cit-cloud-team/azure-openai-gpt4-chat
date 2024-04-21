import type React from 'react';

import { TokenStateProvider } from '@/app/contexts/TokenContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TokenStateProvider>{children}</TokenStateProvider>
    </>
  );
};

export default Providers;
