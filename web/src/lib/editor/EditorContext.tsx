
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { EditorContext } from './EditorContextInstance';
import type {
  Project,
} from '../../../../agent/editor/types';
import { fetchProject } from '../../../../agent/editor/projectSync';
import { broadcastTitleChange } from '../../../../agent/editor/broadcast';
import { createAgentRoom } from './callAgent';

export type { EditorContextType } from './EditorContextInstance';
export { EditorContext } from './EditorContextInstance';

interface EditorProviderProps {
  id: string;
  children: React.ReactNode;
}

/**
 * project 상태는 shallow equality를 보장하므로, memo를 사용해 부분 렌더링 가능
 */
export const EditorProvider: React.FC<EditorProviderProps> = ({ id, children }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const ydocRef = useRef(new Y.Doc());

  useEffect(() => {
    ydocRef.current.destroy();
    ydocRef.current = new Y.Doc();
    const provider = new WebsocketProvider('ws://localhost:1234', id, ydocRef.current);

    const ydoc = ydocRef.current;

    const updateProject = () => {
      setProject(prev => {
        if (prev) {
          return fetchProject(ydoc, prev);
        } else {
          return fetchProject(ydoc);
        }
      });
    };

    provider.on('sync', (isSynced) => {
      if (isSynced) {
        // 동기화 완료 후 초기 데이터 로드
        updateProject();
        setIsSynced(true);

        const projectMap = ydoc.getMap("project");
        if (projectMap.size === 0) {
          // BE agent에게 초기 데이터 요청
          createAgentRoom(id);
        }
      } else {
        setIsSynced(false);
      }
    });


    const projectMap = ydoc.getMap("project");
    projectMap.observeDeep(updateProject);

    return () => {
      // observers 해제
      projectMap.unobserveDeep(updateProject);
      provider.disconnect();
      ydocRef.current.destroy();
    };

  }, [id]);

  const value = useMemo(() => ({
    isSynced,
    project,
    setTitle: (title: string) => {
      const ydoc = ydocRef.current;
      broadcastTitleChange(ydoc, title);
    }
  }), [project, isSynced]);
  
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};
