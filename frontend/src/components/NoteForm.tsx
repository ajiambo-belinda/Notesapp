import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './NoteForm.css'

type NoteFormProps = {
  onAdd: (title: string, content: string) => void
}

const NoteForm = ({ onAdd }: NoteFormProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!title.trim()) {
      titleRef.current?.focus()
      return
    }

    onAdd(title.trim(), content.trim())
    setTitle('')
    setContent('')
    titleRef.current?.focus()
  }

  return (
    <form className="note-form glass" onSubmit={handleSubmit}>
      <h2>New note</h2>

      <input
        ref={titleRef}
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Write your note..."
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button type="submit" className="primary-btn">
        Add note
      </button>
    </form>
  )
}

export default NoteForm