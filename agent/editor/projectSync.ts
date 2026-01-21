/**
 * fetchProject: Yjs 문서에서 Project 데이터를 얕은 복사로 동기화하는 함수
 * 
 * 얕은 복사이므로, react state에 사용할 경우, memo를 활용해 렌더링 비용을 줄일 수 있음
 */
import * as Y from "yjs";
import type {
  Project,
  GeneratedSection,
  SectionDraft,
  Interval,
  Word,
  Media,
  Scene,
} from "./types";
import { shallowEqualArray, syncMap } from "./utils";
import { createEmptyProject } from "./converters";

/**
 * ======================
 * Public API
 * ======================
 */

export function fetchProject(ydoc: Y.Doc, prev?: Project): Project {
  const base = prev ?? createEmptyProject();
  return shallowUpdateProject(ydoc, base);
}

/**
 * ======================
 * Project
 * ======================
 */

function shallowUpdateProject(ydoc: Y.Doc, prev: Project): Project {
  const yProject = ydoc.getMap("project");
  let changed = false;

  if (!yProject) {
    throw new Error("현재 project room이 초기화 되지 않았습니다.");
  }

  // title
  const yTitle = yProject.get("title") as Y.Text | undefined;
  const nextTitle = yTitle ? yTitle.toString() : prev.title;
  if (nextTitle !== prev.title) changed = true;

  // sections
  const ySections = yProject.get("sections") as Y.Map<Y.Map<any>> | undefined;
  const nextSections = ySections
    ? syncMap(
        ySections,
        prev.sections,
        shallowUpdateSection,
        toGeneratedSection,
      )
    : prev.sections;
  if (nextSections !== prev.sections) changed = true;

  // section drafts
  const ySectionDrafts = yProject.get("sectionDrafts") as
    | Y.Map<Y.Map<any>>
    | undefined;
  const nextSectionDrafts = ySectionDrafts
    ? syncMap(
        ySectionDrafts,
        prev.sectionDrafts,
        shallowUpdateSectionDraft,
        toSectionDraft,
      )
    : prev.sectionDrafts;
  if (nextSectionDrafts !== prev.sectionDrafts) changed = true;

  // media
  const yMedia = yProject.get("media") as Y.Map<Y.Map<any>> | undefined;
  const nextMedia = yMedia
    ? syncMap(yMedia, prev.media, shallowUpdateMedia, toMedia)
    : prev.media;
  if (nextMedia !== prev.media) changed = true;

  // scenes
  const yScenes = yProject.get("scenes") as Y.Map<Y.Map<any>> | undefined;
  const nextScenes = yScenes
    ? syncMap(yScenes, prev.scenes, shallowUpdateScene, toScene)
    : prev.scenes;
  if (nextScenes !== prev.scenes) changed = true;

  // orders
  const ySectionOrder = yProject.get("sectionOrder") as
    | Y.Array<string>
    | undefined;
  const nextSectionOrder = ySectionOrder
    ? ySectionOrder.toArray()
    : prev.sectionOrder;
  if (!shallowEqualArray(prev.sectionOrder, nextSectionOrder)) changed = true;

  const yMediaOrder = yProject.get("mediaOrder") as
    | Y.Array<string>
    | undefined;
  const nextMediaOrder = yMediaOrder
    ? yMediaOrder.toArray()
    : prev.mediaOrder;
  if (!shallowEqualArray(prev.mediaOrder, nextMediaOrder)) changed = true;

  const ySceneOrder = yProject.get("sceneOrder") as
    | Y.Array<string>
    | undefined;
  const nextSceneOrder = ySceneOrder ? ySceneOrder.toArray() : prev.sceneOrder;
  if (!shallowEqualArray(prev.sceneOrder, nextSceneOrder)) changed = true;

  if (!changed) return prev;

  return {
    ...prev,
    title: nextTitle,
    sections: nextSections,
    sectionDrafts: nextSectionDrafts,
    media: nextMedia,
    scenes: nextScenes,
    sectionOrder: nextSectionOrder,
    mediaOrder: nextMediaOrder,
    sceneOrder: nextSceneOrder,
  };
}

/**
 * ======================
 * Section / Draft
 * ======================
 */

function shallowUpdateSection(
  ySection: Y.Map<any>,
  prev: GeneratedSection,
): GeneratedSection {
  const nextIntervalOrder = (
    ySection.get("intervalOrder") as Y.Array<string>
  ).toArray();
  const nextIntervals = syncIntervals(
    ySection.get("intervals") as Y.Map<Y.Map<any>>,
    prev.intervals,
  );

  const next: GeneratedSection = {
    ...prev,
    type: ySection.get("type"),
    duration: ySection.get("duration"),
    speechDuration: ySection.get("speechDuration"),
    speechGeneratedStatus: ySection.get("speechGeneratedStatus"),
    intervalOrder: shallowEqualArray(prev.intervalOrder, nextIntervalOrder)
      ? prev.intervalOrder
      : nextIntervalOrder,
    intervals: nextIntervals,
  };

  if (
    next.type === prev.type &&
    next.duration === prev.duration &&
    next.speechDuration === prev.speechDuration &&
    next.speechGeneratedStatus === prev.speechGeneratedStatus &&
    next.intervalOrder === prev.intervalOrder &&
    next.intervals === prev.intervals
  ) {
    return prev;
  }

  return next;
}

function shallowUpdateSectionDraft(
  yDraft: Y.Map<any>,
  prev: SectionDraft,
): SectionDraft {
  const nextIntervalOrder = (
    yDraft.get("intervalOrder") as Y.Array<string>
  ).toArray();
  const nextIntervals = syncIntervals(
    yDraft.get("intervals") as Y.Map<Y.Map<any>>,
    prev.intervals,
  );

  const next: SectionDraft = {
    ...prev,
    duration: yDraft.get("duration"),
    type: yDraft.get("type"),
    intervalOrder: shallowEqualArray(prev.intervalOrder, nextIntervalOrder)
      ? prev.intervalOrder
      : nextIntervalOrder,
    intervals: nextIntervals,
  };

  if (
    next.duration === prev.duration &&
    next.type === prev.type &&
    next.intervalOrder === prev.intervalOrder &&
    next.intervals === prev.intervals
  ) {
    return prev;
  }

  return next;
}

/**
 * ======================
 * Interval / Word
 * ======================
 */

function shallowUpdateInterval(
  yInterval: Y.Map<any>,
  prev: Interval,
): Interval {
  const yWords = yInterval.get("words") as Y.Array<Y.Map<any>>;

  let changed = false;
  const nextWords = prev.words.slice();

  yWords.forEach((yWord, index) => {
    const prevWord = prev.words[index];
    if (prevWord) {
      const nextWord = shallowUpdateWord(yWord, prevWord);
      if (nextWord !== prevWord) {
        nextWords[index] = nextWord;
        changed = true;
      }
    } else {
      nextWords.push(toWord(yWord));
      changed = true;
    }
  });

  if (nextWords.length !== yWords.length) {
    nextWords.length = yWords.length;
    changed = true;
  }

  if (!changed) return prev;
  return { ...prev, words: nextWords };
}

function shallowUpdateWord(yWord: Y.Map<any>, prev: Word): Word {
  const next: Word = {
    ...prev,
    text: yWord.get("text"),
    displayedText: yWord.get("displayedText"),
    isCaptionSplitted: yWord.get("isCaptionSplitted"),
    start: yWord.get("start"),
  };

  if (
    next.text === prev.text &&
    next.displayedText === prev.displayedText &&
    next.isCaptionSplitted === prev.isCaptionSplitted &&
    next.start === prev.start
  ) {
    return prev;
  }

  return next;
}

function syncIntervals(
  yIntervals: Y.Map<Y.Map<any>>,
  prev: Map<string, Interval>,
) {
  return syncMap(yIntervals, prev, shallowUpdateInterval, toInterval);
}

/**
 * ======================
 * Media / Scene
 * ======================
 */

function shallowUpdateMedia(yMedia: Y.Map<any>, prev: Media): Media {
  const next: Media = {
    ...prev,
    status: yMedia.get("status"),
    fileId: yMedia.get("fileId"),
    name: yMedia.get("name"),
    contentType: yMedia.get("contentType"),
    size: yMedia.get("size"),
  };

  if (
    next.status === prev.status &&
    next.fileId === prev.fileId &&
    next.name === prev.name &&
    next.contentType === prev.contentType &&
    next.size === prev.size
  ) {
    return prev;
  }

  return next;
}

function shallowUpdateScene(yScene: Y.Map<any>, prev: Scene): Scene {
  const next: Scene = {
    ...prev,
    mediaId: yScene.get("mediaId"),
    intervalCount: yScene.get("intervalCount"),
  };

  if (
    next.mediaId === prev.mediaId &&
    next.intervalCount === prev.intervalCount
  ) {
    return prev;
  }

  return next;
}

/**
 * ======================
 * Converters (Yjs → FE)
 * ======================
 */

function toGeneratedSection(y: Y.Map<any>): GeneratedSection {
  return {
    type: y.get("type"),
    duration: y.get("duration"),
    speechDuration: y.get("speechDuration"),
    speechGeneratedStatus: y.get("speechGeneratedStatus"),
    intervalOrder: (y.get("intervalOrder") as Y.Array<string>).toArray(),
    intervals: syncIntervals(
      y.get("intervals") as Y.Map<Y.Map<any>>,
      new Map(),
    ),
  };
}

function toSectionDraft(y: Y.Map<any>): SectionDraft {
  return {
    duration: y.get("duration"),
    type: y.get("type"),
    intervalOrder: (y.get("intervalOrder") as Y.Array<string>).toArray(),
    intervals: syncIntervals(
      y.get("intervals") as Y.Map<Y.Map<any>>,
      new Map(),
    ),
  };
}

function toInterval(y: Y.Map<any>): Interval {
  const yWords = y.get("words") as Y.Array<Y.Map<any>>;
  return {
    words: yWords.map(toWord),
  };
}

function toWord(y: Y.Map<any>): Word {
  return {
    text: y.get("text"),
    displayedText: y.get("displayedText"),
    isCaptionSplitted: y.get("isCaptionSplitted"),
    start: y.get("start"),
  };
}

function toMedia(y: Y.Map<any>): Media {
  return {
    status: y.get("status"),
    fileId: y.get("fileId"),
    name: y.get("name"),
    contentType: y.get("contentType"),
    size: y.get("size"),
  };
}

function toScene(y: Y.Map<any>): Scene {
  return {
    mediaId: y.get("mediaId"),
    intervalCount: y.get("intervalCount"),
  };
}
