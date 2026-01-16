import { createContext } from 'react';
import type { Interval, Media, Project, Scene, Section, Word } from './yjsTypes';
import type { YjsActions } from './yjsActions';

export interface YjsContextType {
  project: Project | null;
  sections: Map<string, Section>;
  scenes: Map<string, Scene>;
  media: Map<string, Media>;
  intervals: Map<string, Interval>;
  words: Map<string, Word>;
  actions: YjsActions | null;
}

export const YjsContext = createContext<YjsContextType | undefined>(undefined);
