
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { YjsContext } from './YjsContextInstance';
import type { Interval, Media, Project, Scene, Section, Word, YjsProviderProps } from './yjsTypes';
import { createYjsActions } from './yjsActions';

export const YjsProvider: React.FC<YjsProviderProps> = ({ roomId, children }) => {
  const [project, setProject] = useState<Project|null>(null);
  const [sections, setSections] = useState<Map<string, Section>>(new Map());
  const [scenes, setScenes] = useState<Map<string, Scene>>(new Map());
  const [media, setMedia] = useState<Map<string, Media>>(new Map());
  const [intervals, setIntervals] = useState<Map<string, Interval>>(new Map());
  const [words, setWords] = useState<Map<string, Word>>(new Map());

  const ydocRef = useRef(new Y.Doc());
  const [actions, setActions] = useState<ReturnType<typeof createYjsActions> | null>(null);


  useEffect(() => {
    ydocRef.current.destroy();
    ydocRef.current = new Y.Doc();
    const provider = new WebsocketProvider('wss://demos.yjs.dev', roomId, ydocRef.current);

    const yTitle = ydocRef.current.getText('title');
    const ySectionOrder = ydocRef.current.getArray<string>('sectionOrder');
    const ySceneOrder = ydocRef.current.getArray<string>('sceneOrder');
    const yMediaOrder = ydocRef.current.getArray<string>('mediaOrder');

    const ySections = ydocRef.current.getMap<Section>('sections');
    const yScenes = ydocRef.current.getMap<Scene>('scenes');
    const yMedia = ydocRef.current.getMap<Media>('media');
    const yIntervals = ydocRef.current.getMap<Interval>('intervals');
    const yWords = ydocRef.current.getMap<Word>('words');
    
    const updateTitle = () => {
      setProject(prev => ({
        ...prev,
        title: yTitle.toString()
      } as Project));
    }

    const updateSectionOrder = () => {
      setProject(prev => ({
        ...prev,
        sectionOrder: ySectionOrder.toArray()
      } as Project));
    }

    const updateSceneOrder = () => {
      setProject(prev => ({
        ...prev,
        sceneOrder: ySceneOrder.toArray()
      } as Project));
    }

    const updateMediaOrder = () => {
      setProject(prev => ({
        ...prev,
        mediaOrder: yMediaOrder.toArray()
      } as Project));
    }

    const updateSections = () => {
      setSections(new Map(ySections.entries()));
    }

    const updateScenes = () => {
      setScenes(new Map(yScenes.entries()));
    }

    const updateMedia = () => {
      setMedia(new Map(yMedia.entries()));
    }

    const updateIntervals = () => {
      setIntervals(new Map(yIntervals.entries()));
    }

    const updateWords = () => {
      setWords(new Map(yWords.entries()));
    }


    yTitle.observe(updateTitle);
    ySectionOrder.observe(updateSectionOrder);
    ySceneOrder.observe(updateSceneOrder);
    yMediaOrder.observe(updateMediaOrder);
    ySections.observe(updateSections);
    yScenes.observe(updateScenes);
    yMedia.observe(updateMedia);
    yIntervals.observe(updateIntervals);
    yWords.observe(updateWords);

    const initTimer = setTimeout(() => {
      setActions(() => createYjsActions(() => ydocRef.current));
      updateTitle();
      updateSectionOrder();
      updateSceneOrder();
      updateMediaOrder();
      updateSections();
      updateScenes();
      updateMedia();
      updateIntervals();
      updateWords();
    }, 0);

    return () => {
      clearTimeout(initTimer);
      yTitle.unobserve(updateTitle);
      ySectionOrder.unobserve(updateSectionOrder);
      ySceneOrder.unobserve(updateSceneOrder);
      yMediaOrder.unobserve(updateMediaOrder);
      ySections.unobserve(updateSections);
      yScenes.unobserve(updateScenes);
      yMedia.unobserve(updateMedia);
      yIntervals.unobserve(updateIntervals);
      yWords.unobserve(updateWords);
      provider.disconnect();
      ydocRef.current.destroy();
    };

  }, [roomId]);

  const value = useMemo(() => ({
    project,
    sections,
    scenes,
    media,
    intervals,
    words,
    actions
  }), [project, sections, scenes, media, intervals, words, actions]);
  
  return <YjsContext.Provider value={value}>{children}</YjsContext.Provider>;
};
