// src/components/chat/ChatNotification.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMessageSquare, FiX } from 'react-icons/fi'

const ChatNotification = ({ freelancerName, projectTitle, onClose }) => {
  const [visible, setVisible] = useState(true)

  const handleClose = () => {
    setVisible(false)
    onClose?.()
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <FiMessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Chat Started!</h3>
              <p className="text-sm text-gray-600 mt-1">You can now chat with {freelancerName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-sm text-gray-700 mb-4">
          <p>Project: <span className="font-medium">{projectTitle}</span></p>
          <p className="mt-1">Start discussing project details and timelines.</p>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to="/chat"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
          >
            Go to Chat
          </Link>
          <button
            onClick={handleClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatNotification