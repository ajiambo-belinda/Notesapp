import type { Note } from '../types'
import NoteCard from './NoteCard'
import './NoteList.css'

type NoteListProps = {
  notes: Note[]
  emptyMessage: string
  onTrash: (id: string) => void
  onRestore: (id: string) => void
  onDeleteForever: (id: string) => void
  onUpdate: (id: string, title: string, content: string) => void
  onToggleFavourite: (id: string) => void
}

const NoteList = ({
  notes,
  emptyMessage,
  onTrash,
  onRestore,
  onDeleteForever,
  onUpdate,
  onToggleFavourite,
}: NoteListProps) => {
  if (notes.length === 0) {
    return <div className="note-list-empty glass">{emptyMessage}</div>
  }

  return (
    <section className="note-list">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onTrash={onTrash}
          onRestore={onRestore}
          onDeleteForever={onDeleteForever}
          onUpdate={onUpdate}
          onToggleFavourite={onToggleFavourite}
        />
      ))}
    </section>
  )
}

export default NoteList