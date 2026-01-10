import { useDropzone } from "react-dropzone";
import { useIsGlobalDragging } from "./useIsGlobalDragging";

interface UploadFormProps {
  onDrop: (files: File[]) => void;
}

export default function UploadForm({ onDrop }: UploadFormProps) {
  const isGlobalDragging = useIsGlobalDragging();

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    accept: { "image/*": [] },
    onDrop,
  });

  return (
    <div className="relative w-full">
      <div
        className={`${isGlobalDragging ? "fixed top-0 left-0 w-screen h-svh bg-black/50" : ""}`}
        {...getRootProps()}>
        <input {...getInputProps()} />

      </div>

      <button
        onClick={open}
        className="bg-blue-500 text-white rounded px-3 py-1 cursor-pointer w-full">
        Browse files
      </button>
    </div>
  );
}
