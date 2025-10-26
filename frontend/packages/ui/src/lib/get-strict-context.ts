'use client';

import * as React from 'react';

type StrictContextType<T> = [
  React.Provider<T>,
  () => T,
];

function getStrictContext<T>(
  displayName: string,
): StrictContextType<T> {
  const Context = React.createContext<T | undefined>(undefined);

  const Provider = Context.Provider;

  const useContext = (): T => {
    const value = React.useContext(Context);
    if (value === undefined) {
      throw new Error(
        `useContext must be used within a ${displayName} provider`,
      );
    }
    return value;
  };

  return [Provider, useContext];
}

export { getStrictContext };
