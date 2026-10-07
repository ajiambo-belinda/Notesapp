import { useEffect, useState } from 'react'
import NoteForm from './components/NoteForm'
import NoteList from './components/NoteList'
import Sidebar from './components/sidebar/Sidebar'
import type { Note, Theme, View } from './types'

const STORAGE_KEY = 'notes-app:notes'
const THEME_KEY = 'notes-theme'

const loadNotes = (): Note[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    // Notes saved by earlier versions may be missing the newer fields.
    return parsed.map((note) => ({
      ...note,
      favourite: Boolean(note.favourite),
      deletedAt: typeof note.deletedAt === 'string' ? note.deletedAt : null,
    })) as Note[]
  } catch {
    return []
  }
}

const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage blocked: fall back to the system preference below.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const emptyMessages: Record<View, string> = {
  all: 'No notes yet. Add your first note.',
  favourites: 'No favourites yet. Tap the star on a note to add it here.',
  trash: 'Trash is empty.',
}

const App = () => {
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [view, setView] = useState<View>('all')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // Storage can be full or blocked; the app keeps working without it.
    }
  }, [notes])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Ignore storage errors.
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  const handleAdd = (title: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date().toISOString(),
      favourite: false,
      deletedAt: null,
    }
    setNotes((prev) => [newNote, ...prev])
    // Show the full list so the new note is visible whichever view you were in.
    setView('all')
  }

  const handleUpdate = (id: string, title: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, title, content } : note)),
    )
  }

  const handleToggleFavourite = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, favourite: !note.favourite } : note,
      ),
    )
  }

  const handleTrash = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, deletedAt: new Date().toISOString() } : note,
      ),
    )
  }

  const handleRestore = (id: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, deletedAt: null } : note)),
    )
  }

  const handleDeleteForever = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const activeNotes = notes.filter((note) => note.deletedAt === null)

  const handleExport = () => {
    const data = JSON.stringify(activeNotes, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `notes-${new Date().toISOString().slice(0, 10)}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  const visibleNotes = notes.filter((note) => {
    if (view === 'trash') return note.deletedAt !== null
    if (note.deletedAt !== null) return false
    return view === 'favourites' ? note.favourite : true
  })

  return (
    <div className="app-container">
      <Sidebar
        theme={theme}
        onToggleTheme={toggleTheme}
        view={view}
        onChangeView={setView}
        onExport={handleExport}
        canExport={activeNotes.length > 0}
      />
      <NoteForm onAdd={handleAdd} />
      <NoteList
        notes={visibleNotes}
        emptyMessage={emptyMessages[view]}
        onTrash={handleTrash}
        onRestore={handleRestore}
        onDeleteForever={handleDeleteForever}
        onUpdate={handleUpdate}
        onToggleFavourite={handleToggleFavourite}
      />
    </div>
  )
}

export default App