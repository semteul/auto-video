//

interface VideoEditorToolbarProps {
  onAddMediaSegment: () => void;
  onAddEditingInterval: () => void;
}

export default function VideoEditorToolbar({ onAddMediaSegment, onAddEditingInterval }: VideoEditorToolbarProps) {
  return (
    <div className="flex mb-4">
      <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={onAddMediaSegment}>+ MediaSegment</button>
      <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={onAddEditingInterval}>+ EditingInterval</button>
    </div>
  );
}
