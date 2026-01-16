import { useEffect, useState } from "react";
import { getProjects } from "../lib/project";
import type { ProjectResponse } from "../lib/types";
import { Link } from "react-router-dom";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  
  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);  
  }, []);
  
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="w-[300px] mx-auto">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-300 rounded p-4 mb-4">
            <Link to={`/project/${project.id}`} className="text-lg font-semibold">{project.title}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}