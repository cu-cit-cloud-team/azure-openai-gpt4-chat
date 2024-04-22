import type React from 'react';

import { UserMetaProvider } from '@/app/contexts/UserMetaContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <UserMetaProvider>{children}</UserMetaProvider>
    </>
  );
};

Providers.displayName = 'Providers';

export default Providers;
