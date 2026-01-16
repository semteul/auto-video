import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import ProjectsPage from './pages/ProjectsPage'
import EditorPage from './pages/EditorPage'
import CrdtTestExample from './crdt-test/CrdtTestExample';

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
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/projects">
              프로젝트 목록
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/editor">
              에디터
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/video-editor">
              영상 리스트
            </Link>
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/crdt-test">
              CRDT 테스트
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project/:projectId" element={<EditorPage />} />
          <Route path="/crdt-test" element={<CrdtTestExample />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
