import * as Y from "yjs";
import { v4 as uuidv4 } from "uuid";

export function shallowEqualArray<T>(a: T[], b: T[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function syncMap<T>(
  yMap: Y.Map<Y.Map<any>>,
  prev: Map<string, T>,
  updater: (y: Y.Map<any>, prev: T) => T,
  creator: (y: Y.Map<any>) => T,
): Map<string, T> {
  let changed = false;
  const next = new Map(prev);

  yMap.forEach((yValue, key) => {
    const prevValue = prev.get(key);
    if (prevValue) {
      const nextValue = updater(yValue, prevValue);
      if (nextValue !== prevValue) {
        next.set(key, nextValue);
        changed = true;
      }
    } else {
      next.set(key, creator(yValue));
      changed = true;
    }
  });

  for (const key of prev.keys()) {
    if (!yMap.has(key)) {
      next.delete(key);
      changed = true;
    }
  }

  return changed ? next : prev;
}

export function swapTransact(
  ydoc: Y.Doc,
  order: Y.Array<string>,
  keyA: string,
  keyB: string,
) {
  const indexA = order.toArray().indexOf(keyA);
  const indexB = order.toArray().indexOf(keyB);
  if (indexA === -1 || indexB === -1) {
    throw new Error("Keys must exist in order array");
  }
  ydoc.transact(() => {
    order.delete(Math.min(indexA, indexB), 1);
    order.insert(Math.min(indexA, indexB), [keyB]);
    order.delete(Math.max(indexA, indexB), 1);
    order.insert(Math.max(indexA, indexB), [keyA]);
  });
}

export function createId(): string {
  return uuidv4();
}
