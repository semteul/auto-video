import type { ReactNode } from 'react';

export interface YjsProviderProps {
  roomId: string;
  children: ReactNode;
}

export interface Project {
  title: string;
  sectionOrder: string[];
  sceneOrder: string[];
  mediaOrder: string[];
}

export interface Section {
  type: 'speech' | 'break';
  isSpeechGenerated: boolean;
  duration: number;
  intervalOrder: string[];
}

export interface Interval {
  wordOrder: string[];
}

export interface Word {
  text: string;
  startTime: number;
  endTime: number;
}

export interface Scene {
  type: 'image' | 'video';
  mediaId: string;
  intervalCount: number;
}

export interface Media {
  type: 'image' | 'video';
}
