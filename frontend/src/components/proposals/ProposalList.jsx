

// src/components/proposals/ProposalList.jsx
import { useState } from 'react'
import { proposalAPI, chatAPI } from '../../services/api'
import { toast } from 'react-toastify'
import ChatNotification from '../chat/ChatNotification'
import { FiUser, FiDollarSign, FiClock, FiCheck, FiX, FiMessageSquare, FiCalendar, FiFileText, FiAlertCircle, FiChevronRight } from 'react-icons/fi'

const ProposalList = ({ proposals, project, onAccept, onUpdate }) => {
  const [updating, setUpdating] = useState(null)
  const [showChatNotification, setShowChatNotification] = useState(false)
  const [notificationData, setNotificationData] = useState(null)

  const handleStatusUpdate = async (proposalId, status) => {
    setUpdating(proposalId)
    let updateSuccess = false

    try {
      console.log('📋 Proposal status update:', { proposalId, status })

      // First update the proposal status via API
      await proposalAPI.updateStatus(proposalId, status)
      toast.success(`Proposal ${status}`)
      updateSuccess = true
    } catch (err) {
      console.error('❌ Failed to update proposal (API):', err)
      toast.error(err.response?.data?.message || 'Failed to update proposal')
      setUpdating(null)
      return // Stop if API failed
    }

    // If API succeeded, proceed with UI updates safely
    if (updateSuccess) {
      try {
        const updatedProposal = proposals.find(p => p._id === proposalId)

        if (status === 'accepted') {
          console.log('✅ Proposal accepted:', updatedProposal)

          // Set the selected proposal for contract creation - REMOVED missing state set
          // setSelectedProposal(updatedProposal) 

          // Call onAccept with both project and proposal
          if (onAccept && project) {
            onAccept(project, updatedProposal)
          } else {
            console.error('❌ Missing project or onAccept callback')
            // Don't show error to user as operation "succeeded" in backend
          }

        } else if (status === 'rejected') {
          // Show chat notification for rejected proposals
          if (updatedProposal) {
            setNotificationData({
              freelancerName: updatedProposal.freelancerId?.name,
              projectTitle: project?.title || 'Project',
              status: 'rejected'
            })
            setShowChatNotification(true)
          }
        }

        // Refresh the proposals list
        onUpdate?.()
      } catch (uiErr) {
        console.error('⚠️ UI Update error after successful proposal update:', uiErr)
        // Do not show a toast here to avoid confusing the user
      } finally {
        setUpdating(null)
      }
    }
  }

  const handleViewProfile = (freelancerId) => {
    // Navigate to freelancer profile
    window.open(`/profile/${freelancerId}`, '_blank')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`

    return formatDate(dateString)
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <FiMessageSquare className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Proposals Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          No freelancers have submitted proposals for this project yet.
          Check back later or share your project to get more visibility.
        </p>
      </div>
    )
  }

  // Sort proposals: accepted first, then pending, then rejected
  const sortedProposals = [...proposals].sort((a, b) => {
    const statusOrder = { 'accepted': 0, 'pending': 1, 'rejected': 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Proposals ({proposals.length})
          </h3>
          <div className="text-sm text-gray-500">
            Sorted by status •
            <span className="ml-2">
              {proposals.filter(p => p.status === 'accepted').length} accepted,
              {' '}{proposals.filter(p => p.status === 'pending').length} pending
            </span>
          </div>
        </div>


      </div>

      <div className="space-y-6">
        {sortedProposals.map((proposal) => (
          <div
            key={proposal._id}
            className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${proposal.status === 'accepted'
              ? 'border-green-200 bg-green-50/30'
              : proposal.status === 'rejected'
                ? 'border-red-200'
                : 'border-gray-200 hover:border-blue-300'
              }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between">
              {/* Left Column - Freelancer Info */}
              <div className="flex-1 lg:pr-6">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${proposal.status === 'accepted' ? 'border-green-400' :
                      proposal.status === 'rejected' ? 'border-red-300' :
                        'border-gray-300'
                      }`}>
                      {proposal.freelancerId?.avatar ? (
                        <img
                          src={proposal.freelancerId.avatar}
                          alt={proposal.freelancerId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <FiUser className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>
                    {/* Online indicator */}
                    {proposal.status === 'accepted' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Freelancer Details */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => handleViewProfile(proposal.freelancerId?._id)}
                        >
                          {proposal.freelancerId?.name || 'Unknown Freelancer'}
                          <FiChevronRight className="inline w-4 h-4 ml-1 text-gray-400" />
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {proposal.freelancerId?.role || 'Freelancer'}
                          </span>
                          <span>•</span>
                          <span>{proposal.freelancerId?.email || 'No email'}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-2 sm:mt-0">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center ${proposal.status === 'accepted'
                          ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200'
                          : proposal.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                          {proposal.status === 'accepted' && (
                            <FiCheck className="w-4 h-4 mr-1.5" />
                          )}
                          {proposal.status === 'rejected' && (
                            <FiX className="w-4 h-4 mr-1.5" />
                          )}
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          <FiCalendar className="inline w-3 h-3 mr-1" />
                          {formatTimeAgo(proposal.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Rating & Reviews (if available) */}
                    {proposal.freelancerId?.rating && (
                      <div className="flex items-center mt-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(proposal.freelancerId.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                                }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {proposal.freelancerId.rating.toFixed(1)}
                            {proposal.freelancerId.reviewCount &&
                              ` (${proposal.freelancerId.reviewCount} reviews)`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proposal Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FiDollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bid Amount</p>
                        <p className="font-bold text-xl text-gray-900">
                          ${proposal.bidAmount?.toLocaleString()}
                        </p>
                        {project?.budget && (
                          <p className="text-xs text-gray-500 mt-1">
                            Project budget: ${project.budget.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <FiClock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Time</p>
                        <p className="font-bold text-lg text-gray-900">
                          {proposal.estimatedTime || 'Flexible'}
                        </p>
                        {proposal.deliveryDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Delivery by: {formatDate(proposal.deliveryDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <FiFileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Proposal Status</p>
                        <p className="font-bold text-lg capitalize text-gray-900">
                          {proposal.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated: {formatTimeAgo(proposal.updatedAt || proposal.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {proposal.message && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiMessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                      Cover Letter
                    </h5>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-line">{proposal.message}</p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {proposal.freelancerId?.skills && proposal.freelancerId.skills.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Skills & Expertise:</h5>
                    <div className="flex flex-wrap gap-2">
                      {proposal.freelancerId.skills.slice(0, 8).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                      {proposal.freelancerId.skills.length > 8 && (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg">
                          +{proposal.freelancerId.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Attachments (if any) */}
                {proposal.attachments && proposal.attachments.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h5>
                    <div className="flex flex-wrap gap-2">
                      {proposal.attachments.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <FiFileText className="w-4 h-4 mr-2" />
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-200 mt-4">
              <div className="mb-4 sm:mb-0">
                {proposal.status === 'accepted' ? (
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <div>
                      <span className="text-green-700 font-medium">
                        Contract Ready to Create
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Click "Create Contract" to finalize the agreement
                      </p>
                    </div>
                  </div>
                ) : proposal.status === 'rejected' ? (
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2"></div>
                    <div>
                      <span className="text-red-700 font-medium">
                        ✗ Proposal Not Selected
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        This proposal has been declined
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">


                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">


                {/* Status-specific buttons */}
                {proposal.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(proposal._id, 'accepted')}
                      disabled={updating === proposal._id}
                      className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-sm hover:shadow"
                    >
                      {updating === proposal._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Accepting...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5 mr-2" />
                          Accept Proposal
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(proposal._id, 'rejected')}
                      disabled={updating === proposal._id}
                      className="flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all shadow-sm hover:shadow"
                    >
                      {updating === proposal._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <FiX className="w-5 h-5 mr-2" />
                          Reject
                        </>
                      )}
                    </button>
                  </>
                )}

                {proposal.status === 'accepted' && (
                  <>
                    <button
                      onClick={() => {
                        if (onAccept && project) {
                          onAccept(project, proposal)
                        } else {
                          toast.error('Cannot create contract: Missing data')
                        }
                      }}
                      className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow"
                    >
                      <FiFileText className="w-4 h-4 mr-2" />
                      Create Contract
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Notification */}
      {showChatNotification && notificationData && (
        <ChatNotification
          freelancerName={notificationData.freelancerName}
          projectTitle={notificationData.projectTitle}
          onClose={() => setShowChatNotification(false)}
        />
      )}
    </>
  )
}

export default ProposalList