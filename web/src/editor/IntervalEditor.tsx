import { useEffect, useRef, useState } from "react";
import type { Interval } from "../lib/editor/types";

export type IntervalEditorMode = "edit" | "disable" | "play";

interface IntervalEditorProps {
  interval: Interval;
  sectionId: string;
  displayMode: IntervalEditorMode;
  highlightedWordIndex?: number;
  updateInterval: (interval: Interval) => void;
  deleteInterval: (intervalId: string) => void;
  appendInterval: (intervalId: string) => void;
  mergeIntervalToPrev: (intervalId: string) => void;
}

export default function IntervalEditor({ interval, displayMode = "edit", highlightedWordIndex = 0, updateInterval, deleteInterval, appendInterval, mergeIntervalToPrev }: IntervalEditorProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const spanRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [widths, setWidths] = useState<number[]>([]); // span과 input의 width를 동기화, span은 단어 길이 측정용

  useEffect(() => {
    const next: number[] = spanRefs.current.map((el) => {
      if (!el) return 20;
      return el.offsetWidth;
    });
    setWidths(next);
  }, [interval.words]);

  // Caption을 Split 클릭 시 호출
  const onCaptionSplitToggle = (index: number) => {
    const newWords = interval.words.map((w, i) =>
      i === index
        ? { ...w, isCaptionSplitted: !w.isCaptionSplitted }
        : w
    );
    updateInterval({ ...interval, words: newWords });
  };

  return (
    <div className="bg-white/50 flex flex-wrap p-1 text-sm h-full">
      {
        interval.words.map((word, index) => (
          <div key={index} className="relative inline-block my-1">
            <div className={`cursor-pointer py-1 inline-block border-gray-500 border rounded mx-px
                ${word.isCaptionSplitted ? "bg-orange-600" : "bg-gray-100"}`}
              onClick={() => onCaptionSplitToggle(index)}>
              &nbsp;
            </div>
            <span
              ref={(el) => {
                spanRefs.current[index] = el;
              }}
              className={`min-w-[1em] px-2 py-1 absolute whitespace-pre pointer-events-none bg-gray-500
                ${displayMode !== "edit" ? "visible" : "invisible"} 
                ${highlightedWordIndex === index ? "bg-green-400" : ""}`}>
              {word.text}
            </span>
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              value={word.text}
              className={`border border-gray-400 rounded px-2 py-1 align-top ${displayMode !== "edit" ? "invisible" : "visible"}`}
              style={{
                width: `calc(${(widths[index] ?? 20)}px + 1em)`,
              }}
              onInput={(e) => {
                const target = e.currentTarget;
                const value = target.value;

                // 공백/탭 기준으로 쪼갠다.
                const splitted = value.split(/[ \t]/).map(
                  (text, i) => ({ text, markName: `${index + i}`, start: 0, isCaptionSplitted: word.isCaptionSplitted, displayedText: text }));

                const newWords = [...interval.words];
                newWords.splice(index, 1, ...splitted);
                // 1. 앞쪽에 잘려나간 경우(중간/앞부분에서 공백) → 포커스 유지
                // 2. 뒤에 공백이 붙어서 새 토큰이 뒤에 생긴 경우(문자열이 공백으로 끝남) → 뒤 인풋으로 포커스 이동
                const shouldMoveToNext =
                  splitted.length > 1 && /[ \t]$/.test(value);

                updateInterval({ ...interval, words: newWords });

                if (shouldMoveToNext) {
                  // DOM 업데이트 이후에 포커스 이동
                  requestAnimationFrame(() => {
                    const next = inputRefs.current[index + 1];
                    next?.focus();
                    next?.setSelectionRange(next.value.length, next.value.length);
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && interval.words.length > 1 && e.currentTarget.selectionStart === 0) {
                  mergeIntervalToPrev(interval.id);
                } else if (e.key === "Backspace" && interval.words[index].text === "") {
                  e.preventDefault();

                  // 첫번째 인풋에서 지우기 누르면 interval 삭제
                  if (index === 0) {
                    deleteInterval(interval.id);
                    return;
                  } 

                  // 현재 인풋 지우고, 이전 인풋으로 포커스 이동
                  const newWords = [...interval.words];
                  newWords.splice(index, 1);

                  updateInterval({ ...interval, words: newWords });
                  requestAnimationFrame(() => {
                    const prev = inputRefs.current[index - 1];
                    prev?.focus();
                    prev?.setSelectionRange(prev.value.length, prev.value.length);
                  });
                } else if (e.key === "ArrowLeft") {
                  if (e.currentTarget.selectionStart === 0 && index > 0) {
                    e.preventDefault();
                    const prev = inputRefs.current[index - 1];
                    prev?.focus();
                    prev?.setSelectionRange(
                      prev.value.length,
                      prev.value.length
                    );
                  }
                } else if (e.key === "ArrowRight") {
                  if (
                    e.currentTarget.selectionStart === e.currentTarget.value.length &&
                    index < interval.words.length - 1
                  ) {
                    e.preventDefault();
                    const next = inputRefs.current[index + 1];
                    next?.focus();
                    next?.setSelectionRange(0, 0);
                  }
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  appendInterval(interval.id);
                }
              }}
            />
          </div>
        ))
      }
    </div>
  );
}