import { createContext } from 'react';
import type { Project } from '../../../../agent/editor/types';

export interface EditorContextType {
  project: Project | null;
  isSynced: boolean;
  setTitle: (title: string) => void;
}

export const EditorContext = createContext<EditorContextType | undefined>(undefined);
