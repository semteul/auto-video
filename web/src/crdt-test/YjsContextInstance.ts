import { createContext } from 'react';

export interface YjsContextType {
  title: string|null;
  setTitle: (title: string) => void;
}

export const YjsContext = createContext<YjsContextType | undefined>(undefined);
