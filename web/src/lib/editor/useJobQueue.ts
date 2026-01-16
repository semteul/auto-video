import { useRef, useCallback } from "react";

type Task<T = unknown> = () => Promise<T> | T;

/**
 * BE를 위한 작업 큐 훅
 * 각 작업은 순차적으로 실행되며, 버전이 변경되면 대기 중인 작업이 취소됩니다.
 */
export function useJobQueue(onReset: () => void = () => { }) {
    const queueRef = useRef<Promise<unknown>>(Promise.resolve());
    const versionRef = useRef(0);

    const generateLocalId = useCallback((localId: string) => {
        const queueId = `queue-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;

        idMapRef.current.set(localId, queueId);
        return queueId;
    }, []);

    const enqueue = useCallback(<T,>(task: Task<T>): Promise<T> => {
        const currentVersion = versionRef.current;

        const next = queueRef.current.then(async () => {
            if (currentVersion !== versionRef.current) {
                throw new Error("Queue task cancelled (version mismatch)");
            }
            try {
                const result = await task();
                return result;
            } catch (error) {
                reset();
                throw error;
            }
        });

        queueRef.current = next.catch(() => { });

        return next;
    }, []);

    const reset = useCallback(() => {
        // 작업 큐 초기화
        versionRef.current += 1;
        queueRef.current = Promise.resolve();

        // ID 매핑 초기화
        idMapRef.current.clear();

        // 외부 리셋 콜백 호출
        onReset();
    }, []);

    const getQueueId = useCallback((localId: string) => {
        return idMapRef.current.get(localId);
    }, []);

    return {
        enqueue,
        reset,
        generateLocalId,
        getQueueId,
    };
}