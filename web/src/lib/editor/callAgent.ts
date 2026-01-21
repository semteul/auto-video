type AgentHealthResponse = { status: string };
type AgentRoomResponse = { status: string; roomId: string; message?: string };

const DEFAULT_AGENT_API_BASE =
  (import.meta as unknown as { env?: { VITE_AGENT_API_BASE?: string } }).env
    ?.VITE_AGENT_API_BASE ?? 'http://localhost:3001';

const buildUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/+$/, '')}${path}`;


export const getAgentHealth = async (baseUrl = DEFAULT_AGENT_API_BASE) => {
  const response = await fetch(buildUrl(baseUrl, '/health'));
  return (await response.json()) as AgentHealthResponse;
};

export const createAgentRoom = async (roomId: string, baseUrl = DEFAULT_AGENT_API_BASE) => {
  const response = await fetch(buildUrl(baseUrl, `/rooms/${encodeURIComponent(roomId)}`), {
    method: 'POST',
  });
  return (await response.json()) as AgentRoomResponse;
};

export const setAgentProjectTitle = async (
  roomId: string,
  title: string,
  baseUrl = DEFAULT_AGENT_API_BASE
) => {
  const response = await fetch(buildUrl(baseUrl, `/rooms/${encodeURIComponent(roomId)}/title`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return (await response.json()) as AgentRoomResponse;
};