import { useEffect, useRef, useState } from "react";
import { type Word } from "./ssml";

interface SectionEditorProps {
  words: Word[];
  onChange?: (words: Word[]) => void;
  mode: "edit" | "disable" | "play";
  currentTime?: number;
}

export default function SectionEditor({
  words,
  mode,
  currentTime = 0,
  onChange }: SectionEditorProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const spanRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [widths, setWidths] = useState<number[]>([]);

  useEffect(() => {
    const next: number[] = spanRefs.current.map((el) => {
      if (!el) return 20;
      return el.offsetWidth;
    });
    setWidths(next);
  }, [words]);

  return (
    <div className="flex flex-wrap w-full content-start border border-gray-500 rounded h-full">
      {
        words.map((word, index) => (
          <div key={index} className="relative inline-block my-1">
            <div className={`cursor-pointer py-1 inline-block border-gray-500 border rounded mx-px
                ${word.isCaptionSplitted ? "bg-orange-600" : "bg-gray-100"}`}
              onClick={() => {
                const newWords = words.map((w, i) =>
                  i === index
                    ? { ...w, isCaptionSplitted: !w.isCaptionSplitted }
                    : w
                );
                onChange?.(newWords);
              }}>
              &nbsp;
            </div>
            <span
              ref={(el) => {
                spanRefs.current[index] = el;
              }}
              className={`min-w-[1em] px-2 py-1 absolute whitespace-pre pointer-events-none bg-gray-500
                ${mode !== "edit" ? "visible" : "invisible"} 
                ${currentTime >= (word.start ?? Infinity) ? "bg-green-400" : ""}`}>
              {word.text}
            </span>
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              value={word.text}
              className={`border border-gray-400 rounded px-2 py-1 align-top ${mode !== "edit" ? "invisible" : "visible"}`}
              style={{
                width: `calc(${(widths[index] ?? 20)}px + 1em)`,
              }}
              onInput={(e) => {
                const target = e.currentTarget;
                const value = target.value;

                // 공백/탭 기준으로 쪼갠다.
                const splitted = value.split(/[ \t]/).map(
                  (text, i) => ({ text, markName: `${index + i}`, start: 0, isCaptionSplitted: word.isCaptionSplitted, displayedText: text }));

                const newWords = [...words];
                newWords.splice(index, 1, ...splitted);
                // 1. 앞쪽에 잘려나간 경우(중간/앞부분에서 공백) → 포커스 유지
                // 2. 뒤에 공백이 붙어서 새 토큰이 뒤에 생긴 경우(문자열이 공백으로 끝남) → 뒤 인풋으로 포커스 이동
                const shouldMoveToNext =
                  splitted.length > 1 && /[ \t]$/.test(value);

                onChange?.(newWords);

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
                if (e.key === "Backspace" && words[index].text === "") {
                  e.preventDefault();

                  if (index === 0) return; // 첫번째 인풋이면 아무 동작 안함

                  // 현재 인풋 지우고, 이전 인풋으로 포커스 이동
                  const newWords = [...words];
                  newWords.splice(index, 1);

                  onChange?.(newWords);
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
                    index < words.length - 1
                  ) {
                    e.preventDefault();
                    const next = inputRefs.current[index + 1];
                    next?.focus();
                    next?.setSelectionRange(0, 0);
                  }
                }
              }}
            />
          </div>
        ))
      }
    </div>
  );
}
