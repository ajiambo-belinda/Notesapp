import type { Note } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export const fetchNotes = () => request<Note[]>('/notes')

export const createNote = (title: string, content: string) =>
  request<Note>('/notes', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  })

export const updateNote = (id: string, title: string, content: string) =>
  request<Note>(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content }),
  })

export const toggleFavouriteNote = (id: string) =>
  request<Note>(`/notes/${id}/favourite`, { method: 'PATCH' })

export const trashNote = (id: string) =>
  request<Note>(`/notes/${id}/trash`, { method: 'PATCH' })

export const restoreNote = (id: string) =>
  request<Note>(`/notes/${id}/restore`, { method: 'PATCH' })

export const deleteNoteForever = (id: string) =>
  request<{ message: string; id: string }>(`/notes/${id}`, { method: 'DELETE' })