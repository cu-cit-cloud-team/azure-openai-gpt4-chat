import type React from 'react';

import { RefsProvider } from '@/app/contexts/RefsContext';
import { UserMetaProvider } from '@/app/contexts/UserMetaContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <RefsProvider>
        <UserMetaProvider>{children}</UserMetaProvider>
      </RefsProvider>
    </>
  );
};

Providers.displayName = 'Providers';

export default Providers;
