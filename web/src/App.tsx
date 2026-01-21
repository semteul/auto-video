import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import CrdtTestExample from './crdt-test/CrdtTestExample'

function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 text-white bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold tracking-wide text-sky-400">
            auto-video
          </span>
          <nav className="flex gap-3 text-sm">
            <Link className="rounded px-2 py-1 hover:bg-slate-800" to="/crdt-test">
              CRDT 테스트
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <Routes>
          <Route path="/crdt-test" element={<CrdtTestExample />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
