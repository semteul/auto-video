// src/lib/types.ts
// Shared interfaces for media and scene modules

export interface ProjectResponse {
  id: string;
  title: string;
}

export interface MediaUrlResponse {
  id: string;
  name: string;
  content_type: string;
  size: number;
  url: string;
}

export interface MediaResponse {
  id: string;
  name: string;
  content_type: string;
  size: number;
  url: string;
}

export interface SceneResponse {
  scene_id: string;
  project_id: string;
  media_id: string | null;
  word_count: number;
  order: number;
  media?: MediaResponse | null;
}

export interface SceneCreateRequest {
  media_id?: string | null;
  word_count?: number;
}
