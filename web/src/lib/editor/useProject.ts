import {useEffect, useState } from "react";

import type {
  VideoProject,
  Section,
  SpeechSection,
  BlankSection,
  Scene,
} from "./types";
import { getProject } from "../project";
import { getProjectScenesMediaInfo, requestCreateScene, requestDeleteScene } from "../scene";

export function useProject(id: string) {
  const [project, setProject] = useState<VideoProject | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);

  const reset = async (id: string) => {
    const project: VideoProject = await getProject(id);
    const sections: Section[] = [];
    const scenes: Scene[] = await getProjectScenesMediaInfo(id);

    setProject(project);
    setSections(sections);
    setScenes(scenes);
  };

  useEffect(() => {
    reset(id).catch(console.error);
  }, [id]);

  const updateProject = (updatedProject: VideoProject) => {
    setProject(updatedProject);
  };

  // Scene 생성
  const createScene = async (index: number = scenes.length) => {
    if (!project)
      return;
    console.log("Creating scene at index:", index);
    const newScene: Scene = await requestCreateScene(project.id, {
      media_id: null,
      word_count: 1,
    });
    console.log("Created scene:", newScene);

    setScenes((prev) => {
      const newScenes = [...prev];
      newScenes.splice(index, 0, newScene);
      return newScenes;
    });
    return newScene;
  };

  // 특정 sceneId 다음에 생성
  const createSceneNextTo = (sceneId: string) => {
    const index = scenes.findIndex((s) => s.sceneId === sceneId);
    if (index === -1) return;
    return createScene(index + 1);
  };

  // 특정 sceneId 이전에 생성
  const createScenePrevTo = (sceneId: string) => {
    const index = scenes.findIndex((s) => s.sceneId === sceneId);
    if (index === -1) return;
    return createScene(index);
  };

  const resizeScene = (sceneId: string, newIntervalCount: number) => {
    setScenes((prev) => {
      return prev.map((s) => {
        if (s.sceneId === sceneId) {
          return { ...s, intervalCount: newIntervalCount };
        }
        return s;
      });
    });
  };

  const deleteScene = async (sceneId: string) => {
    await requestDeleteScene(sceneId);
    setScenes((prev) => prev.filter((s) => s.sceneId !== sceneId));
  };

  const swapScene = (id1: string, id2: string) => {
    setScenes((prev) => {
      const index1 = prev.findIndex((s) => s.sceneId === id1);
      const index2 = prev.findIndex((s) => s.sceneId === id2);
      if (index1 === -1 || index2 === -1) return prev;
      const newScenes = [...prev];
      [newScenes[index1], newScenes[index2]] = [
        newScenes[index2],
        newScenes[index1],
      ];
      return newScenes;
    });
  };

  const createSection = (
    type: Section["type"],
    index: number = sections.length
  ): Section => {
    // TODO : BE 연동
    const newSection: Section =
      type === "speech"
        ? ({
            id: `s${Date.now()}`,
            duration: 0,
            type: "speech",
            intervals: [
              {
                id: `i${Date.now()}`,
                words: [
                  {
                    text: "",
                    displayedText: "",
                    isCaptionSplitted: false,
                    start: 0,
                  },
                ],
              },
            ],
            isGenerated: false,
          } as SpeechSection)
        : ({
            id: `s${Date.now()}`,
            duration: 0,
            type: "blank",
          } as BlankSection);

    setSections((prev) => {
      const newSections = [...prev];
      newSections.splice(index, 0, newSection);
      return newSections;
    });

    return newSection as Section;
  };

  const createSectionNextTo = (sectionId: string, type: Section["type"]) => {
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    return createSection(type, index + 1);
  };

  const createSectionPrevTo = (sectionId: string, type: Section["type"]) => {
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    return createSection(type, index);
  };

  const updateDuration = (sectionId: string, duration: number) => {
    setSections((prev) => {
      return prev.map((s) => {
        if (s.id === sectionId && s.type === "blank") {
          return { ...s, duration };
        }
        return s;
      });
    });
  };

  const updateSpeechSection = (sectionId: string, section: SpeechSection) => {
    setSections((prev) => {
      return prev.map((s) => {
        if (s.id === sectionId && s.type === "speech") {
          return { ...section };
        }
        return s;
      });
    });
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  return {
    project,
    updateProject,
    sections,
    createSection,
    createSectionNextTo,
    createSectionPrevTo,
    updateDuration,
    updateSpeechSection,
    scenes,
    setScenes,
    createScene,
    createSceneNextTo,
    createScenePrevTo,
    resizeScene,
    deleteScene,
    deleteSection,
    swapScene,
  };
}
