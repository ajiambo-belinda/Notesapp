import mongoose from 'mongoose'
import Note from '../models/Note.js'

const isValidId = (id) => mongoose.isValidObjectId(id)

const handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((e) => e.message)
      .join(', ')
    return res.status(400).json({ message })
  }

  console.error(error)
  return res.status(500).json({ message: 'Server error' })
}

// GET /api/notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 })
    res.json(notes)
  } catch (error) {
    handleError(res, error)
  }
}

// POST /api/notes
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body
    const note = await Note.create({ title, content })
    res.status(201).json(note)
  } catch (error) {
    handleError(res, error)
  }
}

// PUT /api/notes/:id
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note id' })
    }

    const updates = {}
    if (req.body.title !== undefined) updates.title = req.body.title
    if (req.body.content !== undefined) updates.content = req.body.content

    const note = await Note.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    })

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json(note)
  } catch (error) {
    handleError(res, error)
  }
}

// PATCH /api/notes/:id/favourite
export const toggleFavourite = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note id' })
    }

    const note = await Note.findById(id)
    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    note.favourite = !note.favourite
    await note.save()

    res.json(note)
  } catch (error) {
    handleError(res, error)
  }
}

// PATCH /api/notes/:id/trash
export const trashNote = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note id' })
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { returnDocument: 'after' },
    )

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json(note)
  } catch (error) {
    handleError(res, error)
  }
}

// PATCH /api/notes/:id/restore
export const restoreNote = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note id' })
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { deletedAt: null },
      { returnDocument: 'after' },
    )

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json(note)
  } catch (error) {
    handleError(res, error)
  }
}

// DELETE /api/notes/:id
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note id' })
    }

    const note = await Note.findByIdAndDelete(id)

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json({ message: 'Note deleted', id })
  } catch (error) {
    handleError(res, error)
  }
}