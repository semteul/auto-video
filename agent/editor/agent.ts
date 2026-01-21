/**
 * agent가 yjs 문서를 관리하는 코드
 */

import * as Y from "yjs";

interface Agent {
  roomId: string;
  ydoc: Y.Doc;
  provider: WebsocketProvider;
}

import { WebsocketProvider } from "y-websocket";
import { broadcastAddSection, broadcastAddSectionAt, broadcastDeleteSection, broadcastGenerateSectionFromDraft, broadcastInitProject, broadcastTitleChange } from "./broadcast";
import { createEmptyProject, createEmptySection } from "./converters";
import { createId } from "./utils";

const agents: Map<string, Agent> = new Map();

/**
 * 1. DB에서 project data fetch
 * 2. agent create
 * 3-a. 만약 DB에 데이터가 있다면 yjs 문서에 broadcast
 * 3-b. 만약 DB에 데이터가 없다면 빈 project로 yjs 문서에 broadcast
 */
export function createAgent(roomId: string): Agent {
  let agent = agents.get(roomId);
  if (!agent) {
    const ydoc = new Y.Doc();
    // y-websocket provider 연결 (localhost:1234)
    const provider = new WebsocketProvider("ws://localhost:1234", roomId, ydoc);
    agent = { roomId: roomId, ydoc, provider };
    agents.set(roomId, agent);

    // TODO DB에서 room 불러오기

    // DB에 데이터가 없다면 빈 project로 초기화
    // TODO 새로 생성한 project를 DB에 저장
    broadcastInitProject(agent.ydoc, createEmptyProject());
  }
  return agent;
}

/**
 *
 * roomId에 해당하는 agent를 반환. 없으면 생성.
 */
export function getOrCreateAgent(roomId: string): Agent {
  let agent = agents.get(roomId);
  if (!agent) {
    agent = createAgent(roomId);
  }
  return agent;
}

/**
 * agent의 project title을 변경하는 함수
 */
export function setProjectTitle(agent: Agent, title: string) {
  const ydoc = agent.ydoc;
  broadcastTitleChange(ydoc, title);
}

/**
 * create section
 */
export function createSection(agent: Agent, at?: string, before?: boolean) : string {
  const ydoc = agent.ydoc;
  const id = createId();

  const section = createEmptySection();
  if (at !== undefined) {
    broadcastAddSectionAt(ydoc, id, section, at, before);
  } else {
    broadcastAddSection(ydoc, id, section);
  }
  
  return id;
}

/**
 * delete section
 */
export function deleteSection(agent: Agent, sectionId: string) {
  const ydoc = agent.ydoc;
  broadcastDeleteSection(ydoc, sectionId);
}

/**
 * Save Section Draft
 */
export function saveSectionDraft(agent: Agent, sectionId: string) {
  try {
    broadcastGenerateSectionFromDraft(agent.ydoc, sectionId);
  } catch (e) {
    throw e;
  }
}


