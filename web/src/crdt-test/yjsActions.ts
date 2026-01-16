import * as Y from 'yjs';
import type { Interval, Media, Scene, Section, Word } from './yjsTypes';

type GetDoc = () => Y.Doc;

const moveIdInArray = (items: string[], fromId: string, toId: string) => {
  const fromIndex = items.indexOf(fromId);
  const toIndex = items.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return items;
  }
  const next = [...items];
  next.splice(fromIndex, 1);
  const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  next.splice(insertIndex, 0, fromId);
  return next;
};

const moveIdInYArray = (yArray: Y.Array<string>, fromId: string, toId: string) => {
  const next = moveIdInArray(yArray.toArray(), fromId, toId);
  yArray.delete(0, yArray.length);
  yArray.insert(0, next);
};

const appendItemWithOrder = <T,>(
  yMap: Y.Map<T>,
  yOrder: Y.Array<string>,
  itemId: string,
  item: T
) => {
  yMap.set(itemId, item);
  yOrder.push([itemId]);
};

const insertItemNextTo = <T,>(
  yMap: Y.Map<T>,
  yOrder: Y.Array<string>,
  itemId: string,
  item: T,
  nextToId: string
) => {
  yMap.set(itemId, item);
  const index = yOrder.toArray().indexOf(nextToId);
  yOrder.insert(index + 1, [itemId]);
};

const insertItemPrevTo = <T,>(
  yMap: Y.Map<T>,
  yOrder: Y.Array<string>,
  itemId: string,
  item: T,
  prevToId: string
) => {
  yMap.set(itemId, item);
  const index = yOrder.toArray().indexOf(prevToId);
  yOrder.insert(Math.max(0, index), [itemId]);
};

const appendChildId = (order: string[] | undefined, childId: string) => {
  return [...(order ?? []), childId];
};

const insertIdNextTo = (order: string[] | undefined, newId: string, nextToId: string) => {
  const items = order ?? [];
  const index = items.indexOf(nextToId);
  if (index === -1) {
    return [...items, newId];
  }
  const next = [...items];
  next.splice(index + 1, 0, newId);
  return next;
};

const insertIdPrevTo = (order: string[] | undefined, newId: string, prevToId: string) => {
  const items = order ?? [];
  const index = items.indexOf(prevToId);
  if (index === -1) {
    return [newId, ...items];
  }
  const next = [...items];
  next.splice(index, 0, newId);
  return next;
};

const removeIdFromOrder = (order: string[] | undefined, removeId: string) => {
  const items = order ?? [];
  return items.filter((id) => id !== removeId);
};

export const createYjsActions = (getDoc: GetDoc) => ({
  setTitle: (newTitle: string) => {
    const yTitle = getDoc().getText('title');
    getDoc().transact(() => {
      yTitle.delete(0, yTitle.length);
      yTitle.insert(0, newTitle);
    }, 'local');
  },

  swapSectionOrder: (fromId: string, toId: string) => {
    const ySectionOrder = getDoc().getArray<string>('sectionOrder');
    getDoc().transact(() => {
      moveIdInYArray(ySectionOrder, fromId, toId);
    }, 'local');
  },

  swapSceneOrder: (fromId: string, toId: string) => {
    const ySceneOrder = getDoc().getArray<string>('sceneOrder');
    getDoc().transact(() => {
      moveIdInYArray(ySceneOrder, fromId, toId);
    }, 'local');
  },

  swapMediaOrder: (fromId: string, toId: string) => {
    const yMediaOrder = getDoc().getArray<string>('mediaOrder');
    getDoc().transact(() => {
      moveIdInYArray(yMediaOrder, fromId, toId);
    }, 'local');
  },

  updateSection: (sectionId: string, section: Section) => {
    const ySections = getDoc().getMap<Section>('sections');
    getDoc().transact(() => {
      ySections.set(sectionId, section);
    }, 'local');
  },

  updateScene: (sceneId: string, scene: Scene) => {
    const yScenes = getDoc().getMap<Scene>('scenes');
    getDoc().transact(() => {
      yScenes.set(sceneId, scene);
    }, 'local');
  },

  updateMedia: (mediaId: string, mediaItem: Media) => {
    const yMedia = getDoc().getMap<Media>('media');
    getDoc().transact(() => {
      yMedia.set(mediaId, mediaItem);
    }, 'local');
  },

  updateInterval: (intervalId: string, interval: Interval) => {
    const yIntervals = getDoc().getMap<Interval>('intervals');
    getDoc().transact(() => {
      yIntervals.set(intervalId, interval);
    }, 'local');
  },

  updateWord: (wordId: string, word: Word) => {
    const yWords = getDoc().getMap<Word>('words');
    getDoc().transact(() => {
      yWords.set(wordId, word);
    }, 'local');
  },

  createSection: (sectionId: string, section: Section) => {
    const ySections = getDoc().getMap<Section>('sections');
    const ySectionOrder = getDoc().getArray<string>('sectionOrder');
    getDoc().transact(() => {
      appendItemWithOrder(ySections, ySectionOrder, sectionId, section);
    }, 'local');
  },

  createSectionNextTo: (newSectionId: string, section: Section, nextToSectionId: string) => {
    const ySections = getDoc().getMap<Section>('sections');
    const ySectionOrder = getDoc().getArray<string>('sectionOrder');
    getDoc().transact(() => {
      insertItemNextTo(ySections, ySectionOrder, newSectionId, section, nextToSectionId);
    }, 'local');
  },

  createSectionPrevTo: (newSectionId: string, section: Section, prevToSectionId: string) => {
    const ySections = getDoc().getMap<Section>('sections');
    const ySectionOrder = getDoc().getArray<string>('sectionOrder');
    getDoc().transact(() => {
      insertItemPrevTo(ySections, ySectionOrder, newSectionId, section, prevToSectionId);
    }, 'local');
  },

  createScene: (sceneId: string, scene: Scene) => {
    const yScenes = getDoc().getMap<Scene>('scenes');
    const ySceneOrder = getDoc().getArray<string>('sceneOrder');
    getDoc().transact(() => {
      appendItemWithOrder(yScenes, ySceneOrder, sceneId, scene);
    }, 'local');
  },

  createSceneNextTo: (newSceneId: string, scene: Scene, nextToSceneId: string) => {
    const yScenes = getDoc().getMap<Scene>('scenes');
    const ySceneOrder = getDoc().getArray<string>('sceneOrder');
    getDoc().transact(() => {
      insertItemNextTo(yScenes, ySceneOrder, newSceneId, scene, nextToSceneId);
    }, 'local');
  },

  createScenePrevTo: (newSceneId: string, scene: Scene, prevToSceneId: string) => {
    const yScenes = getDoc().getMap<Scene>('scenes');
    const ySceneOrder = getDoc().getArray<string>('sceneOrder');
    getDoc().transact(() => {
      insertItemPrevTo(yScenes, ySceneOrder, newSceneId, scene, prevToSceneId);
    }, 'local');
  },

  createMedia: (mediaId: string, mediaItem: Media) => {
    const yMedia = getDoc().getMap<Media>('media');
    const yMediaOrder = getDoc().getArray<string>('mediaOrder');
    getDoc().transact(() => {
      appendItemWithOrder(yMedia, yMediaOrder, mediaId, mediaItem);
    }, 'local');
  },

  createMediaNextTo: (newMediaId: string, mediaItem: Media, nextToMediaId: string) => {
    const yMedia = getDoc().getMap<Media>('media');
    const yMediaOrder = getDoc().getArray<string>('mediaOrder');
    getDoc().transact(() => {
      insertItemNextTo(yMedia, yMediaOrder, newMediaId, mediaItem, nextToMediaId);
    }, 'local');
  },

  createMediaPrevTo: (newMediaId: string, mediaItem: Media, prevToMediaId: string) => {
    const yMedia = getDoc().getMap<Media>('media');
    const yMediaOrder = getDoc().getArray<string>('mediaOrder');
    getDoc().transact(() => {
      insertItemPrevTo(yMedia, yMediaOrder, newMediaId, mediaItem, prevToMediaId);
    }, 'local');
  },

  createInterval: (intervalId: string, interval: Interval, sectionId: string) => {
    const yIntervals = getDoc().getMap<Interval>('intervals');
    const ySections = getDoc().getMap<Section>('sections');
    getDoc().transact(() => {
      yIntervals.set(intervalId, interval);
      const section = ySections.get(sectionId);
      if (!section) return;
      ySections.set(sectionId, {
        ...section,
        intervalOrder: appendChildId(section.intervalOrder, intervalId),
      });
    }, 'local');
  },

  createIntervalNextTo: (
    newIntervalId: string,
    interval: Interval,
    sectionId: string,
    nextToIntervalId: string
  ) => {
    const yIntervals = getDoc().getMap<Interval>('intervals');
    const ySections = getDoc().getMap<Section>('sections');
    getDoc().transact(() => {
      yIntervals.set(newIntervalId, interval);
      const section = ySections.get(sectionId);
      if (!section) return;
      const nextOrder = insertIdNextTo(section.intervalOrder, newIntervalId, nextToIntervalId);
      ySections.set(sectionId, {
        ...section,
        intervalOrder: nextOrder,
      });
    }, 'local');
  },

  createIntervalPrevTo: (
    newIntervalId: string,
    interval: Interval,
    sectionId: string,
    prevToIntervalId: string
  ) => {
    const yIntervals = getDoc().getMap<Interval>('intervals');
    const ySections = getDoc().getMap<Section>('sections');
    getDoc().transact(() => {
      yIntervals.set(newIntervalId, interval);
      const section = ySections.get(sectionId);
      if (!section) return;
      const nextOrder = insertIdPrevTo(section.intervalOrder, newIntervalId, prevToIntervalId);
      ySections.set(sectionId, {
        ...section,
        intervalOrder: nextOrder,
      });
    }, 'local');
  },

  createWord: (wordId: string, word: Word, intervalId: string) => {
    const yWords = getDoc().getMap<Word>('words');
    const yIntervals = getDoc().getMap<Interval>('intervals');
    getDoc().transact(() => {
      yWords.set(wordId, word);
      const interval = yIntervals.get(intervalId);
      if (!interval) return;
      yIntervals.set(intervalId, {
        ...interval,
        wordOrder: appendChildId(interval.wordOrder, wordId),
      });
    }, 'local');
  },

  createWordNextTo: (
    newWordId: string,
    word: Word,
    intervalId: string,
    nextToWordId: string
  ) => {
    const yWords = getDoc().getMap<Word>('words');
    const yIntervals = getDoc().getMap<Interval>('intervals');
    getDoc().transact(() => {
      yWords.set(newWordId, word);
      const interval = yIntervals.get(intervalId);
      if (!interval) return;
      const nextOrder = insertIdNextTo(interval.wordOrder, newWordId, nextToWordId);
      yIntervals.set(intervalId, {
        ...interval,
        wordOrder: nextOrder,
      });
    }, 'local');
  },

  createWordPrevTo: (
    newWordId: string,
    word: Word,
    intervalId: string,
    prevToWordId: string
  ) => {
    const yWords = getDoc().getMap<Word>('words');
    const yIntervals = getDoc().getMap<Interval>('intervals');
    getDoc().transact(() => {
      yWords.set(newWordId, word);
      const interval = yIntervals.get(intervalId);
      if (!interval) return;
      const nextOrder = insertIdPrevTo(interval.wordOrder, newWordId, prevToWordId);
      yIntervals.set(intervalId, {
        ...interval,
        wordOrder: nextOrder,
      });
    }, 'local');
  },

  deleteSection: (sectionId: string) => {
    const ySections = getDoc().getMap<Section>('sections');
    const ySectionOrder = getDoc().getArray<string>('sectionOrder');
    const yIntervals = getDoc().getMap<Interval>('intervals');
    const yWords = getDoc().getMap<Word>('words');
    getDoc().transact(() => {
      const section = ySections.get(sectionId);
      if (section) {
        section.intervalOrder.forEach((intervalId) => {
          const interval = yIntervals.get(intervalId);
          if (interval) {
            interval.wordOrder.forEach((wordId) => {
              yWords.delete(wordId);
            });
          }
          yIntervals.delete(intervalId);
        });
      }
      ySections.delete(sectionId);
      const nextOrder = removeIdFromOrder(ySectionOrder.toArray(), sectionId);
      ySectionOrder.delete(0, ySectionOrder.length);
      ySectionOrder.insert(0, nextOrder);
    }, 'local');
  },

  deleteScene: (sceneId: string) => {
    const yScenes = getDoc().getMap<Scene>('scenes');
    const ySceneOrder = getDoc().getArray<string>('sceneOrder');
    getDoc().transact(() => {
      yScenes.delete(sceneId);
      const nextOrder = removeIdFromOrder(ySceneOrder.toArray(), sceneId);
      ySceneOrder.delete(0, ySceneOrder.length);
      ySceneOrder.insert(0, nextOrder);
    }, 'local');
  },

  deleteMedia: (mediaId: string) => {
    const yMedia = getDoc().getMap<Media>('media');
    const yMediaOrder = getDoc().getArray<string>('mediaOrder');
    getDoc().transact(() => {
      yMedia.delete(mediaId);
      const nextOrder = removeIdFromOrder(yMediaOrder.toArray(), mediaId);
      yMediaOrder.delete(0, yMediaOrder.length);
      yMediaOrder.insert(0, nextOrder);
    }, 'local');
  },

  deleteInterval: (intervalId: string, sectionId: string) => {
    const yIntervals = getDoc().getMap<Interval>('intervals');
    const ySections = getDoc().getMap<Section>('sections');
    const yWords = getDoc().getMap<Word>('words');
    getDoc().transact(() => {
      const interval = yIntervals.get(intervalId);
      if (interval) {
        interval.wordOrder.forEach((wordId) => {
          yWords.delete(wordId);
        });
      }
      yIntervals.delete(intervalId);
      const section = ySections.get(sectionId);
      if (!section) return;
      ySections.set(sectionId, {
        ...section,
        intervalOrder: removeIdFromOrder(section.intervalOrder, intervalId),
      });
    }, 'local');
  },

  deleteWord: (wordId: string, intervalId: string) => {
    const yWords = getDoc().getMap<Word>('words');
    const yIntervals = getDoc().getMap<Interval>('intervals');
    getDoc().transact(() => {
      yWords.delete(wordId);
      const interval = yIntervals.get(intervalId);
      if (!interval) return;
      yIntervals.set(intervalId, {
        ...interval,
        wordOrder: removeIdFromOrder(interval.wordOrder, wordId),
      });
    }, 'local');
  },
});

export type YjsActions = ReturnType<typeof createYjsActions>;
