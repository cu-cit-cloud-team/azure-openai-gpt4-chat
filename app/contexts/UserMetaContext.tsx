'use client';

import axios from 'axios';
import propTypes from 'prop-types';
import { createContext, useContext, useEffect } from 'react';
import type React from 'react';
import useLocalStorageState from 'use-local-storage-state';

export const UserMetaContext = createContext(null);

export const useUserMetaContext = () => {
  const context = useContext(UserMetaContext);
  if (context === null) {
    throw new Error(
      'useUserMetaContext must be used within a UserMetaProvider'
    );
  }
  return context;
};

export const UserMetaProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [userMeta, setUserMeta] = useLocalStorageState('userMeta', {
    defaultValue: {},
  });

  useEffect(() => {
    if (userMeta?.email && userMeta?.name) {
      return;
    }
    const getUserMeta = async () => {
      await axios
        .get('/.auth/me', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        })
        .then((response) => {
          const email = response?.data[0]?.user_claims.find(
            (item) => item.typ === 'preferred_username'
          ).val;

          const name = response?.data[0]?.user_claims.find(
            (item) => item.typ === 'name'
          ).val;

          const user_id = response?.data[0]?.user_id;

          const expires_on = response?.data[0]?.expires_on;

          const meta = {
            email,
            name,
            user_id,
            expires_on,
          };

          setUserMeta(meta);
        })
        // biome-ignore lint/correctness/noUnusedVariables: used for debugging
        .catch((error) => {
          // console.error(error);
        });
    };
    getUserMeta();
  }, [userMeta, setUserMeta]);

  return (
    <UserMetaContext.Provider
      value={{
        userMeta,
      }}
    >
      {children}
    </UserMetaContext.Provider>
  );
};

UserMetaProvider.propTypes = {
  children: propTypes.node.isRequired,
};
UserMetaProvider.displayName = 'UserMetaProvider';

export default UserMetaProvider;
