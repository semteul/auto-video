
import type { Scene } from "./editor/types";
import type { SceneResponse } from "./types";
import type { SceneCreateRequest } from "./types";


const serverUrl =
  import.meta.env.VITE_SERVER_API_URL ?? "http://localhost:8000";


export async function requestCreateScene(
  projectId: string,
  req: SceneCreateRequest
): Promise<Scene> {
  const res = await fetch(`${serverUrl}/projects/${projectId}/scenes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("Failed to create scene");
  const sceneResponse = await res.json() as SceneResponse;
  return {
    sceneId: sceneResponse.scene_id,
    projectId: sceneResponse.project_id,
    mediaId: sceneResponse.media_id,
    intervalCount: sceneResponse.word_count,
  };
}



export async function assignMediaToScene(
  sceneId: string,
  mediaId: string
): Promise<SceneResponse> {
  const res = await fetch(
    `${serverUrl}/scenes/${sceneId}/assign-media?media_id=${mediaId}`,
    {
      method: "POST",
    }
  );
  if (!res.ok) throw new Error("Failed to assign media to scene");
  return await res.json();
}



export async function removeMediaFromScene(sceneId: string): Promise<SceneResponse> {
  const res = await fetch(`${serverUrl}/scenes/${sceneId}/remove-media`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to remove media from scene");
  return await res.json();
}



export async function requestDeleteScene(sceneId: string): Promise<{ success: boolean; deleted_id: string }> {
  const res = await fetch(`${serverUrl}/scenes/${sceneId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete scene");
  return await res.json();
}



export async function swapSceneOrder(
  sceneId1: string,
  sceneId2: string
): Promise<{ scene1: SceneResponse; scene2: SceneResponse }> {
  const res = await fetch(
    `${serverUrl}/scenes/swap-order?scene_id1=${sceneId1}&scene_id2=${sceneId2}`,
    {
      method: "POST",
    }
  );
  if (!res.ok) throw new Error("Failed to swap scene order");
  return await res.json();
}
// Get media info for a scene
export async function getSceneMediaInfo(sceneId: string): Promise<SceneResponse> {
  const res = await fetch(`${serverUrl}/scenes/${sceneId}/media-info`);
  if (!res.ok) throw new Error("Failed to get scene media info");
  return await res.json();
}

// Get all scenes' media info for a project
export async function getProjectScenesMediaInfo(projectId: string): Promise<Scene[]> {
  const res = await fetch(`${serverUrl}/projects/${projectId}/scenes/media-info`);
  if (!res.ok) throw new Error("Failed to get project scenes media info");
  const sceneResponses = await res.json() as SceneResponse[];

  return sceneResponses.map(sceneResponse => ({
    sceneId: sceneResponse.scene_id,
    projectId: sceneResponse.project_id,
    mediaId: sceneResponse.media_id,
    intervalCount: sceneResponse.word_count,
  }));
}