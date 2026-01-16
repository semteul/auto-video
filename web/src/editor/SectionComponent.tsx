import { FaArrowUp, FaArrowDown, FaPlus, FaTrash, FaSpinner } from "react-icons/fa";
import type { BlankSection, Interval, Section, SpeechSection } from "../lib/editor/types";
import IntervalEditor, { type IntervalEditorMode } from "./IntervalEditor";
import { useState } from "react";

interface SectionComponentProps {
  section: Section;
  intervalHeight: number;
  createSectionPrevTo: (sectionId: string, type: Section["type"]) => void;
  createSectionNextTo: (sectionId: string, type: Section["type"]) => void;
  deleteSection: (sectionId: string) => void;
}

interface SpeechSectionComponentProps extends SectionComponentProps {
  section: SpeechSection;
  isPlaying?: boolean;
  updateSpeechSection: (sectionId: string, section: SpeechSection) => void;
}

interface BlankSectionComponentProps extends SectionComponentProps {
  section: BlankSection;
  isPlaying?: boolean;
  updateDuration?: (sectionId: string, duration: number) => void;
}


export function SpeechSectionComponent({
  section,
  intervalHeight,
  updateSpeechSection,
  isPlaying = false,
  createSectionPrevTo,
  createSectionNextTo,
  deleteSection,
}: SpeechSectionComponentProps) {
  const [draftSection, setDraftSection] = useState<SpeechSection>(section);

  // Draft 수정중인게 edit
  const isEditing = (JSON.stringify(draftSection) !== JSON.stringify(section));
  const intervalDisplayMode: IntervalEditorMode = isPlaying ? "play" : "edit";
  
  const updateInterval = (interval: Interval) => {
    const newIntervals = draftSection.intervals.map((intv) => {
      if (intv.id === interval.id) {
        return interval;
      }
      return intv;
    });
    const newSection: SpeechSection = {
      ...draftSection,
      intervals: newIntervals,
    };
    setDraftSection(newSection);
  };

  const appendInterval = (intervalId: string) => {
    const index = draftSection.intervals.findIndex((intv) => intv.id === intervalId);
    if (index === -1) return;
    const newInterval: Interval = {
      id: `i${Date.now()}`,
      words: [{
        text: "",
        displayedText: "",
        isCaptionSplitted: false,
        start: 0,
      }],
    };
    const newIntervals = [...draftSection.intervals];
    newIntervals.splice(index + 1, 0, newInterval);
    const newSection: SpeechSection = {
      ...draftSection,
      intervals: newIntervals,
    };
    setDraftSection(newSection);
  };

  const deleteInterval = (intervalId: string) => {
    if (draftSection.intervals.length <= 1) return;
    const newIntervals = draftSection.intervals.filter((intv) => intv.id !== intervalId);
    const newSection: SpeechSection = {
      ...draftSection,
      intervals: newIntervals,
    };
    setDraftSection(newSection);
  };

  const mergeIntervalToPrev = (intervalId: string) => {
    const index = draftSection.intervals.findIndex((intv) => intv.id === intervalId);

    if (index <= 0) return;

    const newIntervals = [...draftSection.intervals];
    const prevInterval = newIntervals[index - 1];
    const currInterval = newIntervals[index];
    const mergedInterval: Interval = {
      id: prevInterval.id,
      words: [...prevInterval.words, ...currInterval.words],
    };

    newIntervals.splice(index - 1, 2, mergedInterval);

    const newSection: SpeechSection = {
      ...draftSection,
      intervals: newIntervals,
    };
    setDraftSection(newSection);
  }

  const cancelDraft = () => {
    setDraftSection(section);
  };

  const saveDraft = () => {
    updateSpeechSection(section.id, draftSection);
  };

  return (
    <SectionContainer
      section={draftSection}
      handleColor="blue-300"
      bgColor="blue-300"
      intervalHeight={intervalHeight}
    >
      <div className="flex flex-row h-full border">
        <SectionMenu
          section={section}
          deleteSection={deleteSection}
          createSectionPrevTo={createSectionPrevTo}
          createSectionNextTo={createSectionNextTo}>
          {isEditing && (
            <div className="flex flex-col items-center justify-center w-full px-3 gap-2">
              <button
                className="w-full py-1 bg-green-300 rounded cursor-pointer text-xs flex items-center justify-center"
                onClick={saveDraft}
              >
                Save
              </button>
              <button
                className="w-full py-1 bg-red-300 rounded cursor-pointer text-xs flex items-center justify-center"
                onClick={cancelDraft}
              >
                Cancel
              </button>
            </div>
          )}
          {!isEditing && !section.isGenerated && (
            <div className="w-full flex flex-col items-center justify-center">
              <FaSpinner className="animate-spin mr-1" />
              <div className="mt-2">음성<br />생성중..</div>
            </div>
          )}
          {!isEditing && section.isGenerated && (
            <div className="w-full flex flex-col items-center justify-center">
              {section.duration.toFixed(2)} 초
            </div>
          )}
        </SectionMenu>
        <div
          className="flex-1 flex flex-col w-full"
          style={{ height: intervalHeight * draftSection.intervals.length }}
        >
          {
            draftSection.intervals.map((interval, index) => (
              <div
                key={interval.id}
                className={`w-full flex-1 border-black/50 ${index !== 0 ? "border-t" : ""}`}>
                <IntervalEditor
                  interval={interval}
                  sectionId={section.id}
                  displayMode={intervalDisplayMode}
                  updateInterval={updateInterval}
                  deleteInterval={deleteInterval}
                  appendInterval={appendInterval}
                  mergeIntervalToPrev={mergeIntervalToPrev}
                />
              </div>
            ))
          }
        </div>
      </div>
    </SectionContainer>
  );
}

export function BlankSectionComponent({
  section,
  intervalHeight,
  updateDuration,
  createSectionNextTo,
  createSectionPrevTo,
  deleteSection,
}: BlankSectionComponentProps) {

  return (
    <SectionContainer
      section={section}
      handleColor="gray-200"
      bgColor="gray-200"
      intervalHeight={intervalHeight}
    >
      <div
        className="w-full flex flex-row border border-black/50"
        style={{ height: intervalHeight }}>
        <SectionMenu
          section={section}
          deleteSection={deleteSection}
          createSectionNextTo={createSectionNextTo}
          createSectionPrevTo={createSectionPrevTo} />
        <div className="flex items-center justify-center w-full">
          duration:&nbsp;
          <input
            type="number"
            value={section.duration}
            onChange={(e) => updateDuration && updateDuration(section.id, Number(e.target.value))}
            className="w-16 p-1 m-2 rounded bg-white"
          />
          초
        </div>
      </div>
    </SectionContainer>
  );
}

interface SectionMenuProps {
  section: Section;
  children?: React.ReactNode;
  createSectionPrevTo: (sectionId: string, type: Section["type"]) => void;
  createSectionNextTo: (sectionId: string, type: Section["type"]) => void;
  deleteSection: (sectionId: string) => void;
}

function SectionMenu({ section, children, createSectionPrevTo, createSectionNextTo, deleteSection }: SectionMenuProps) {

  const createSectionPrev = () => {
    const ok = window.confirm("Speech Section을 추가하시겠습니까? 취소 시 Blank Section이 추가됩니다.");
    if (ok) {
      createSectionPrevTo(section.id, "speech");
    } else {
      createSectionPrevTo(section.id, "blank");
    }
  }

  const createSectionNext = () => {
    const ok = window.confirm("Speech Section을 추가하시겠습니까? 취소 시 Blank Section이 추가됩니다.");
    if (ok) {
      createSectionNextTo(section.id, "speech");
    } else {
      createSectionNextTo(section.id, "blank");
    }
  }

  return (
    <div
      className={`flex flex-row text-xs`}
      style={{
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)"
      }}>
      <div className="w-8 flex flex-col h-full items-center justify-between bg-black/10">
        <button
          onClick={createSectionPrev}
          className="cursor-pointer flex flex-col items-center w-full p-2" title="Add Section Above">
          <FaArrowUp size={10} />
          <FaPlus size={10} />
        </button>
        <button
          onClick={() => {
            const ok = window.confirm("정말로 이 Section을 삭제하시겠습니까?");
            if (ok)
              deleteSection(section.id)
          }}
          className="my-auto cursor-pointer flex flex-col items-center w-full p-2" title="Delete Section">
          <FaTrash size={13} />
        </button>
        <button
          onClick={createSectionNext}
          className="cursor-pointer flex flex-col items-center w-full p-2" title="Add Section Below">
          <FaPlus size={10} />
          <FaArrowDown size={10} />
        </button>
      </div>
      <div className="w-20 flex flex-col">
        <div className="w-full text-center text-sm text-gray-500">
          {
            section.type === "speech" ? "Speech" : "Blank"
          }
        </div>
        <div className="text-sm text-gray-500 w-full items-center justify-center flex flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}


function SectionContainer({ handleColor, bgColor, children }:
  { handleColor: string, bgColor: string, intervalHeight: number, children: React.ReactNode, section: Section }) {
  return (
    <div className={`w-full flex flex-row`}>
      <div
        className={`flex items-center justify-center cursor-grabbing w-5 bg-${handleColor}`}>
        ::
      </div>
      <div
        className={`flex-1 bg-${bgColor}`}
      >
        {children}
      </div>
    </div>
  );
}