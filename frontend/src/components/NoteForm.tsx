import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './NoteForm.css'

type NoteFormProps = {
  onAdd: (title: string, content: string) => Promise<boolean>
}

const NoteForm = ({ onAdd }: NoteFormProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (saving) return

    if (!title.trim()) {
      titleRef.current?.focus()
      return
    }

    setSaving(true)
    const added = await onAdd(title.trim(), content.trim())
    setSaving(false)

    if (added) {
      setTitle('')
      setContent('')
    }

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

      <button type="submit" className="primary-btn" disabled={saving}>
        {saving ? 'Adding...' : 'Add note'}
      </button>
    </form>
  )
}

export default NoteForm