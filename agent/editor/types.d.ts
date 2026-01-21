/**
 * Editor에 필요한 Type 정의
 */

/**
 * Section Draft의 생명주기
 *
 * 이미 생성된 GeneratedSection이 있는 상태
 * 1. 사용자가 편집버튼 클릭
 * 2. fe가 GeneratedSection의 id로 section draft 생성 전파 (이미 sectiondrafts에 존재하면 무시)
 * 3-a. 저장 버튼 -> be에서 sectiondraft를 바탕으로 GeneratedSection 수정
 * 3-b. 취소 버튼 -> sectiondraft 삭제 전파
 *
 * GeneratedSection이 없는 상태
 * 1. 사용자가 section 추가 버튼 클릭
 * 2. be가 GeneratedSection 생성 후 전파
 */

// FE에서만 쓰는 타입들
export interface Project {
	title: string;
	sections: Map<string, GeneratedSection>;
	sectionDrafts: Map<string, SectionDraft>;
	scenes: Map<string, Scene>;
	media: Map<string, Media>;
	sectionOrder: string[];
	mediaOrder: string[];
	sceneOrder: string[];
}

export interface SectionDraft {
	duration: number;
	type: "speech" | "break";
	intervalOrder: string[];
	intervals: Map<string, Interval>;
}

export interface GeneratedSection {
	type: "speech" | "break";
	duration: number;
	speechDuration: number;
	speechGeneratedStatus?: "pending" | "completed" | "failed";
	intervalOrder: string[];
	intervals: Map<string, Interval>;
}

export interface Interval {
	words: Word[];
}

export interface Word {
	text: string;
	displayedText: string;
	isCaptionSplitted: boolean;
	start: number;
}

export interface Media {
	status: "uploading" | "uploaded" | "failed";
	fileId: string;
	name: string;
	contentType: string;
	size: number;
}

export interface Scene {
	mediaId: string | null;
	intervalCount: number;
}
