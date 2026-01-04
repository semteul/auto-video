import { useState } from 'react'

type SubtitleItem = {
  id: number
  start: string
  end: string
  text: string
}

function EditorPage() {
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([
    { id: 1, start: '00:00:00.000', end: '00:00:03.000', text: '' },
  ])

  const handleChange = (id: number, field: keyof SubtitleItem, value: string) => {
    setSubtitles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  const addSubtitle = () => {
    setSubtitles((prev) => {
      const last = prev[prev.length - 1]
      const nextId = (last?.id ?? 0) + 1
      return [
        ...prev,
        {
          id: nextId,
          start: last?.end ?? '00:00:00.000',
          end: last?.end ?? '00:00:00.000',
          text: '',
        },
      ]
    })
  }

  const removeSubtitle = (id: number) => {
    setSubtitles((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      <div className="flex-1 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-100">영상 프리뷰 (placeholder)</h2>
        <p className="text-xs text-slate-400">
          여기에 나중에 실제 영상 플레이어를 넣을 수 있어요.
        </p>
      </div>

      <div className="flex w-96 flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">자막 편집기</h2>
          <button
            type="button"
            onClick={addSubtitle}
            className="rounded bg-sky-600 px-2 py-1 text-xs font-medium text-white hover:bg-sky-500"
          >
            + 줄 추가
          </button>
        </div>

        <div className="mt-1 flex flex-1 flex-col gap-2 overflow-y-auto pr-1 text-xs">
          {subtitles.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 rounded-md border border-slate-800 bg-slate-900/80 p-2"
            >
              <div className="flex items-center gap-2">
                <span className="min-w-[20px] text-[11px] text-slate-500">#{item.id}</span>
                <input
                  type="text"
                  value={item.start}
                  onChange={(e) => handleChange(item.id, 'start', e.target.value)}
                  placeholder="시작 시간 00:00:00.000"
                  className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">→</span>
                <input
                  type="text"
                  value={item.end}
                  onChange={(e) => handleChange(item.id, 'end', e.target.value)}
                  placeholder="끝 시간 00:00:03.000"
                  className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSubtitle(item.id)}
                  className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-red-600 hover:text-white"
                >
                  X
                </button>
              </div>
              <textarea
                value={item.text}
                onChange={(e) => handleChange(item.id, 'text', e.target.value)}
                placeholder="자막 텍스트 입력"
                rows={2}
                className="min-h-[44px] resize-y rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[12px] text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EditorPage
