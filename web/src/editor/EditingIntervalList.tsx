import React from "react";

export interface EditingInterval {
  type: "word" | "empty";
  time: number;
  id: string;
}

interface EditingIntervalListProps {
  intervals: EditingInterval[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const INTERVAL_HEIGHT = 180;

export default function EditingIntervalList({ intervals, onDelete, onAdd }: EditingIntervalListProps) {
  return (
    <div className="flex flex-col items-center w-24">
      <button className=" px-2 py-1 bg-blue-500 text-white rounded w-full" onClick={onAdd}>+ Interval</button>
      {intervals.map((interval, idx) => (
        <div
          key={interval.id}
          className="flex items-center justify-between w-full mb-2 bg-orange-400 text-white rounded shadow font-bold"
          style={{ height: INTERVAL_HEIGHT, fontSize: 22, padding: '0 10px' }}
        >
          <span>{idx + 1}</span>
          <button className="ml-2 px-2 py-1 bg-red-500 rounded" style={{ fontSize: 22 }} onClick={() => onDelete(interval.id)}>-</button>
        </div>
      ))}
    </div>
  );
}
