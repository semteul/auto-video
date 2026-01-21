import Fastify from 'fastify';
import { createAgent, createSection, deleteSection, getOrCreateAgent, setProjectTitle } from '../editor/agent';

const fastify = Fastify({ logger: true });

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

fastify.post('/rooms/:roomId', async (request, reply) => {
  const { roomId } = request.params as { roomId: string };
  const agent = createAgent(roomId);
  return { status: 'agent created', roomId: roomId };
});

// set title
fastify.post('/rooms/:roomId/title', async (request, reply) => {
  const { roomId } = request.params as { roomId: string };
  const agent = getOrCreateAgent(roomId);
  const title = (request.body as any).title;

  try {
    setProjectTitle(agent, title);
    return { status: 'title updated', roomId: roomId };
  } catch (e) {
    reply.status(400);
    return { status: title, message: (e as Error).message };
  }
});

// create section
fastify.post('/rooms/:roomId/sections', async (request, reply) => {
  const { roomId } = request.params as { roomId: string };
  const body = request.body as any;
  const at = body.at as string | undefined;
  const before = body.before as boolean | undefined;

  const agent = getOrCreateAgent(roomId);
  const sectionId = createSection(agent, at, before);

  return { status: 'section created', roomId: roomId, sectionId: sectionId };
});

// delete section
fastify.delete('/rooms/:roomId/sections/:sectionId', async (request, reply) => {
  const { roomId, sectionId } = request.params as { roomId: string; sectionId: string };
  const agent = getOrCreateAgent(roomId);
  try {
    deleteSection(agent, sectionId);
    return { status: 'section deleted', roomId: roomId, sectionId: sectionId };
  } catch (e) {
    reply.status(400);
    return { status: 'error', message: (e as Error).message };
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    fastify.log.info(`server listening on ${(fastify.server.address() as any).port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();