import { useContext } from 'react';
import { YjsContextType, YjsContext } from './YjsContext';

const useYjs = (): YjsContextType => {
  const ctx = useContext(YjsContext);
  if (!ctx) throw new Error('useYjs must be used within a YjsProvider');
  return ctx;
};

export default useYjs;
