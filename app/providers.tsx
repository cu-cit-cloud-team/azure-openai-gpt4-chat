import type React from 'react';

import { DefaultsProvider } from '@/app/contexts/DefaultsContext';
import { RefsProvider } from '@/app/contexts/RefsContext';
import { UserMetaProvider } from '@/app/contexts/UserMetaContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DefaultsProvider>
        <RefsProvider>
          <UserMetaProvider>{children}</UserMetaProvider>
        </RefsProvider>
      </DefaultsProvider>
    </>
  );
};

Providers.displayName = 'Providers';

export default Providers;
