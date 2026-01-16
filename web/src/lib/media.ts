import type { MediaResponse } from "./types";


export const serverUrl =
  import.meta.env.VITE_SERVER_API_URL ?? "http://localhost:8000";

export async function uploadMedia(
  projectId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${serverUrl}/projects/${projectId}/media/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("파일 업로드 실패");
  }

  // { "media_id": "string" }
  const data = await response.json();
  return data.media_id;
}

export async function getMediaUrl(
  projectId: string,
  mediaId: string
): Promise<string> {
  const response = await fetch(
    `${serverUrl}/projects/${projectId}/media/${mediaId}`
  );
  if (!response.ok) {
    throw new Error("미디어 URL 가져오기 실패");
  }
  // { "url": "string" }
  const data = await response.json();
  return data.url;
}

export async function getMediaList(
  projectId: string
): Promise<MediaResponse[]> {
  const response = await fetch(`${serverUrl}/projects/${projectId}/media`);

  if (!response.ok) {
    throw new Error("미디어 목록 가져오기 실패");
  }

  // [ { "id": "string", "url": "string" } ]
  const data = await response.json();
  const media = data as MediaResponse[];
  return media;
}