import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { SceneResponse } from "../lib/types";

const INTERVAL_HEIGHT = 200;

type Scene = SceneResponse & { intervals?: number };

type SortableItemProps = {
  scene: Scene;
  appendDown: (id: string) => void;
  popDown: (id: string) => void;
  onDropMedia: (sceneId: string, mediaId: string, mediaType?: "image" | "video") => void;
};

export default function SortableItem({ scene, appendDown, popDown, onDropMedia }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.scene_id });

  const height = (scene.intervals ?? 1) * INTERVAL_HEIGHT;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? "#ddd" : "#f5f5f5",
    height: `${height}px`,
  };

  // 드롭 이벤트 핸들러
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const mediaId = e.dataTransfer.getData("media-id");
    const mediaType = e.dataTransfer.getData("media-type") as "image" | "video";
    if (mediaId) {
      onDropMedia(scene.scene_id, mediaId, mediaType || "image");
    } else {
      alert("미디어 ID를 찾을 수 없습니다. 업로드가 완료된 미디어만 드래그하세요.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-row w-full bg-gray-500 border border-black"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-1 justify-center items-center">
          {/* 내용 */}
          {scene.media?.url ? (
            <img src={scene.media.url} alt="media" style={{ maxWidth: "100%", maxHeight: "120px", borderRadius: "8px" }} />
          ) : (
            <span>{scene.media?.content_type?.toUpperCase() ?? "SCENE"}</span>
          )}
          <br />
          Intervals: {(scene.intervals ?? 1)} <br />
        </div>
        <div className="w-full flex flex-row items-center justify-center">
          <button className="flex-1 h-10 bg-green-500 cursor-pointer" onClick={() => appendDown(scene.scene_id)}>+</button>
          <button className="flex-1 h-10 bg-red-500 cursor-pointer" onClick={() => popDown(scene.scene_id)}>-</button>
        </div>
      </div>
      <div
        {...attributes}
        {...listeners}
        className="w-5 flex items-center justify-center cursor-grab"
      >
        ::
      </div>
    </div>
  );
}
