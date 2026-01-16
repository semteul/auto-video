import type { ProjectResponse } from "./types";
import type { VideoProject } from "./editor/types";

const serverUrl =
  import.meta.env.VITE_SERVER_API_URL ?? "http://localhost:8000";

export async function createProject(title: string): Promise<VideoProject> {
  const response = await fetch(`${serverUrl}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error("프로젝트 생성 실패");
  }

  const projectResponse = (await response.json()) as ProjectResponse;

  return {
    id: projectResponse.id,
    title: projectResponse.title,
  };
}

export async function getProjects(): Promise<VideoProject[]> {
  const response = await fetch(`${serverUrl}/projects`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("프로젝트 목록 가져오기 실패");
  }
  const data = await response.json();
  const projectResponses = data as ProjectResponse[];
  
  return projectResponses.map((projectResponse) => ({
    id: projectResponse.id,
    title: projectResponse.title,
  }));
}

export async function getProject(projectId: string): Promise<VideoProject> {
  const response = await fetch(`${serverUrl}/projects/${projectId}`, {
    method: "GET",
  });
  
  if (!response.ok) {
    throw new Error("프로젝트 가져오기 실패");
  }
  
  const data = await response.json();
  const projectResponse = data as ProjectResponse;

  return {
    id: projectResponse.id,
    title: projectResponse.title,
  };
}

export async function deleteMedia(
  projectId: string,
  mediaId: string
): Promise<void> {
  const response = await fetch(
    `${serverUrl}/projects/${projectId}/media/${mediaId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error("미디어 삭제 실패");
  }
  return;
}
