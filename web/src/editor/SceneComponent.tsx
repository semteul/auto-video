import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from "react-icons/fa";
import type { Scene } from "../lib/editor/types";

interface SceneComponentProps {
  scene: Scene;
  intervalHeight: number;
  resizeScene: (sceneId: string, newIntervalCount: number) => void;
  createSceneNextTo: (sceneId: string) => void;
  createScenePrevTo: (sceneId: string) => void;
  deleteScene: (sceneId: string) => void;
}

import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { getSortableStyle } from "./sortableStyle";

export default function SceneComponent({
  scene,
  intervalHeight,
  resizeScene,
  createSceneNextTo,
  createScenePrevTo,
  deleteScene
}: SceneComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging, transform, transition } = useSortable({ id: scene.sceneId });
  const dragStartY = useRef<number | null>(null);
  const startIntervalCount = useRef<number>(scene.intervalCount || 1);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    startIntervalCount.current = scene.intervalCount || 1;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragStartY.current === null) return;
    const diffY = e.clientY - dragStartY.current;
    // intervalHeight 만큼 움직일 때마다 intervalCount 1씩 증감
    let newCount = startIntervalCount.current + Math.round(diffY / intervalHeight);
    if (newCount < 1) newCount = 1;
    if (newCount !== scene.intervalCount) {
      resizeScene(scene.sceneId, newCount);
    }
  };

  const handleMouseUp = () => {
    dragStartY.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const style = getSortableStyle({
    transform,
    transition,
    isDragging,
    intervalCount: scene.intervalCount || 1,
    intervalHeight,
  });

  return (
    <div
      key={scene.sceneId}
      ref={setNodeRef}
      className="flex flex-row"
      style={style}
    >
      <div
        className="w-5 bg-gray-200 border-gray-500 border-t border-b"
        style={{
          marginTop: intervalHeight / 10,
          marginBottom: intervalHeight / 10,
        }} />
      <div className="flex flex-row w-full h-full border border-gray-500">
        <div className="flex flex-1 flex-col">
          <h4 className="font-semibold">Scene ID: {scene.sceneId}</h4>
          <button
            className="mt-auto mx-5 rounded-tl-2xl rounded-tr-2xl bg-black/50 h-5 cursor-ns-resize"
            onMouseDown={handleMouseDown}
            title="드래그로 사이즈 조절"
          >
            ↕
          </button>
        </div>
        <div className="w-8 flex flex-col h-full items-center justify-between bg-black/30">
          <button
            className="cursor-pointer flex flex-col items-center w-full p-2" title="Add Section Above"
            onClick={() => createScenePrevTo(scene.sceneId)}>
            <FaArrowUp size={10} />
            <FaPlus size={10} />
          </button>
          <button
            className="my-auto cursor-pointer flex flex-col items-center w-full p-2" title="Delete Section"
            onClick={() => {
              const ok = window.confirm("정말로 이 Scene을 삭제하시겠습니까?");
              if (ok) deleteScene(scene.sceneId)
            }}>
            <FaTrash size={13} />
          </button>
          <button
            className="cursor-pointer flex flex-col items-center w-full p-2" title="Add Section Below"
            onClick={() => createSceneNextTo(scene.sceneId)}>
            <FaPlus size={10} />
            <FaArrowDown size={10} />
          </button>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="flex h-full items-center justify-center w-5 cursor-grabbing">
          ::
        </div>
      </div>
    </div>
  );
}