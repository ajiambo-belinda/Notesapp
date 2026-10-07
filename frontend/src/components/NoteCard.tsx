import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Check, Pencil, RotateCcw, Star, Trash2, X } from 'lucide-react'
import type { Note } from '../types'
import './NoteCard.css'

type NoteCardProps = {
  note: Note
  onTrash: (id: string) => void
  onRestore: (id: string) => void
  onDeleteForever: (id: string) => void
  onUpdate: (id: string, title: string, content: string) => void
  onToggleFavourite: (id: string) => void
}

const NoteCard = ({
  note,
  onTrash,
  onRestore,
  onDeleteForever,
  onUpdate,
  onToggleFavourite,
}: NoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      titleRef.current?.focus()
    }
  }, [isEditing])

  const startEditing = () => {
    setTitle(note.title)
    setContent(note.content)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!title.trim()) {
      titleRef.current?.focus()
      return
    }

    onUpdate(note.id, title.trim(), content.trim())
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  const handleDeleteForever = () => {
    if (window.confirm(`Delete "${note.title}" forever? This cannot be undone.`)) {
      onDeleteForever(note.id)
    }
  }

  if (note.deletedAt) {
    return (
      <article className="note-card note-card--trashed glass">
        <h3 className="note-card-title">{note.title}</h3>

        <time className="note-card-date" dateTime={note.deletedAt}>
          Deleted {new Date(note.deletedAt).toLocaleDateString()}
        </time>

        {note.content && <p className="note-card-content">{note.content}</p>}

        <div className="note-card-actions">
          <button
            type="button"
            className="icon-btn icon-btn--restore"
            onClick={() => onRestore(note.id)}
            aria-label="Restore note"
            title="Restore note"
          >
            <RotateCcw size={18} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--delete"
            onClick={handleDeleteForever}
            aria-label="Delete note forever"
            title="Delete forever"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </article>
    )
  }

  if (isEditing) {
    return (
      <form
        className="note-card note-card--editing glass"
        onSubmit={handleSave}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={titleRef}
          className="note-edit-field"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="note-edit-field"
          placeholder="Write your note..."
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="note-card-actions">
          <button
            type="button"
            className="icon-btn icon-btn--cancel"
            onClick={cancelEditing}
            aria-label="Cancel editing"
            title="Cancel (Esc)"
          >
            <X size={18} />
          </button>
          <button
            type="submit"
            className="icon-btn icon-btn--save"
            aria-label="Save changes"
            title="Save"
          >
            <Check size={18} />
          </button>
        </div>
      </form>
    )
  }

  return (
    <article className="note-card glass">
      <h3 className="note-card-title">{note.title}</h3>

      <time className="note-card-date" dateTime={note.createdAt}>
        {new Date(note.createdAt).toLocaleDateString()}
      </time>

      {note.content && <p className="note-card-content">{note.content}</p>}

      <div className="note-card-actions">
        <button
          type="button"
          className={`icon-btn icon-btn--fav ${note.favourite ? 'icon-btn--fav-active' : ''}`}
          onClick={() => onToggleFavourite(note.id)}
          aria-label={note.favourite ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={note.favourite}
          title={note.favourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Star size={18} fill={note.favourite ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--edit"
          onClick={startEditing}
          aria-label="Edit note"
          title="Edit note"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--delete"
          onClick={() => onTrash(note.id)}
          aria-label="Move note to trash"
          title="Move to trash"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  )
}

export default NoteCard