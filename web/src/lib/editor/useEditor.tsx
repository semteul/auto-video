import { useContext } from 'react';
import { EditorContext } from './EditorContext';
import type { EditorContextType } from './EditorContext';

const useEditor = (): EditorContextType => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within a EditorProvider');
  return ctx;
};

export default useEditor;