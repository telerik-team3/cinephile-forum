// Holds the currently logged-in user and profile data, accessible anywhere in the app

import { createContext } from 'react';

export const AppContext = createContext({
  user: null,
  userData: null,
  setAppState: () => {},
});