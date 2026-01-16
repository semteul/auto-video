export interface VideoScript {
  id: string;
  title: string;
  sectionIds: string[];
}


export interface Section {
  id: string;
  isGenerated: boolean;
  words: Word[];
  delay: number;
}


export interface Word {
  text: string;
  displayedText: string;
  isCaptionSplitted: boolean;
  start: number;
}

export function buildSSMLText(words: Word[]): string {
  const markedText = words.map((word, index) => [
    `<mark name="s${index}"/>`,
    word.text,
    `<mark name="e${index}"/>`,
  ]);

  const ssml = `<speak>${markedText.join("")}</speak>`;
  return ssml;
}

export function parseSSMLText(ssml: string): Word[] {
  const markRegex = /<mark name="(s|e)(\d+)"\/>/g;
  const parts = ssml.split(markRegex).filter((part) => part.trim() !== "");
  const words: Word[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    const text = parts[i + 1];  // actual word text
    // const endMark = parts[i + 2]; 

    words.push({
      text,
      displayedText: text,
      isCaptionSplitted: false,
      start: 0,
    });
  }
  return words;
}