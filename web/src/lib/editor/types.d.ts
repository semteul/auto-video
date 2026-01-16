/**
 * Editor에 필요한 Type 정의 
 * BE API DTO가 다르더라도 프론트 내부 Logic에서는 이 타입을 사용해야 함
 * api fetching logic에서는 BE DTO를 이쪽 interface로 어댑팅 하는것 권장
 */

export interface VideoProject {
  id: string;
  title: string;
}

export interface Section {
  id: string;
  duration: number;
  type: "speech" | "blank";
}

export interface SpeechSection extends Section {
  type: "speech";
  isGenerated: boolean;
  intervals: Interval[];
}

export interface BlankSection extends Section {
  type: "blank";
}

export interface Interval {
  id: string;
  words: Word[];
}

export interface Word {
  text: string;
  displayedText: string;
  isCaptionSplitted: boolean;
  start: number;
}

export interface MediaUrl {
  id: string;
  name: string;
  content_type: string;
  size: number;
  url: string;
}

export interface Media {
  id: string;
  name: string;
  contentType: string;
  size: number;
  url: string;
}

export interface Scene {
  sceneId: string;
  projectId: string;
  mediaId: string | null;
  intervalCount: number;
  media?: Media | null;
}
