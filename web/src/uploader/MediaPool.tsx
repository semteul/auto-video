/**
 * Drag & Drop Media Pool Component
 */

import { useState } from "react";
import UploadForm from "./UploadForm";
import { getMediaUrl, uploadMedia } from "../lib/media";

interface FileDetails {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedUrl?: string;
}

export function MediaPool({ projectId }: { projectId: string }) {
  const [medium, setMedium] = useState<FileDetails[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const onDrop = (files: File[]) => {
    const fileDetails: FileDetails[] = files.map((file) =>
    ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    
    // Upload Medium
    files.forEach(async (file, index) => {
      try {
        const id = await uploadMedia(projectId, file);
        const url = await getMediaUrl(projectId, id);
        setMedium((prev) => {
          const newMedium = [...prev];
          newMedium[prev.length - files.length + index].uploadedUrl = url;
          return newMedium;
        });
      } catch (error) {
        setMedium((prev) => {
          const newMedium = [...prev];
          newMedium[prev.length - files.length + index].uploadedUrl = undefined;
          return newMedium.filter(item => item.uploadedUrl !== undefined);
        });
        console.error("Error uploading file:", error);
      }
    });

    setMedium((prev) => [...prev, ...fileDetails]);
  };

  return (
    <div className="fixed top-0 left-0">
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-5 left-5 bg-blue-500 text-white rounded px-3 py-1 m-3 cursor-pointer">
        Open Media Pool
      </button>
      <div className={`fixed top-0 left-0 w-100 flex flex-row items-center justify-center ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div
          className={`flex-1 h-svh flex flex-col shadow-lg bg-gray-50 z-50`}>
          <div className="relative w-full text-center mt-5 flex flex-row items-center bg-gray-50 shadow-lg pb-5">
            <div className="w-full text-center">
              <h2 className="text-sm text-gray-500">Media Pool</h2>
            </div>
          </div>
          <div className="flex flex-col w-full mt-2 bg-gray-100 flex-1 px-3 overflow-y-scroll gap-2 direction-rtl">
            {medium.map((file, i) => (
              <div
                className="w-full flex flex-row h-25 gap-2 bg-gray-200 px-2 py-2 rounded cursor-pointer"
                key={i}>
                <div className="relative">
                  <img
                    src={file.url}
                    width={120}
                    className="rounded h-full aspect-square object-contain bg-white"
                    alt=""
                  />
                  {!file.uploadedUrl && (<div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/50 text-white z-50 text-sm`}>
                    Uploading...
                  </div>)}
                </div>
                <div className="text-sm text-gray-500 text-start w-full flex flex-col gap-1">
                  <div><strong>{file.name}</strong></div>
                  <div><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</div>
                  <div><strong>Type:</strong> {file.type}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full px-3 pb-3 pt-3 shadow-lg bg-gray-50">
            <UploadForm onDrop={onDrop} />
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute w-10 h-10 text-gray-500 cursor-pointer text-2xl bg-white shadow-2xl border border-gray-500 -right-5">
          {"<"}
        </button>
      </div>
    </div>
  );
}