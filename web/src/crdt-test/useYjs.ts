import { useContext } from 'react';
import { YjsContext } from './YjsContextInstance';
import type { YjsContextType } from './YjsContextInstance';

const useYjs = (): YjsContextType => {
  const ctx = useContext(YjsContext);
  if (!ctx) throw new Error('useYjs must be used within a YjsProvider');
  return ctx;
};

export default useYjs;
