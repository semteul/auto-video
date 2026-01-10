import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import EditorPage from './pages/EditorPage'
import MainPage from './pages/MainPage'
import VideoEditor from './pages/VideoEditorPage'

function HomePage() {
  return <h1>홈</h1>
}

function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 text-white bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold tracking-wide text-sky-400">
            auto-video
          </span>
          <nav className="flex gap-3 text-sm">
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/">
              홈
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/main">
              메인
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/editor">
              에디터
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/video-editor">
              영상 리스트
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/login">
              로그인
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/video-editor" element={<VideoEditor />} />
          <Route path="/main" element={<MainPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
