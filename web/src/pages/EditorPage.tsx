import { useEffect, useState } from "react";
import { createVideoScript, generateSection, getVideoScript, downloadScriptAudio, downloadScriptSrt } from "../lib/tts";
import Section from "../editor/Section";
import type { VideoScript } from "../editor/ssml";


function EditorPage() {
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);

  useEffect(() => {
    if (!videoScript) {
      createVideoScript().then((script) => {
        setVideoScript(script);
      });
    }
  }, [videoScript]);

  function appendSection() {
    if (!videoScript) return;
    generateSection(videoScript.id).then(() => {
      getVideoScript(videoScript.id).then((updatedScript) => {
        setVideoScript(updatedScript);
      });
    });
  }

  function downloadMp3() {
    if (!videoScript) return;
    downloadScriptAudio(videoScript.id).catch((err) => {
      console.error(err);
      window.alert("Failed to download MP3");
    });
  }

  function downloadSrt() {
    if (!videoScript) return;
    downloadScriptSrt(videoScript.id).catch((err) => {
      console.error(err);
      window.alert("Failed to download SRT");
    });
  }

  if (!videoScript) {
    return <div>Generating video script...</div>;
  }
  
  return (
    <div className="w-full">
      <button onClick={downloadMp3} className="cursor-pointer rounded bg-green-500 p-2 text-white mb-10 mr-4">Download MP3</button>
      <button onClick={downloadSrt} className="cursor-pointer rounded bg-emerald-500 p-2 text-white mb-10 mr-4">Download SRT</button>
      <button onClick={appendSection} className="cursor-pointer rounded bg-blue-500 p-2 text-white mb-10">Add Section</button>
      <div className="w-full flex flex-col">
        {
          videoScript && videoScript.sectionIds.map((sectionId) => (
            <Section
              key={sectionId}
              scriptId={videoScript.id}
              sectionId={sectionId}
            />
          ))
        }
      </div>
    </div>
  )
}

export default EditorPage
