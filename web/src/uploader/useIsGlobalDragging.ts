import { useEffect, useRef, useState } from "react";

export function useIsGlobalDragging() {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const isFileDrag = (e: DragEvent) =>
      e.dataTransfer?.types?.includes("Files");

    const onDragEnter = (e: DragEvent) => {
      if (!isFileDrag(e)) return;

      dragCounter.current += 1;
      setIsDragging(true);
    };

    const onDragLeave = (e: DragEvent) => {
      if (!isFileDrag(e)) return;

      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    const onDrop = () => {
      dragCounter.current = 0;
      setIsDragging(false);
    };

    const onDragOver = (e: DragEvent) => {
      if (isFileDrag(e)) {
        e.preventDefault();
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragover", onDragOver);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragover", onDragOver);
    };
  }, []);

  return isDragging;
}
