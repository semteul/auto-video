

import { useState } from "react";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

const INTERVAL_HEIGHT = 200;

type EditingInterval = {
  type: "word" | "empty";
  time: number;
  id: string;
};

type MediaSegment = {
  type: "video" | "image";
  id: string;
  url: string;
  intervals: number;
};

export default function VideoEditorPage() {
  const [editingIntervals, setEditingIntervals] = useState<EditingInterval[]>([]);
  const [mediaSegments, setMediaSegments] = useState<MediaSegment[]>([]);

  const handleAddMediaSegment = () => {
    const newSegment: MediaSegment = {
      type: "video",
      id: `media-${Date.now()}`,
      url: "https://example.com/video.mp4",
      intervals: 1,
    };
    setMediaSegments([...mediaSegments, newSegment]);
  }

  const handleAddEditingInterval = () => {
    const newInterval: EditingInterval = {
      type: "empty",
      time: 5,
      id: `interval-${Date.now()}`,
    };
    setEditingIntervals([...editingIntervals, newInterval]);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setMediaSegments((prev) => {
      const oldIndex = prev.findIndex(segment => segment.id === active.id);
      const newIndex = prev.findIndex(segment => segment.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // intervals 수 조정 콜백
  const appendDown = (id: string) => {
    setMediaSegments((prev) =>
      prev.map((segment) =>
        segment.id === id
          ? { ...segment, intervals: segment.intervals + 1 }
          : segment
      )
    );
  }

  const popDown = (id: string) => {
    setMediaSegments((prev) =>
      prev.map((segment) =>
        segment.id === id && segment.intervals > 1
          ? { ...segment, intervals: segment.intervals - 1 }
          : segment
      )
    );
  }



  // 전체 높이 계산
  const totalHeight = editingIntervals.length * INTERVAL_HEIGHT;

  return (
    <div className="p-8 bg-white min-h-screen">
      <MediaPool projectId={'test-id'}/>
      <h1 className="text-2xl font-bold mb-6">Video Editor Page</h1>
      <div className="flex gap-4 mb-6">
        <button className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer" onClick={handleAddMediaSegment}>+ MediaSegment</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer" onClick={handleAddEditingInterval}>+ EditingInterval</button>
      </div>
      <div className="flex flex-row">
        {/* EditingIntervalLayer */}
        <div className="flex flex-col w-[40px]">
          {
            editingIntervals.map((interval, index) => (
              <div
                key={interval.id}
                style={{
                  height: INTERVAL_HEIGHT,
                }}
                className="w-full flex items-center justify-center bg-amber-300 border border-amber-700 text-white font-bold">
                {index}
              </div>
            ))}
        </div>
        {/* MediaSegmentLayer */}
        <div className="relative" style={{ height: totalHeight }}>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={mediaSegments}
              strategy={verticalListSortingStrategy}
            >
              {mediaSegments.map((segment) => (
                <SortableItem key={segment.id} segment={segment} appendDown={appendDown} popDown={popDown} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { MediaPool } from "../uploader/MediaPool";

function SortableItem({ segment, appendDown, popDown }: { segment: MediaSegment, appendDown: (id: string) => void, popDown: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: segment.id });

  const height = segment.intervals * INTERVAL_HEIGHT;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? "#ddd" : "#f5f5f5",
    height: `${height}px`,
  };

  return <div
    ref={setNodeRef}
    style={style}
    className="flex flex-row w-full bg-gray-500 border border-black">
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="flex flex-1 justify-center items-center">
        {/* 내용 */}
        {segment.type.toUpperCase()} <br />
        {segment.url} <br />
        Intervals: {segment.intervals} <br />
      </div>
      <div className="w-full flex flex-row items-center justify-center">
        <button className="flex-1 h-10 bg-green-500 cursor-pointer" onClick={() => appendDown(segment.id)}>+</button>
        <button className="flex-1 h-10 bg-red-500 cursor-pointer" onClick={() => popDown(segment.id)}>-</button>
      </div>
    </div>
    <div
      {...attributes}
      {...listeners}
      className="w-[20px] flex items-center justify-center cursor-grab">
      ::
    </div>
  </div>;
}