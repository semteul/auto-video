//
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import MediaSegmentItem from "./MediaSegmentItem";
import type { MediaSegment } from "./MediaSegmentItem";
import type { DragEndEvent } from "@dnd-kit/core";

interface MediaSegmentListProps {
  segments: MediaSegment[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  onDragEnd: (newOrder: MediaSegment[]) => void;
  onIntervalChange: (id: string, delta: number) => void;
  intervalHeight: number;
}

export default function MediaSegmentList({ segments, onDelete, onAdd, onDragEnd, onIntervalChange, intervalHeight }: MediaSegmentListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = segments.findIndex(seg => seg.id === active.id);
      const newIndex = segments.findIndex(seg => seg.id === over.id);
      const newOrder = arrayMove(segments, oldIndex, newIndex);
      onDragEnd(newOrder);
    }
  }

  return (
    <div className="flex flex-col items-center w-56">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={segments.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {segments.map((segment, idx) => (
            <MediaSegmentItem
              key={segment.id}
              segment={segment}
              onDelete={onDelete}
              onIntervalChange={onIntervalChange}
              intervalHeight={intervalHeight}
              isFirst={idx === 0}
              isLast={idx === segments.length - 1}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
