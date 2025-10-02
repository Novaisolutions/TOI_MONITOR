import React, { ReactNode } from 'react';
import { useDemoAuthState } from '../../hooks/useDemoAuth';

interface DemoAuthProviderProps {
  children: ReactNode;
}

export const DemoAuthProvider: React.FC<DemoAuthProviderProps> = ({ children }) => {
  const authState = useDemoAuthState();

  return (
    <div>
      {children}
    </div>
  );
};
