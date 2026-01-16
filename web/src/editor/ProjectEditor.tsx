import { SpeechSectionComponent, BlankSectionComponent } from "./SectionComponent";
import { useProject } from "../lib/editor/useProject";
import type { BlankSection, SpeechSection } from "../lib/editor/types";
import SceneComponent from "./SceneComponent";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DragEndEvent } from '@dnd-kit/core';

export default function ProjectEditor({ id }: { id: string }) {
  const {
    project,
    // setProject,
    sections,
    scenes,
    createSection,
    createSectionNextTo,
    createSectionPrevTo,
    resizeScene,
    swapScene,
    updateDuration,
    updateSpeechSection,
    createScene,
    createSceneNextTo,
    createScenePrevTo,
    deleteScene,
    deleteSection,
  } = useProject(id);

  const handleSceneDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = scenes.findIndex(seg => seg.sceneId === active.id);
      const newIndex = scenes.findIndex(seg => seg.sceneId === over.id);
      arrayMove(scenes, oldIndex, newIndex);
      swapScene(active.id as string, over.id as string);
    }
  }
  const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

  const intervalHeight = 150;

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Project Section List (Test)</h2>
      <h3>프로젝트 이름 : {project.title}</h3>
      <div className="flex flex-row">
        <ul className="flex-1">
          {sections.map((section) => (
            <li key={section.id} className="p-0 m-0">
              {section.type === "speech" ? (
                <SpeechSectionComponent
                  section={section as SpeechSection}
                  intervalHeight={intervalHeight}
                  updateSpeechSection={updateSpeechSection}
                  createSectionNextTo={createSectionNextTo}
                  createSectionPrevTo={createSectionPrevTo} 
                  deleteSection={deleteSection} />
              ) : (
                <BlankSectionComponent
                  section={section as BlankSection}
                  intervalHeight={intervalHeight}
                  updateDuration={updateDuration}
                  createSectionNextTo={createSectionNextTo}
                  createSectionPrevTo={createSectionPrevTo} 
                  deleteSection={deleteSection} />
              )}
            </li>
          ))}
          {sections.length === 0 && (
            <div className="w-full h-full flex items-center justify-center">
              <button
                className="bg-gray-200 rounded-xl text-gray-500 text-sm cursor-pointer m-20 w-full h-full"
                onClick={() => createSection("speech")}>
                Create a Section
              </button>
            </div>
          )}
        </ul>
        <div className="flex-1">

          <DndContext onDragEnd={handleSceneDragEnd} sensors={sensors} collisionDetection={closestCenter} >
            <SortableContext items={scenes.map(s => s.sceneId)} strategy={verticalListSortingStrategy}>
              {scenes.map((scene) => (
                <SceneComponent
                  key={scene.sceneId}
                  scene={scene}
                  intervalHeight={intervalHeight}
                  resizeScene={resizeScene}
                  createSceneNextTo={createSceneNextTo}
                  createScenePrevTo={createScenePrevTo}
                  deleteScene={deleteScene} />
              ))}
            </SortableContext>
          </DndContext>
          {scenes.length === 0 && (
            <div className="w-full h-full flex items-center justify-center">
              <button 
                className="bg-gray-200 rounded-xl text-gray-500 text-sm cursor-pointer m-20 w-full h-full"
                onClick={() => createScene()}>
                Create a Scene
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}