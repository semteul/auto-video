import type { Section, Word, VideoScript } from "../editor/ssml";

const serverUrl = import.meta.env.VITE_SERVER_API_URL ?? "http://localhost:8000";

// --- API response shapes (snake_case from backend) ---
interface ApiWord {
  text: string;
  displayed_text: string;
  is_caption_splitted: boolean;
  start: number;
}

interface ApiSection {
  id: string;
  is_generated: boolean;
  words: ApiWord[];
  delay: number;
}

interface ApiVideoScript {
  id: string;
  title: string;
  section_ids: string[];
}

function isApiWord(value: unknown): value is ApiWord {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.text === "string" &&
    typeof v.displayed_text === "string" &&
    typeof v.is_caption_splitted === "boolean" &&
    (typeof v.start === "number")
  );
}

function isApiSection(value: unknown): value is ApiSection {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  if (typeof v.id !== "string" || typeof v.is_generated !== "boolean" || typeof v.delay !== "number") {
    return false;
  }

  if (!Array.isArray(v.words)) return false;
  return v.words.every(isApiWord);
}

function isApiVideoScript(value: unknown): value is ApiVideoScript {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || typeof v.title !== "string") {
    return false;
  }
  if (!Array.isArray(v.section_ids)) return false;
  return v.section_ids.every((id) => typeof id === "string");
}


function isApiAudioUrlResponse(value: unknown): value is { url: string } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.url === "string";
}

function mapApiWordToWord(apiWord: ApiWord): Word {
  return {
    text: apiWord.text,
    displayedText: apiWord.displayed_text,
    isCaptionSplitted: apiWord.is_caption_splitted,
    start: apiWord.start,
  };
}

function mapApiSectionToSection(apiSection: ApiSection): Section {
  return {
    id: apiSection.id,
    isGenerated: apiSection.is_generated,
    words: apiSection.words.map(mapApiWordToWord),
    delay: apiSection.delay,
  };
}

function mapWordToApiWord(word: Word): ApiWord {
  return {
    text: word.text,
    displayed_text: word.displayedText,
    is_caption_splitted: word.isCaptionSplitted,
    start: word.start,
  };
}

function mapSectionToApiSection(section: Section): ApiSection {
  return {
    id: section.id,
    is_generated: section.isGenerated,
    words: section.words.map(mapWordToApiWord),
    delay: section.delay,
  };
}

function mapAPiVideoScriptToVideoScript(apiVideoScript: ApiVideoScript): VideoScript {
  return {
    id: apiVideoScript.id,
    title: apiVideoScript.title,
    sectionIds: apiVideoScript.section_ids,
  };
}

export async function getSection(scriptId: string, sectionId: string): Promise<Section> {
  const url = new URL(`/tts/scripts/${encodeURIComponent(scriptId)}/sections/${encodeURIComponent(sectionId)}`, serverUrl);

  const res = await fetch(url.toString(), {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch section: ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!isApiSection(data)) {
    throw new Error("Invalid section payload from server");
  }
  const apiSection = data;
  return mapApiSectionToSection(apiSection);
}

export async function generateSection(scriptId: string): Promise<Section> {
  const url = new URL(`/tts/scripts/${encodeURIComponent(scriptId)}/sections`, serverUrl);
  const res = await fetch(url.toString(), {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to post section: ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!isApiSection(data)) {
    throw new Error("Invalid section payload from server");
  }
  const apiSection = data;
  return mapApiSectionToSection(apiSection);
}

export async function updateSection(scriptId: string, section: Section): Promise<Section> {
  const url = new URL(`/tts/scripts/${encodeURIComponent(scriptId)}/sections/${encodeURIComponent(section.id)}`, serverUrl);
  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    
    body: JSON.stringify(mapSectionToApiSection(section)),
  });
  if (!res.ok) {
    throw new Error(`Failed to update section: ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!isApiSection(data)) {
    throw new Error("Invalid section payload from server");
  }
  const apiSection = data;
  return mapApiSectionToSection(apiSection);
}

export async function requestVoiceGenerate(
  scriptId: string,
  section: Section
): Promise<{ isSuccess: boolean; section: Section }> {
  const { id } = section;

  const url = new URL(
    `/tts/scripts/${encodeURIComponent(scriptId)}/sections/${encodeURIComponent(id)}/audio-generation`,
    serverUrl
  );

  const res = await fetch(url.toString(), {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`TTS generate failed: ${res.status}`);
  }

  const data: unknown = await res.json();
  if (!isApiSection(data)) {
    throw new Error("Invalid section payload from server");
  }
  const apiSection = data;
  const newSection = mapApiSectionToSection(apiSection);

  return {
    isSuccess: true,
    section: newSection,
  };
}

// export async function deleteSection(scriptId: string, id: string): Promise<boolean> {
//   // TODO implement
// }

export async function updateSectionWithAudio(scriptId: string, section: Section): Promise<Section> {
  const url = new URL(
    `/tts/scripts/${encodeURIComponent(scriptId)}/sections/${encodeURIComponent(section.id)}/actions/update-with-audio`,
    serverUrl
  );
  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(mapSectionToApiSection(section)),
  });

  if (!res.ok) {
    throw new Error(`Failed to update section: ${res.status}`);
  }

  const data: unknown = await res.json();

  if (!isApiSection(data)) {
    throw new Error("Invalid section payload from server");
  }

  const apiSection = data;
  return mapApiSectionToSection(apiSection);
}

export async function getAudioUrl(scriptId: string, sectionId: string): Promise<string> {
  const url = new URL(`/tts/scripts/${encodeURIComponent(scriptId)}/sections/${encodeURIComponent(sectionId)}/audio-url`, serverUrl);
  const res = await fetch(url.toString(), {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Failed to get audio URL: ${res.status}`);
  }
  const data: unknown = await res.json();
  console.log("data", data);

  if (!isApiAudioUrlResponse(data)) {
    throw new Error("Invalid audio URL payload from server");
  }
  console.log("data url", data.url);
  return data.url;
}

export async function createVideoScript(): Promise<VideoScript> {
  const url = new URL(`/tts/scripts`, serverUrl);
  const res = await fetch(url.toString(), {method: "POST"})
  if (!res.ok) {
    throw new Error(`Failed to create video script: ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!isApiVideoScript(data)) {
    throw new Error("Invalid video script payload from server");
  }
  const apiVideoScript = data;
  return mapAPiVideoScriptToVideoScript(apiVideoScript);
}

export async function getVideoScript(id: string): Promise<VideoScript> {
  const url = new URL(`/tts/scripts/${encodeURIComponent(id)}`, serverUrl);
  const res = await fetch(url.toString(), {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch video script: ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!isApiVideoScript(data)) {
    throw new Error("Invalid video script payload from server");
  }
  const apiVideoScript = data;
  return mapAPiVideoScriptToVideoScript(apiVideoScript);
}

export async function downloadScriptAudio(scriptId: string): Promise<void> {
  const url = new URL(
    `/tts/scripts/${encodeURIComponent(scriptId)}/audio`,
    serverUrl
  );

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to download script audio: ${res.status}`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${scriptId}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export async function downloadScriptSrt(scriptId: string): Promise<void> {
  const url = new URL(
    `/tts/scripts/${encodeURIComponent(scriptId)}/subtitles.srt`,
    serverUrl
  );

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to download script SRT: ${res.status}`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${scriptId}.srt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}
