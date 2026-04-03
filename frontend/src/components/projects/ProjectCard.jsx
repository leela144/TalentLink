// src/components/projects/ProjectCard.jsx
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { projectAPI, chatAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import moment from 'moment'
import {
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiMessageSquare,
  FiClock,
  FiArrowRight,
  FiBriefcase
} from 'react-icons/fi'

const ProjectCard = ({ project, userRole, onUpdate }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)

  const handleDelete = async (e) => {
    e.preventDefault() // Prevent navigation
    if (!window.confirm('Are you sure you want to delete this project?')) return

    setLoading(true)
    try {
      await projectAPI.delete(project._id)
      toast.success('Project deleted successfully')
      onUpdate?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (e) => {
    e.preventDefault() // Prevent navigation
    if (!project.client?._id) {
      toast.error('Cannot start chat: Client information missing')
      return
    }

    if (project.client?._id === user?._id) {
      toast.info('Cannot chat with yourself')
      return
    }

    setChatLoading(true)
    try {
      await chatAPI.accessChat(project.client._id)
      toast.success('Chat started! Redirecting to messages...')
      setTimeout(() => {
        window.location.href = '/chat'
      }, 1000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start chat')
    } finally {
      setChatLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:border-blue-200 transition-all duration-300 h-full flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <span className="font-bold text-xl">
                {project.title?.charAt(0).toUpperCase() || <FiBriefcase />}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-gray-900 truncate hover:text-blue-600 transition-colors">
                <Link to={`/projects/${project._id}`}>
                  {project.title}
                </Link>
              </h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <FiClock className="w-3.5 h-3.5 mr-1" />
                <span>Posted {moment(project.createdAt).fromNow()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </span>

            {/* Action Buttons for Client */}
            {userRole === 'client' && project.client?._id === user?._id && (
              <div className="flex space-x-1">
                <Link
                  to={`/projects/${project._id}/edit`}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Project"
                >
                  <FiEdit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Project"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
          {project.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center text-gray-500 text-xs mb-1">
              <FiDollarSign className="w-3.5 h-3.5 mr-1" />
              <span>Budget</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">
              ₹{project.budget?.toLocaleString() || '0'}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center text-gray-500 text-xs mb-1">
              <FiCalendar className="w-3.5 h-3.5 mr-1" />
              <span>Duration</span>
            </div>
            <div className="font-bold text-gray-900 text-sm truncate">
              {project.duration || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-1.5">
            {project.requiredSkills?.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100"
              >
                {skill}
              </span>
            ))}
            {project.requiredSkills?.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100">
                +{project.requiredSkills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 mt-auto">
          {userRole === 'freelancer' && project.client?._id && project.client?._id !== user?._id ? (
            <div className="flex gap-2 w-full">
              <Link
                to={`/projects/${project._id}`}
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center justify-center shadow-lg shadow-blue-200"
              >
                Apply Now
              </Link>
              <button
                onClick={handleStartChat}
                disabled={chatLoading}
                className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Chat with Client"
              >
                <FiMessageSquare className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to={`/projects/${project._id}`}
              className="w-full bg-gray-50 text-gray-900 py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors text-sm font-semibold flex items-center justify-center border border-gray-200 group"
            >
              View Details
              <FiArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard