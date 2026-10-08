import { useEffect, useState } from 'react'
import NoteForm from './components/NoteForm'
import NoteList from './components/NoteList'
import Sidebar from './components/sidebar/Sidebar'
import * as api from './api'
import type { Note, Theme, View } from './types'

const STORAGE_KEY = 'notes-app:notes'
const THEME_KEY = 'notes-theme'

const loadCachedNotes = (): Note[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

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
  const [notes, setNotes] = useState<Note[]>(loadCachedNotes)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [view, setView] = useState<View>('all')
  const [offline, setOffline] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reload the list from the server, which is the source of truth.
  const resync = async () => {
    try {
      setNotes(await api.fetchNotes())
      setOffline(false)
    } catch {
      setOffline(true)
    }
  }

  useEffect(() => {
    let cancelled = false

    api
      .fetchNotes()
      .then((serverNotes) => {
        if (!cancelled) {
          setNotes(serverNotes)
          setOffline(false)
        }
      })
      .catch(() => {
        if (!cancelled) setOffline(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

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

  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(timer)
  }, [error])

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  // Run a server call in the background. If it fails, show a message and
  // reload the list so the screen matches what the server really has.
  const syncWithServer = async (call: () => Promise<unknown>, message: string) => {
    try {
      await call()
    } catch {
      setError(message)
      await resync()
    }
  }

  const handleAdd = async (title: string, content: string): Promise<boolean> => {
    try {
      const created = await api.createNote(title, content)
      setNotes((prev) => [created, ...prev])
      setOffline(false)
      setView('all')
      return true
    } catch {
      setError('Could not add the note. Is the server running?')
      return false
    }
  }

  const handleUpdate = (id: string, title: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, title, content } : note)),
    )
    void syncWithServer(() => api.updateNote(id, title, content), 'Could not save your changes.')
  }

  const handleToggleFavourite = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, favourite: !note.favourite } : note,
      ),
    )
    void syncWithServer(() => api.toggleFavouriteNote(id), 'Could not update the favourite.')
  }

  const handleTrash = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, deletedAt: new Date().toISOString() } : note,
      ),
    )
    void syncWithServer(() => api.trashNote(id), 'Could not move the note to trash.')
  }

  const handleRestore = (id: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, deletedAt: null } : note)),
    )
    void syncWithServer(() => api.restoreNote(id), 'Could not restore the note.')
  }

  const handleDeleteForever = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    void syncWithServer(() => api.deleteNoteForever(id), 'Could not delete the note.')
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
        emptyMessage={
          offline ? 'Server unreachable. Start the backend and reload.' : emptyMessages[view]
        }
        onTrash={handleTrash}
        onRestore={handleRestore}
        onDeleteForever={handleDeleteForever}
        onUpdate={handleUpdate}
        onToggleFavourite={handleToggleFavourite}
      />
      {error && (
        <div className="toast" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export default App