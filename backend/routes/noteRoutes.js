import { Router } from 'express'
import {
  getNotes,
  createNote,
  updateNote,
  toggleFavourite,
  trashNote,
  restoreNote,
  deleteNote,
} from '../controllers/noteController.js'

const router = Router()

router.route('/').get(getNotes).post(createNote)

router.patch('/:id/favourite', toggleFavourite)
router.patch('/:id/trash', trashNote)
router.patch('/:id/restore', restoreNote)

router.route('/:id').put(updateNote).delete(deleteNote)

export default router