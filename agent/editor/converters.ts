/**
 * Y.Map과 Project type 간 변환하는 util 함수들
 */

import * as Y from "yjs";
import type {
  GeneratedSection,
  SectionDraft,
  Interval,
  Word,
  Media,
  Scene,
  Project,
} from "./types";

export function createEmptyProject(): Project {
  return {
    title: "",
    sections: new Map(),
    sectionDrafts: new Map(),
    scenes: new Map(),
    media: new Map(),
    sectionOrder: [],
    mediaOrder: [],
    sceneOrder: [],
  };
}

export function createEmptySection(): GeneratedSection {
  return {
    type: "speech",
    duration: 0,
    speechDuration: 0,
    intervals: new Map(),
    intervalOrder: [],
  };
}

/**
 * ======================
 * GeneratedSection / SectionDraft
 * ======================
 */

export function fromGeneratedSection(section: GeneratedSection): Y.Map<any> {
  const ySection = new Y.Map<any>();

  ySection.set("type", section.type);
  ySection.set("duration", section.duration);
  ySection.set("speechDuration", section.speechDuration);
  if (section.speechGeneratedStatus !== undefined) {
    ySection.set("speechGeneratedStatus", section.speechGeneratedStatus);
  }

  const yIntervalOrder = new Y.Array<string>();
  yIntervalOrder.push(section.intervalOrder);
  ySection.set("intervalOrder", yIntervalOrder);

  const yIntervals = new Y.Map<Y.Map<any>>();
  section.intervals.forEach((interval, key) => {
    yIntervals.set(key, fromInterval(interval));
  });
  ySection.set("intervals", yIntervals);

  return ySection;
}

export function isSectionDraftExists(yDoc: Y.Doc, sectionId: string): boolean {
  const projectMap = yDoc.getMap("project");
  const sectionDrafts = projectMap.get("sectionDrafts");
  if (!(sectionDrafts instanceof Y.Map)) {
    throw new Error("sectionDrafts is not a Y.Map");
  }
  return sectionDrafts.has(sectionId);
}

export function toGeneratedSection(yDoc: Y.Doc, sectionId: string): GeneratedSection {
  const projectMap = yDoc.getMap("project");
  const sections = projectMap.get("sections");

  if (!(sections instanceof Y.Map)) {
    throw new Error("sections is not a Y.Map");
  }

  const ySection = sections.get(sectionId);
  if (!(ySection instanceof Y.Map)) {
    throw new Error("section is not a Y.Map");
  }

  const section: GeneratedSection = {
    type: ySection.get("type"),
    duration: ySection.get("duration"),
    speechDuration: ySection.get("speechDuration"),
    intervalOrder: [],
    intervals: new Map<string, Interval>(),
  };

  return section;
}

export function fromSectionDraft(draft: SectionDraft): Y.Map<any> {
  const yDraft = new Y.Map<any>();

  yDraft.set("type", draft.type);
  yDraft.set("duration", draft.duration);

  const yIntervalOrder = new Y.Array<string>();
  yIntervalOrder.push(draft.intervalOrder);
  yDraft.set("intervalOrder", yIntervalOrder);

  const yIntervals = new Y.Map<Y.Map<any>>();
  draft.intervals.forEach((interval, key) => {
    yIntervals.set(key, fromInterval(interval));
  });
  yDraft.set("intervals", yIntervals);

  return yDraft;
}

export function toSectionDraft(yDoc: Y.Doc, sectionId: string): SectionDraft {
  const projectMap = yDoc.getMap("project");
  const sectionDrafts = projectMap.get("sectionDrafts");
  if (!(sectionDrafts instanceof Y.Map)) {
    throw new Error("sectionDrafts is not a Y.Map");
  }
  const yDraft = sectionDrafts.get(sectionId);
  if (!(yDraft instanceof Y.Map)) {
    throw new Error("sectionDraft is not a Y.Map");
  }
  const draft: SectionDraft = {
    type: yDraft.get("type"),
    duration: yDraft.get("duration"),
    intervalOrder: [],
    intervals: new Map<string, Interval>(),
  };
  return draft;
}

/**
 * ======================
 * Interval / Word
 * ======================
 */

export function fromInterval(interval: Interval): Y.Map<any> {
  const yInterval = new Y.Map<any>();

  const yWords = new Y.Array<Y.Map<any>>();
  interval.words.forEach((word) => {
    yWords.push([fromWord(word)]);
  });

  yInterval.set("words", yWords);
  return yInterval;
}

export function fromWord(word: Word): Y.Map<any> {
  const yWord = new Y.Map<any>();

  yWord.set("text", word.text);
  yWord.set("displayedText", word.displayedText);
  yWord.set("isCaptionSplitted", word.isCaptionSplitted);
  yWord.set("start", word.start);

  return yWord;
}

/**
 * ======================
 * Media / Scene
 * ======================
 */

export function fromMedia(media: Media): Y.Map<any> {
  const yMedia = new Y.Map<any>();

  yMedia.set("status", media.status);
  yMedia.set("fileId", media.fileId);
  yMedia.set("name", media.name);
  yMedia.set("contentType", media.contentType);
  yMedia.set("size", media.size);

  return yMedia;
}

export function fromScene(scene: Scene): Y.Map<any> {
  const yScene = new Y.Map<any>();

  yScene.set("mediaId", scene.mediaId);
  yScene.set("intervalCount", scene.intervalCount);

  return yScene;
}
