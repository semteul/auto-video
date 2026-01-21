/**
 * projectSync가 broadcast된 yjs 문서를 TS type으로 변환한다면,
 * broadcast는 yjs 문서를 조작하는 함수이다.
 *
 * 즉 읽기는 converters.ts, 쓰기는 broadcast.ts로 구분
 */
import * as Y from "yjs";

import type {
  GeneratedSection,
  Interval,
  Media,
  Project,
  Scene,
  SectionDraft,
  Word,
} from "./types";
import {
  fromGeneratedSection,
  fromSectionDraft,
  fromScene,
  fromMedia,
  toGeneratedSection,
  isSectionDraftExists,
  fromInterval,
  toSectionDraft,
  createEmptySection,
} from "./converters";
import { swapTransact } from "./utils";

export function broadcastInitProject(ydoc: Y.Doc, project: Project) {
  ydoc.transact(() => {
    const yProject = ydoc.getMap("project");

    // clear existing
    yProject.clear();

    // title
    const yTitle = new Y.Text();
    yTitle.insert(0, project.title);
    yProject.set("title", yTitle);

    // sections
    const ySections = new Y.Map<Y.Map<any>>();
    project.sections.forEach((section, key) => {
      ySections.set(key, fromGeneratedSection(section));
    });
    yProject.set("sections", ySections);

    // section drafts
    const ySectionDrafts = new Y.Map<Y.Map<any>>();
    project.sectionDrafts.forEach((draft, key) => {
      ySectionDrafts.set(key, fromSectionDraft(draft));
    });
    yProject.set("sectionDrafts", ySectionDrafts);

    // scenes
    const yScenes = new Y.Map<Y.Map<any>>();
    project.scenes.forEach((scene, key) => {
      yScenes.set(key, fromScene(scene));
    });
    yProject.set("scenes", yScenes);

    // media
    const yMedia = new Y.Map<Y.Map<any>>();
    project.media.forEach((media, key) => {
      yMedia.set(key, fromMedia(media));
    });
    yProject.set("media", yMedia);

    // orders
    const ySectionOrder = new Y.Array<string>();
    ySectionOrder.push(project.sectionOrder);
    yProject.set("sectionOrder", ySectionOrder);

    const yMediaOrder = new Y.Array<string>();
    yMediaOrder.push(project.mediaOrder);
    yProject.set("mediaOrder", yMediaOrder);

    const ySceneOrder = new Y.Array<string>();
    ySceneOrder.push(project.sceneOrder);
    yProject.set("sceneOrder", ySceneOrder);
  });
}

// section 추가
export function broadcastAddSection(
  ydoc: Y.Doc,
  sectionId: string,
  section: GeneratedSection,
) {
  const project = ydoc.getMap("project");
  const ySections = project.get("sections") as Y.Map<Y.Map<any>>;
  const ySectionOrder = project.get("sectionOrder") as Y.Array<string>;
  ydoc.transact(() => {
    ySections.set(sectionId, fromGeneratedSection(section));
    ySectionOrder.push([sectionId]);
  });
}

export function broadcastAddSectionAt(
  ydoc: Y.Doc,
  sectionId: string,
  section: GeneratedSection,
  previousSectionId: string,
  before: boolean = false,
) {
  const project = ydoc.getMap("project");
  const ySections = project.get("sections") as Y.Map<Y.Map<any>>;
  const ySectionOrder = project.get("sectionOrder") as Y.Array<string>;
  ydoc.transact(() => {
    ySections.set(sectionId, fromGeneratedSection(section));
    const index = ySectionOrder.toArray().indexOf(previousSectionId);
    ySectionOrder.insert(before ? index : index + 1, [sectionId]);
  });
}

// section 삭제 (draft, order cascade)
export function broadcastDeleteSection(ydoc: Y.Doc, sectionId: string) {
  const project = ydoc.getMap("project");
  const ySections = project.get("sections") as Y.Map<Y.Map<any>>;
  const ySectionOrder = project.get("sectionOrder") as Y.Array<string>;
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;

  ydoc.transact(() => {
    if (ySectionDrafts.has(sectionId)) {
      ySectionDrafts.delete(sectionId);
    }

    const index = ySectionOrder.toArray().indexOf(sectionId);
    if (index !== -1) {
      ySectionOrder.delete(index, 1);
    }

    if (ySections.has(sectionId)) {
      ySections.delete(sectionId);
    }
  });
}

/**
 * Media 추가
 */
export function broadcastAddMedia(ydoc: Y.Doc, mediaId: string, media: Media) {
  const project = ydoc.getMap("project");
  const yMedia = project.get("media") as Y.Map<Y.Map<any>>;
  const yMediaOrder = project.get("mediaOrder") as Y.Array<string>;
  ydoc.transact(() => {
    yMedia.set(mediaId, fromMedia(media));
    yMediaOrder.push([mediaId]);
  });
}

/**
 * Media 삭제
 */
export function broadcastDeleteMedia(ydoc: Y.Doc, mediaId: string) {
  const project = ydoc.getMap("project");
  const yMedia = project.get("media") as Y.Map<Y.Map<any>>;
  const yMediaOrder = project.get("mediaOrder") as Y.Array<string>;
  ydoc.transact(() => {
    yMedia.delete(mediaId);
    const index = yMediaOrder.toArray().indexOf(mediaId);
    if (index !== -1) {
      yMediaOrder.delete(index, 1);
    }
  });
}

/**
 *
 * Client에서 사용 가능한 코드
 */
// section 순서 변경
export function broadcastSwapSection(
  ydoc: Y.Doc,
  sectionIdA: string,
  sectionIdB: string,
) {
  const project = ydoc.getMap("project");
  const ySectionOrder = project.get("sectionOrder") as Y.Array<string>;
  swapTransact(ydoc, ySectionOrder, sectionIdA, sectionIdB);
}

// title 변경
export function broadcastTitleChange(ydoc: Y.Doc, title: string) {
  const yTitle = ydoc.getMap("project").get("title") as Y.Text;
  ydoc.transact(() => {
    yTitle.delete(0, yTitle.length);
    yTitle.insert(0, title);
  });
}

/**
 * SectionDraft 추가
 */
export function broadcastAddSectionDraft(ydoc: Y.Doc, sectionId: string) {
  try {
    const section = toGeneratedSection(ydoc, sectionId);

    if (isSectionDraftExists(ydoc, sectionId)) {
      throw new Error("SectionDraft already exists");
    }

    const sectionDraft: SectionDraft = {
      duration: section.duration,
      type: section.type,
      intervalOrder: section.intervalOrder,
      intervals: section.intervals,
    };

    const project = ydoc.getMap("project");
    const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
    ydoc.transact(() => {
      ySectionDrafts.set(sectionId, fromSectionDraft(sectionDraft));
    });
  } catch {
    throw new Error("Section not found");
  }
}

/**
 * SectionDraft 수정
 */
export function broadcastUpdateSectionDraft(
  ydoc: Y.Doc,
  sectionId: string,
  duration?: number,
  type?: "speech" | "break",
) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  const ySectionDraft = ySectionDrafts.get(sectionId) as Y.Map<any>;
  ydoc.transact(() => {
    if (duration !== undefined) {
      ySectionDraft.set("duration", duration);
    }
    if (type !== undefined) {
      ySectionDraft.set("type", type);
    }
  });
}

/**
 * SectionDraft 삭제
 */
export function broadcastDeleteSectionDraft(ydoc: Y.Doc, sectionId: string) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  ydoc.transact(() => {
    ySectionDrafts.delete(sectionId);
  });
}

/**
 * SectionDraft를 바탕으로 GeneratedSection 생성
 *
 * GeneratedSection의 나머지 필드는 초기화됨
 */
export function broadcastGenerateSectionFromDraft(
  ydoc: Y.Doc,
  sectionId: string,
) {
  const ySections = ydoc.getMap("project").get("sections") as Y.Map<Y.Map<any>>;

  const sectionDraft = toSectionDraft(ydoc, sectionId);

  const newSection: GeneratedSection = createEmptySection();
  newSection.type = sectionDraft.type;
  newSection.duration = sectionDraft.duration;
  newSection.intervalOrder = sectionDraft.intervalOrder;
  newSection.intervals = sectionDraft.intervals;

  ydoc.transact(() => {
    ySections.delete(sectionId);
    ySections.set(sectionId, fromGeneratedSection(newSection));
  });
}

/**
 * Interval 추가
 */
export function broadcastAddIntervalToSectionDraft(
  ydoc: Y.Doc,
  sectionId: string,
  intervalId: string,
  interval: Interval,
) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  const ySectionDraft = ySectionDrafts.get(sectionId) as Y.Map<any>;
  const yIntervals = ySectionDraft.get("intervals") as Y.Map<Y.Map<any>>;
  const yIntervalOrder = ySectionDraft.get("intervalOrder") as Y.Array<string>;

  ydoc.transact(() => {
    yIntervals.set(intervalId, fromInterval(interval));
    yIntervalOrder.push([intervalId]);
  });
}

/**
 * Interval 추가 at
 */
export function broadcastAddIntervalToSectionDraftAt(
  ydoc: Y.Doc,
  sectionId: string,
  intervalId: string,
  interval: Interval,
  previousIntervalId: string,
  before: boolean = false,
) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  const ySectionDraft = ySectionDrafts.get(sectionId) as Y.Map<any>;
  const yIntervals = ySectionDraft.get("intervals") as Y.Map<Y.Map<any>>;
  const yIntervalOrder = ySectionDraft.get("intervalOrder") as Y.Array<string>;
  ydoc.transact(() => {
    yIntervals.set(intervalId, fromInterval(interval));
    const index = yIntervalOrder.toArray().indexOf(previousIntervalId);
    yIntervalOrder.insert(before ? index : index + 1, [intervalId]);
  });
}

/**
 * Interval 삭제
 */
export function broadcastDeleteIntervalFromSectionDraft(
  ydoc: Y.Doc,
  sectionId: string,
  intervalId: string,
) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  const ySectionDraft = ySectionDrafts.get(sectionId) as Y.Map<any>;
  const yIntervals = ySectionDraft.get("intervals") as Y.Map<Y.Map<any>>;
  const yIntervalOrder = ySectionDraft.get("intervalOrder") as Y.Array<string>;
  ydoc.transact(() => {
    yIntervals.delete(intervalId);
    const index = yIntervalOrder.toArray().indexOf(intervalId);
    if (index !== -1) {
      yIntervalOrder.delete(index, 1);
    }
  });
}

/**
 * Word 추가
 */
export function broadcastAddWordToIntervalInSectionDraft(
  ydoc: Y.Doc,
  sectionId: string,
  intervalId: string,
  word: Word,
) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  const ySectionDraft = ySectionDrafts.get(sectionId) as Y.Map<any>;
  const yIntervals = ySectionDraft.get("intervals") as Y.Map<Y.Map<any>>;
  const yInterval = yIntervals.get(intervalId) as Y.Map<any>;
  const yWords = yInterval.get("words") as Y.Array<Y.Map<any>>;
  ydoc.transact(() => {
    yWords.push([fromInterval({ words: [word] }).get("words") as Y.Map<any>]);
  });
}

/**
 * Word 삭제
 */
export function broadcastDeleteWordFromIntervalInSectionDraft(
  ydoc: Y.Doc,
  sectionId: string,
  intervalId: string,
  wordIndex: number,
) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  const ySectionDraft = ySectionDrafts.get(sectionId) as Y.Map<any>;
  const yIntervals = ySectionDraft.get("intervals") as Y.Map<Y.Map<any>>;
  const yInterval = yIntervals.get(intervalId) as Y.Map<any>;
  const yWords = yInterval.get("words") as Y.Array<Y.Map<any>>;
  ydoc.transact(() => {
    yWords.delete(wordIndex, 1);
  });
}

/**
 * Word 추가 at
 */
export function broadcastAddWordToIntervalInSectionDraftAt(
  ydoc: Y.Doc,
  sectionId: string,
  intervalId: string,
  word: Word,
  previousWordIndex: number,
  before: boolean = false,
) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  const ySectionDraft = ySectionDrafts.get(sectionId) as Y.Map<any>;
  const yIntervals = ySectionDraft.get("intervals") as Y.Map<Y.Map<any>>;
  const yInterval = yIntervals.get(intervalId) as Y.Map<any>;
  const yWords = yInterval.get("words") as Y.Array<Y.Map<any>>;
  ydoc.transact(() => {
    yWords.insert(before ? previousWordIndex : previousWordIndex + 1, [
      fromInterval({ words: [word] }).get("words") as Y.Map<any>,
    ]);
  });
}

/**
 * Word 수정
 */
export function broadcastUpdateWordInIntervalInSectionDraft(
  ydoc: Y.Doc,
  sectionId: string,
  intervalId: string,
  wordIndex: number,
  updatedWord: Word,
) {
  const project = ydoc.getMap("project");
  const ySectionDrafts = project.get("sectionDrafts") as Y.Map<Y.Map<any>>;
  const ySectionDraft = ySectionDrafts.get(sectionId) as Y.Map<any>;
  const yIntervals = ySectionDraft.get("intervals") as Y.Map<Y.Map<any>>;
  const yInterval = yIntervals.get(intervalId) as Y.Map<any>;
  const yWords = yInterval.get("words") as Y.Array<Y.Map<any>>;
  ydoc.transact(() => {
    const yWord = yWords.get(wordIndex) as Y.Map<any>;
    yWord.set("text", updatedWord.text);
    yWord.set("displayedText", updatedWord.displayedText);
    yWord.set("isCaptionSplitted", updatedWord.isCaptionSplitted);
    yWord.set("start", updatedWord.start);
  });
}

/**
 * Scene 추가
 */
export function broadcastAddScene(ydoc: Y.Doc, sceneId: string, scene: Scene) {
  const project = ydoc.getMap("project");
  const yScenes = project.get("scenes") as Y.Map<Y.Map<any>>;
  const ySceneOrder = project.get("sceneOrder") as Y.Array<string>;
  ydoc.transact(() => {
    yScenes.set(sceneId, fromScene(scene));
    ySceneOrder.push([sceneId]);
  });
}

/**
 * Scene 추가 at
 */
export function broadcastAddSceneAt(
  ydoc: Y.Doc,
  sceneId: string,
  scene: Scene,
  previousSceneId: string,
  before: boolean = false,
) {
  const project = ydoc.getMap("project");
  const yScenes = project.get("scenes") as Y.Map<Y.Map<any>>;
  const ySceneOrder = project.get("sceneOrder") as Y.Array<string>;
  ydoc.transact(() => {
    yScenes.set(sceneId, fromScene(scene));
    const index = ySceneOrder.toArray().indexOf(previousSceneId);
    ySceneOrder.insert(before ? index : index + 1, [sceneId]);
  });
}

/**
 * Scene 삭제
 *
 */
export function broadcastDeleteScene(ydoc: Y.Doc, sceneId: string) {
  const project = ydoc.getMap("project");
  const yScenes = project.get("scenes") as Y.Map<Y.Map<any>>;
  const ySceneOrder = project.get("sceneOrder") as Y.Array<string>;
  ydoc.transact(() => {
    yScenes.delete(sceneId);
    const index = ySceneOrder.toArray().indexOf(sceneId);
    if (index !== -1) {
      ySceneOrder.delete(index, 1);
    }
  });
}

/**
 * Scene 수정
 */
export function broadcastUpdateScene(
  ydoc: Y.Doc,
  sceneId: string,
  intervalCount?: number,
  mediaId?: string | null,
) {
  const project = ydoc.getMap("project");
  const yScenes = project.get("scenes") as Y.Map<Y.Map<any>>;
  const yScene = yScenes.get(sceneId) as Y.Map<any>;
  ydoc.transact(() => {
    if (intervalCount !== undefined) {
      yScene.set("intervalCount", intervalCount);
    }
    if (mediaId !== undefined) {
      yScene.set("mediaId", mediaId);
    }
  });
}

/**
 * swap scene
 */
export function broadcastSwapScene(
  ydoc: Y.Doc,
  sceneIdA: string,
  sceneIdB: string,
) {
  const project = ydoc.getMap("project");
  const ySceneOrder = project.get("sceneOrder") as Y.Array<string>;
  swapTransact(ydoc, ySceneOrder, sceneIdA, sceneIdB);
}
