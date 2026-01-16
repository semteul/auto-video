import { GrRevert, GrSave } from "react-icons/gr";
import { MdPlayDisabled, MdStopCircle, MdPlayCircle } from "react-icons/md";
import { ImSpinner } from "react-icons/im";

import { useEffect, useRef, useState } from "react";

import { type Section, type Word } from "./ssml";
import SectionEditor from "./SectionEditor";
import { getAudioUrl, getSection, updateSectionWithAudio } from "../lib/tts";

export type EditorMode = "idle" | "edit" | "play" | "generate";

export default function Section({ scriptId, sectionId }: { scriptId: string; sectionId: string }) {
  const [section, setSection] = useState<Section | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [mode, setMode] = useState<EditorMode>("idle");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getSection(scriptId, sectionId).then((section) => {
      if (!section) {
        window.alert(`Section ${sectionId} not found`);
        return;
      }
      setSection(section);
      setWords(section.words);
    });
  }, [sectionId, scriptId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    }

    const handleEnded = () => {
      setMode("idle");
      setCurrentTime(0);
    }

    if (mode === "play" && audioUrl) {
      audio.currentTime = 0;
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);
      audio
        .play()
        .catch(() => {
          window.alert("Failed to play audio.");
          setMode("idle");
        });

      return () => {
        audio.pause();
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
      };
    }

    // play 모드가 아니거나 audioUrl 이 없으면 재생 중지
    audio.pause();
  }, [mode, audioUrl]);

  if (!section) {
    return <div>Loading section {sectionId}...</div>;
  }

  async function startPlay() {
    if (!section || !section.isGenerated || isAudioLoading) return;

    setMode("play");
    setCurrentTime(0);
    setAudioUrl(null);
    setIsAudioLoading(true);

    try {
      const url = await getAudioUrl(scriptId, section.id);
      setAudioUrl(url);
    } catch {
      window.alert("Failed to load audio.");
      setMode("idle");
    } finally {
      setIsAudioLoading(false);
    }
  }

  function onEditorChange(words: Word[]) {
    if (!section) return;
    if (mode === "idle") {
      // 편집 시작 감지
      if (JSON.stringify(section.words) !== JSON.stringify(words)) {
        setMode("edit");
        setWords(words);
      }
      return;
    }

    if (mode === "edit") {
      setWords(words);
      return;
    }

    // 비정상적인 입력 변화, 상태 복구
    cancelEdit();
  }

  function cancelEdit() {
    if (!section) return;

    setMode("idle");
    setWords(section.words);
  }

  async function onSave() {
    if (!section) return;

    setMode("generate");
    try {
      const newSection: Section = {
        id: section.id,
        isGenerated: false,
        words: words,
        delay: section.delay,
      };

      const updatedSection = await updateSectionWithAudio(scriptId, newSection);

      setSection(updatedSection);
      setWords(updatedSection.words);
      setMode("idle");
    } catch {
      window.alert("Failed to save section.");
      setMode("edit");
    }
  }

  return (
    <div className="w-full border border-black flex flex-row">
      <div className="w-full p-2 min-h-20">
        {
          (mode === "idle" || mode === "edit") && (
            <SectionEditor
              words={words}
              onChange={onEditorChange}
              mode={"edit"}
            />
          )
        }
        {
          mode === "generate" &&
          <SectionEditor
            words={words}
            onChange={onEditorChange}
            mode={"disable"} />
        }
        {
          mode === "play" &&
          <SectionEditor
            words={words}
            onChange={onEditorChange}
            mode={"play"}
            currentTime={currentTime} />
        }
        <audio
          ref={audioRef}
          src={audioUrl ?? undefined} 
          />
      </div>
      <div className="bg-gray-300 p-2 flex-1">
        <div className="flex flex-col w-10">
          <span>
            {mode}
          </span>
          {
            mode === "idle" &&
            <div className="flex flex-col w-full">
              {
                section.isGenerated ?
                  <MdPlayCircle
                    size={24}
                    className="w-full h-auto p-1 rounded cursor-pointer"
                    color="green"
                    onClick={startPlay}
                  />
                  :
                  <MdPlayDisabled size={24} className="w-full h-auto p-1 rounded" color="gray" />
              }
            </div>
          }
          {
            mode === "play" &&
            <div className="flex flex-col w-full">
              {
                isAudioLoading ?
                  <ImSpinner size={24} className="w-full h-auto p-1 rounded animate-spin" />
                  : <MdStopCircle
                    size={24}
                    className={`w-full h-auto p-1 rounded ${isAudioLoading ? "" : "cursor-pointer"}`}
                    color="red"
                    onClick={isAudioLoading ? undefined : () => {
                      setMode("idle");
                      setCurrentTime(0);
                    }}
                  />
              }
            </div>
          }
          {
            mode === "edit" &&
            <div className="flex flex-col w-full">
              <GrRevert size={24} className="w-full h-auto p-1 rounded cursor-pointer" onClick={cancelEdit} />
              <GrSave size={24} className="w-full h-auto p-1 rounded cursor-pointer" color="green" onClick={onSave} />
            </div>
          }
        </div>
      </div>
    </div>
  );
}
