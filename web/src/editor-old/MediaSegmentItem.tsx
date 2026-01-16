import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

export type MediaSegment = {
  type: "video" | "image";
  id: string;
  url: string;
  intervals: number;
};

interface MediaSegmentItemProps {
  segment: MediaSegment;
  onDelete: (id: string) => void;
  onIntervalChange: (id: string, delta: number) => void;
  intervalHeight: number;
  isFirst: boolean;
  isLast: boolean;
}

export default function MediaSegmentItem({ segment, onDelete, onIntervalChange, intervalHeight, isFirst, isLast }: MediaSegmentItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: segment.id });
  const style: React.CSSProperties = {
    height: segment.intervals * intervalHeight,
    lineHeight: `${intervalHeight}px`,
    transform: CSS.Transform.toString(transform),
    transition,
    width: 180,
    marginBottom: 18,
    background: "#6366f1",
    color: "#fff",
    border: "2px solid #a5b4fc",
    borderRadius: 16,
    position: "relative",
    fontSize: 22,
    fontWeight: 600,
    boxShadow: "0 4px 16px 0 #0002",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* 드래그 핸들 */}
      <div {...listeners} style={{ position: "absolute", left: 8, top: 8, cursor: "grab", fontSize: 28, userSelect: "none", zIndex: 3 }}>☰</div>
      {/* 삭제 버튼 */}
      <button onClick={e => { e.stopPropagation(); onDelete(segment.id); }} style={{ position: "absolute", right: 8, top: 8, background: "#ef4444", color: "white", borderRadius: 8, padding: "4px 16px", fontSize: 22, border: "none", cursor: "pointer", zIndex: 5 }}>-</button>
      {/* ▲ 버튼 */}
      <button disabled={isFirst} onClick={e => { e.stopPropagation(); onIntervalChange(segment.id, +1); }} style={{ position: "absolute", right: 8, top: 48, fontSize: 18, background: "#fff", color: "#6366f1", border: "none", borderRadius: 5, cursor: isFirst ? "not-allowed" : "pointer", padding: "2px 8px", zIndex: 4 }}>▲</button>
      {/* ▼ 버튼 */}
      <button disabled={isLast} onClick={e => { e.stopPropagation(); onIntervalChange(segment.id, -1); }} style={{ position: "absolute", right: 8, bottom: 48, fontSize: 18, background: "#fff", color: "#6366f1", border: "none", borderRadius: 5, cursor: isLast ? "not-allowed" : "pointer", padding: "2px 8px", zIndex: 4 }}>▼</button>
      {/* 내용 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <span style={{ fontSize: 22 }}>{segment.type}</span>
        <span style={{ fontSize: 16, marginLeft: 4 }}>({segment.intervals})</span>
      </div>
    </div>
  );
}
