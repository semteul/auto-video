
import { CSS } from "@dnd-kit/utilities";
import type { Transform } from "@dnd-kit/utilities";

export function getSortableStyle({
  transform,
  transition,
  isDragging,
  intervalCount,
  intervalHeight,
}: {
  transform: Transform | null;
  transition: string | undefined;
  isDragging: boolean;
  intervalCount: number;
  intervalHeight: number;
}) {
  return {
    height: intervalCount * intervalHeight,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
  };
}
