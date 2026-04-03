import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiCheck, FiTrash2, FiClock, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import API from '../../services/api'
import moment from 'moment'

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000) // Poll every minute
        return () => clearInterval(interval)
    }, [])

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications')
            setNotifications(data.notifications || [])
            setUnreadCount(data.unreadCount || 0)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const markAsRead = async (id, e) => {
        e?.stopPropagation()
        try {
            await API.put(`/notifications/${id}/read`)
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const markAllRead = async () => {
        try {
            await API.put('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all read:', error)
        }
    }

    const deleteNotification = async (id, e) => {
        e?.stopPropagation()
        try {
            await API.delete(`/notifications/${id}`)
            setNotifications(prev => prev.filter(n => n._id !== id))
            // Update unread count if deleted notification was unread
            const wasUnread = notifications.find(n => n._id === id)?.read === false
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    const getLink = (notification) => {
        switch (notification.type) {
            case 'proposal':
                return `/projects/${notification.relatedId?.projectId || notification.relatedId}`
            case 'contract':
                return `/contracts` // Redirect to main contracts page as relatedId might be tricky
            case 'message':
                return '/chat'
            default:
                return '#'
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
            >
                <FiBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 w-80 md:w-96 mt-3 origin-top-right bg-white divide-y divide-gray-100 rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100">
                    <div className="px-4 py-3 flex justify-between items-center bg-gray-50/50">
                        <span className="font-bold text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center bg-blue-50 px-2 py-1 rounded-lg"
                            >
                                <FiCheckCircle className="mr-1" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-[400px]">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-400">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                    <FiBell className="text-xl" />
                                </div>
                                <p className="text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`group block hover:bg-gray-50 transition-all ${!notification.read ? 'bg-blue-50/40' : 'bg-white'
                                            }`}
                                    >
                                        <div className="flex p-4">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <Link
                                                    to={getLink(notification)}
                                                    onClick={() => {
                                                        setIsOpen(false)
                                                        if (!notification.read) markAsRead(notification._id)
                                                    }}
                                                    className="block"
                                                >
                                                    <p className={`text-sm mb-0.5 ${!notification.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center mt-2 text-xs text-gray-400">
                                                        <FiClock className="mr-1" />
                                                        {moment(notification.createdAt).fromNow()}
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => markAsRead(notification._id, e)}
                                                        className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <FiCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => deleteNotification(notification._id, e)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <Link
                            to="/notifications"
                            className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationDropdown
