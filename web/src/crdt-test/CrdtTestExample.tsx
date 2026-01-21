import React, { useState, useContext } from 'react';
import { EditorContext } from '../lib/editor/EditorContextInstance';
import { EditorProvider } from '../lib/editor/EditorContext';

const CrdtTestContent: React.FC = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) return <div>EditorContext가 초기화되지 않았습니다.</div>;
  const { project, setTitle } = ctx;
  if (!project) return <div>프로젝트 데이터가 없습니다.</div>;

  const title = project.title;

  return (
    <div>
      <div>
        <label>
          Title:
          <input
            value={title || ''}
            onChange={e => setTitle?.(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <b>Current Title:</b> {title}
      </div>
      <div>
        <button 
          className='cursor-pointer bg-gray-300s'
          onClick={() => actions?.createSection?.(
          uuidv4(),
          {
            type: 'speech',
            isSpeechGenerated: false,
            duration: 0,
            intervalOrder: [],
          }
        )}>
          Add Section
        </button>
      </div>
      {
        sectionOrder.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <b>Sections:</b>
            <ul>
              {sectionOrder.map(sectionId => {
                const section = sections.get(sectionId);
                return (
                  <li key={sectionId}>
                    ID: {sectionId}, Type: {section?.type}, Duration: {section?.duration}
                  </li>
                );
              })}
            </ul>
          </div>
        )
      }
    </div>
  );
};

const CrdtTestExample: React.FC = () => {
  const [id, setId] = useState('my-test23');
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
      <EditorProvider id={id}>
        <CrdtTestContent />
      </EditorProvider>
    </div>
  );
};

export default CrdtTestExample;
