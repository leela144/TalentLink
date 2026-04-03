
import Notification from '../models/Notification.js'
import asyncHandler from 'express-async-handler'

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20)

    // Count unread
    const unreadCount = await Notification.countDocuments({
        user: req.user._id,
        read: false
    })

    res.json({
        notifications,
        unreadCount
    })
})

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.user.role === 'admin' ? req.params.id : undefined)
        .where({ user: req.user._id, _id: req.params.id })

    // Simplify query to finding by ID and checking user
    const notif = await Notification.findById(req.params.id)

    if (!notif) {
        return res.status(404).json({ message: 'Notification not found' })
    }

    if (notif.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' })
    }

    notif.read = true
    await notif.save()
    res.json(notif)
})

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, read: false },
        { $set: { read: true } }
    )

    res.json({ message: 'All marked as read' })
})

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
    const notif = await Notification.findById(req.params.id)

    if (!notif) {
        return res.status(404).json({ message: 'Notification not found' })
    }

    if (notif.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' })
    }

    await notif.deleteOne()
    res.json({ message: 'Notification removed' })
})

export {
    getNotifications,
    markRead,
    markAllRead,
    deleteNotification
}
