
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
    getNotifications,
    markRead,
    markAllRead,
    deleteNotification
} from '../controllers/notificationController.js'

const router = express.Router()

router.use(protect)

router.get('/', getNotifications)
router.put('/:id/read', markRead)
router.put('/read-all', markAllRead)
router.delete('/:id', deleteNotification)

export default router
