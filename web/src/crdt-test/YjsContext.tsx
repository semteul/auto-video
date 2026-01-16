
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { YjsContext } from './YjsContextInstance';

interface YjsProviderProps {
  id: string;
  children: React.ReactNode;
}

const setYdocTitle = (ydoc: Y.Doc, title: string) => {
  const ytitle = ydoc.getText('title');
  ydoc.transact(() => {
    ytitle.delete(0, ytitle.length);
    ytitle.insert(0, title);
  }, 'local');
}

export const YjsProvider: React.FC<YjsProviderProps> = ({ id, children }) => {
  const [title, setTitleState] = useState<string|null>(null);
  const ydocRef = useRef(new Y.Doc());


  useEffect(() => {
    ydocRef.current.destroy();
    ydocRef.current = new Y.Doc();
    const provider = new WebsocketProvider('wss://demos.yjs.dev', id, ydocRef.current);

    const ytitle = ydocRef.current.getText('title');
    const updateTitle = () => {
      setTitleState(ytitle.toString());
    }

    ytitle.observe(updateTitle);
    updateTitle();

    return () => {
      ytitle.unobserve(updateTitle);
      provider.disconnect();
      ydocRef.current.destroy();
    };

  }, [id]);

  const value = useMemo(() => ({
    title,
    setTitle: (newTitle: string) => {
      setYdocTitle(ydocRef.current, newTitle);
    }
  }), [title]);
  
  return <YjsContext.Provider value={value}>{children}</YjsContext.Provider>;
};
