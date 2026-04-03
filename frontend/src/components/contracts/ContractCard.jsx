// src/components/contracts/ContractCard.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contractAPI, chatAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import {
  FiCalendar, FiDollarSign, FiUser,
  FiCheckCircle, FiXCircle, FiClock, FiMessageSquare,
  FiAlertCircle, FiUsers, FiFileText, FiEye,
  FiBriefcase, FiMoreVertical
} from 'react-icons/fi'

const ContractCard = ({ contract, userRole, onUpdate }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <FiCheckCircle className="w-4 h-4" />,
        bgColor: 'bg-white',
        borderColor: 'border-green-200',
        accentColor: 'text-green-600'
      },
      completed: {
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: <FiCheckCircle className="w-4 h-4" />,
        bgColor: 'bg-white',
        borderColor: 'border-purple-200',
        accentColor: 'text-purple-600'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <FiClock className="w-4 h-4" />,
        bgColor: 'bg-white',
        borderColor: 'border-yellow-200',
        accentColor: 'text-yellow-600'
      },
      cancelled: {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <FiXCircle className="w-4 h-4" />,
        bgColor: 'bg-white',
        borderColor: 'border-red-200',
        accentColor: 'text-red-600'
      },
      draft: {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <FiFileText className="w-4 h-4" />,
        bgColor: 'bg-white',
        borderColor: 'border-gray-200',
        accentColor: 'text-gray-600'
      }
    }
    return configs[status] || configs.draft
  }

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Not set'

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0)

  const handleAcceptContract = async () => {
    if (!window.confirm('Are you sure you want to accept this contract? Once accepted, the contract will become active if both parties have accepted.')) return

    setLoading(true)
    try {
      const response = await contractAPI.acceptContract(contract._id)
      toast.success(response.data?.message || 'Contract accepted successfully')
      onUpdate?.()
    } catch (error) {
      console.error('Failed to accept contract:', error)
      toast.error(error.response?.data?.message || 'Failed to accept contract')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status) => {
    if (!window.confirm(`Are you sure you want to mark this contract as ${status}?`)) return

    setLoading(true)
    try {
      await contractAPI.updateStatus(contract._id, status)
      toast.success(`Contract marked as ${status}`)
      onUpdate?.()
    } catch (error) {
      console.error('Failed to update contract:', error)
      toast.error(error.response?.data?.message || 'Failed to update contract')
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async () => {
    if (contract.status !== 'active') {
      toast.error('Chat is only available for active contracts')
      return
    }

    try {
      setChatLoading(true)

      // Use the contract chat endpoint instead of user-based chat
      const { data } = await chatAPI.getContractChat(contract._id)

      if (data.chat) {
        navigate('/chat', {
          state: {
            selectedChat: data.chat,
            contractId: contract._id
          }
        })
        toast.success('Chat opened successfully')
      } else {
        // Create chat if it doesn't exist
        const chatData = {
          contractId: contract._id
        }

        const { data: newChat } = await chatAPI.accessChat(chatData)
        navigate('/chat', {
          state: {
            selectedChat: newChat,
            contractId: contract._id
          }
        })
        toast.success('New chat created')
      }
    } catch (error) {
      console.error('Failed to open chat:', error)

      if (error.response?.status === 403) {
        toast.error('Contract is not active. Chat is read-only.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to open chat')
      }
    } finally {
      setChatLoading(false)
    }
  }

  const handleViewDetails = () => {
    navigate(`/contracts/${contract._id}`)
  }

  const otherUserName = userRole === 'client'
    ? contract.freelancer?.name || contract.freelancerId?.name || 'Freelancer'
    : contract.client?.name || contract.clientId?.name || 'Client'

  const otherUserRole = userRole === 'client' ? 'Freelancer' : 'Client'
  const statusConfig = getStatusConfig(contract.status)

  return (
    <motion.div
      whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className={`rounded-3xl border ${statusConfig.borderColor} bg-white p-6 shadow-lg transition-all duration-300 h-full flex flex-col`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusConfig.color} bg-opacity-20`}>
            <FiFileText className={`w-6 h-6 ${statusConfig.accentColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
              {contract.title || `Contract #${contract.contractNumber || contract._id?.slice(-6)}`}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                {statusConfig.icon}
                <span className="ml-1 capitalize">{contract.status}</span>
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(contract.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Details */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 flex-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-600 text-sm">
            <FiUsers className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-900">{otherUserName}</span>
            <span className="text-xs text-gray-400 ml-1">({otherUserRole})</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-600 text-sm">
            <FiDollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-bold text-gray-900 text-lg">
              {formatCurrency(contract.payment || contract.budget || 0)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center text-gray-600 text-sm">
            <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Deadline:</span>
          </div>
          <span className="font-medium text-gray-900 text-sm">
            {formatDate(contract.endDate || contract.deadline)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {contract.status === 'active' ? (
            <button
              onClick={handleStartChat}
              disabled={chatLoading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center font-semibold shadow-lg shadow-blue-200 transition-colors text-sm"
            >
              {chatLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiMessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleViewDetails}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 flex items-center justify-center font-semibold transition-colors text-sm"
            >
              <FiEye className="w-4 h-4 mr-2" />
              Details
            </button>
          )}

          {/* Accept Button for Freelancers */}
          {userRole === 'freelancer' && contract.status === 'pending' && !contract.freelancerAccepted && (
            <button
              onClick={handleAcceptContract}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center font-semibold shadow-lg shadow-green-200 transition-colors text-sm"
            >
              <FiCheckCircle className="w-4 h-4 mr-2" />
              Accept
            </button>
          )}
        </div>

        {/* Status Actions */}
        {(userRole === 'freelancer' && contract.status === 'active') ||
          (userRole === 'client' && contract.status === 'pending') ? (
          <button
            onClick={() => handleStatusUpdate(userRole === 'client' ? 'active' : 'completed')}
            disabled={loading}
            className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-center font-medium transition-colors text-sm border ${userRole === 'client'
                ? 'border-blue-200 text-blue-700 hover:bg-blue-50'
                : 'border-green-200 text-green-700 hover:bg-green-50'
              }`}
          >
            {userRole === 'client' ? 'Activate Contract' : 'Mark Complete'}
          </button>
        ) : null}
      </div>

      {/* Contract Ended Warning */}
      {contract.status !== 'active' && contract.status !== 'pending' && (
        <div className="mt-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-xs text-gray-500">
          <span className="flex items-center">
            <FiAlertCircle className="mr-1.5" />
            Chat {contract.status === 'completed' ? 'read-only' : 'disabled'}
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default ContractCard