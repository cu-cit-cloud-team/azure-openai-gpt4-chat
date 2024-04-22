'use client';

import propTypes from 'prop-types';
import { createContext, useContext, useRef } from 'react';

export const RefsContext = createContext(null);

export const useRefsContext = () => {
  const context = useContext(RefsContext);
  if (context === null) {
    throw new Error('useRefsContext must be used within a RefsProvider');
  }
  return context;
};

export const RefsProvider = ({ children }) => {
  const systemMessageRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <RefsContext.Provider
      value={{
        systemMessageRef,
        textAreaRef,
        formRef,
      }}
    >
      {children}
    </RefsContext.Provider>
  );
};

RefsProvider.displayName = 'RefsProvider';
RefsProvider.propTypes = {
  children: propTypes.node.isRequired,
};

export default RefsProvider;
