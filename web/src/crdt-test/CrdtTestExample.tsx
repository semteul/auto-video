import React, { useState, useContext } from 'react';
import { YjsProvider } from './YjsContext';
import { YjsContext } from './YjsContextInstance';

const CrdtTestContent: React.FC = () => {
  const ctx = useContext(YjsContext);
  if (!ctx) return <div>YjsContext가 초기화되지 않았습니다.</div>;
  const { title, setTitle } = ctx;
  return (
    <div>
      <div>
        <label>
          Title:
          <input
            value={title || ''}
            onChange={e => setTitle(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <b>Current Title:</b> {title}
      </div>
    </div>
  );
};

const CrdtTestExample: React.FC = () => {
  const [id, setId] = useState('default-room');
  const [input, setInput] = useState(id);
  return (
    <div style={{ padding: 24 }}>
      <h2>CRDT Test (Yjs)</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          setId(input);
        }}
        style={{ marginBottom: 16 }}
      >
        <label>
          Room ID:
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
        <button type="submit" style={{ marginLeft: 8 }}>Change Room</button>
      </form>
      <YjsProvider id={id}>
        <CrdtTestContent />
      </YjsProvider>
    </div>
  );
};

export default CrdtTestExample;
