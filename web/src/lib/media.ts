const serverUrl =
  import.meta.env.VITE_SERVER_API_URL ?? "http://localhost:8000";

export async function uploadMedia(
  projectId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${serverUrl}/project/${projectId}/media/upload`,
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
  const response = await fetch(`${serverUrl}/project/${projectId}/media/${mediaId}/url`);
  if (!response.ok) {
    throw new Error("미디어 URL 가져오기 실패");
  }
  // { "url": "string" }
  const data = await response.json();
  return data.url;
}
