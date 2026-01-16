// import { MediaPool } from "../uploader/MediaPool";
import { useParams } from "react-router-dom";
import ProjectEditor from "../editor/ProjectEditor";

export default function EditorPage() {
  const { projectId } = useParams();
  if (!projectId) {
    return <div>프로젝트 ID가 없습니다.</div>;
  }
  
  return (
    <div>
      <ProjectEditor id={projectId} />
    </div>
  );
}

