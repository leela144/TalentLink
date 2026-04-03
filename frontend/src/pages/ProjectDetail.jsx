// src/pages/ProjectDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { projectAPI, proposalAPI } from '../services/api'
import Layout from '../components/Layout/Layout'
import ProposalForm from '../components/proposals/ProposalForm'
import ProposalList from '../components/proposals/ProposalList'
import CreateContractModal from '../components/contracts/CreateContractModal'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiArrowLeft, FiDollarSign, FiArrowRight,FiCalendar, FiTag,
  FiUser, FiEdit2, FiCheckCircle, FiClock,
  FiMapPin, FiFileText, FiMessageSquare, FiGlobe,
  FiBarChart2, FiArchive, FiAlertCircle, FiDatabase,
  FiBriefcase
} from 'react-icons/fi'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [activeTab, setActiveTab] = useState('details')
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    console.log('🔄 ProjectDetail mounted with ID:', id)
    console.log('👤 Current user:', user)
    fetchProject()
    if (user?.role === 'client') {
      fetchProposals()
    }
  }, [id, user])

  const fetchProject = async () => {
    try {
      setDebugInfo('Fetching project details...')
      console.log('📡 Fetching project with ID:', id)

      // Validate project ID format
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id)
      if (!isValidObjectId(id)) {
        throw new Error('Invalid project ID format')
      }

      const { data } = await projectAPI.getById(id)

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch project')
      }

      if (!data.project) {
        throw new Error('Project not found in response')
      }

      console.log('✅ Project fetched:', data.project)
      setProject(data.project)
      setDebugInfo('')
    } catch (err) {
      console.error('❌ Error fetching project:', err)
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      })

      setDebugInfo(`Failed to fetch project: ${err.message}`)

      if (err.response?.status === 404 || err.message.includes('not found')) {
        toast.error('Project not found')
      } else if (err.response?.status === 400) {
        toast.error('Invalid project ID')
      } else if (err.response?.status === 401) {
        toast.error('Please login again')
        navigate('/auth/login')
      } else {
        // toast.error('Failed to load project: ' + (err.response?.data?.message || err.message))
      }

      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchProposals = async () => {
    try {
      setDebugInfo('Fetching proposals...')
      console.log('📡 Fetching proposals for project:', id)

      // Validate project ID
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id)
      if (!isValidObjectId(id)) {
        console.log('⚠️ Invalid project ID for proposals:', id)
        setProposals([])
        return
      }

      // Use proper API based on role
      if (user?.role !== 'client' && user?.role !== 'freelancer') {
        console.log('👤 User is not a client or freelancer, skipping proposals fetch')
        setProposals([])
        return
      }

      console.log(`🔗 Calling proposal API for project: ${id}`)
      const response = await proposalAPI.getByProject(id)
      console.log('📦 Proposal API response:', response.data)

      const data = response.data;

      // Handle different response formats
      if (data.success === false) {
        console.warn('⚠️ Proposal API returned unsuccessful:', data)
        setProposals([])
      } else if (data.proposals) {
        setProposals(data.proposals)
        console.log(`✅ Set ${data.proposals.length} proposals`)
      } else if (data.data) {
        setProposals(data.data)
        console.log(`✅ Set ${data.data.length} proposals`)
      } else {
        console.log('⚠️ No proposals data found, setting empty array')
        setProposals([])
      }

      setDebugInfo('')

      // Check if current freelancer has already submitted a proposal
      if (user?.role === 'freelancer') {
        const myProposal = data.proposals?.find(p => p.freelancerId?._id === user._id || p.freelancerId === user._id)
        if (myProposal) {
          console.log('✅ Found my proposal:', myProposal)
          // Hide proposal form button logic handled in render
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch proposals:', err)
      console.error('Proposal error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        url: err.config?.url
      })

      setDebugInfo('Failed to load proposals')
      setProposals([])

      // Don't show toast for proposal errors to avoid spamming
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.')
      } else if (err.response?.status === 404) {
        console.log('No proposals found for this project')
      } else if (err.response?.status === 400) {
        console.log('Bad request - check project ID')
      }
    }
  }

  const handleProposalSuccess = () => {
    setShowProposalForm(false)
    toast.success('Proposal submitted successfully!')
    if (user?.role === 'client') {
      fetchProposals()
    }
  }

  const handleAcceptProposal = (proposalOrProject, proposal) => {
    // Handle both calling patterns: onAccept(proposal) or onAccept(project, proposal)
    const actualProposal = proposal || proposalOrProject

    console.log('🎯 handleAcceptProposal called with:', actualProposal)
    console.log('🎯 Current project:', project)
    console.log('🎯 Setting selected proposal and showing contract modal')

    setSelectedProposal(actualProposal)
    setShowContractModal(true)
    setDebugInfo('Contract modal triggered')

    // Log to verify IDs
    console.log('🔍 Proposal freelancerId:', actualProposal?.freelancerId)
    console.log('🔍 Project client field:', project?.client)
  }

  const handleContractCreated = (contractData) => {
    console.log('✅ Contract created successfully:', contractData)
    setShowContractModal(false)
    setSelectedProposal(null)

    // Optimistic update
    setProposals(prev => prev.map(p =>
      p._id === contractData.proposal._id
        ? { ...p, status: 'accepted' }
        : p
    ))

    // Also update project status if returned
    if (contractData.proposal?.projectId) {
      // Ideally we'd update project state here too if we have the full object
    }

    toast.success('Contract created successfully!')
    setDebugInfo('Contract created')
    // fetchProject() // Optional: Fetch only if needed, but avoid full reload flicker
    // fetchProposals()
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this project as ${newStatus.replace('_', ' ')}?`)) return

    try {
      await projectAPI.updateStatus(id, newStatus)
      toast.success(`Project marked as ${newStatus.replace('_', ' ')}`)
      fetchProject()
    } catch (error) {
      console.error('Failed to update project:', error)
      toast.error('Failed to update project status')
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      open: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <FiClock className="w-4 h-4" />,
        label: 'Open'
      },
      in_progress: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <FiBarChart2 className="w-4 h-4" />,
        label: 'In Progress'
      },
      completed: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <FiCheckCircle className="w-4 h-4" />,
        label: 'Completed'
      },
      closed: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <FiArchive className="w-4 h-4" />,
        label: 'Closed'
      },
    }

    return configs[status] || configs.open
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading project details...</p>
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <FiAlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Project Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            The project you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
          >
            Back to Projects
          </button>
        </div>
      </Layout>
    )
  }

  // Extract client ID from project (your schema uses 'client' field)
  const projectClientId = typeof project.client === 'object' ? project.client?._id : project.client;
  const isClientOwner = user?.role === 'client' && projectClientId === user?._id;
  const statusConfig = getStatusConfig(project.status)

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Debug Info */}
        {debugInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start">
            <FiDatabase className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">{debugInfo}</div>
          </div>
        )}

        <div className="space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-white opacity-5 rounded-full w-64 h-64 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 p-12 -ml-16 -mb-16 bg-black opacity-10 rounded-full w-64 h-64 blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <button
                    onClick={() => navigate('/projects')}
                    className="mt-1 p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors"
                  >
                    <FiArrowLeft className="w-5 h-5 text-white" />
                  </button>

                  <div>
                    <h1 className="text-3xl font-bold text-white mb-3 leading-tight">{project.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-blue-100">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md bg-white/10 border border-white/20 shadow-sm`}>
                        <span className="mr-1.5">{statusConfig.icon}</span>
                        {statusConfig.label}
                      </span>
                      <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                      <span className="flex items-center">
                        <FiUser className="w-4 h-4 mr-1.5 opacity-80" />
                        Posted by <span className="font-semibold ml-1 text-white">{project.client?.name || 'Unknown'}</span>
                      </span>
                      <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                      <span className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1.5 opacity-80" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {isClientOwner && project.status === 'open' && (
                    <button
                      onClick={() => navigate(`/projects/${id}/edit`)}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm border border-white/20 flex items-center transition-all font-medium"
                    >
                      <FiEdit2 className="w-4 h-4 mr-2" />
                      Edit Project
                    </button>
                  )}

                  {isClientOwner && project.status === 'open' && proposals.length > 0 && (
                    <button
                      onClick={() => setActiveTab('proposals')}
                      className="px-5 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 flex items-center transition-all font-bold shadow-lg"
                    >
                      <FiMessageSquare className="w-4 h-4 mr-2" />
                      View Proposals ({proposals.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 px-6 pt-4">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`pb-4 text-sm font-medium border-b-2 transition-colors relative ${activeTab === 'details'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      Project Details
                      {activeTab === 'details' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                        />
                      )}
                    </button>
                    {isClientOwner && (
                      <button
                        onClick={() => setActiveTab('proposals')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors relative ${activeTab === 'proposals'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        Proposals
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'proposals' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                          {proposals.length}
                        </span>
                        {activeTab === 'proposals' && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                          />
                        )}
                      </button>
                    )}
                  </nav>
                </div>

                <div className="p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'details' ? (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                              <FiFileText className="w-5 h-5" />
                            </span>
                            Description
                          </h3>
                          <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            <p className="whitespace-pre-line">{project.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                              <div className="flex items-center text-gray-900 mb-1">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3">
                                  <FiDollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Budget</p>
                                  <p className="font-bold text-lg">${project.budget?.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                              <div className="flex items-center text-gray-900 mb-1">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-3">
                                  <FiCalendar className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Duration</p>
                                  <p className="font-bold text-lg">{project.duration || 'Not specified'} days</p>
                                </div>
                              </div>
                            </div>

                            {project.location && (
                              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="flex items-center text-gray-900 mb-1">
                                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mr-3">
                                    <FiMapPin className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Location</p>
                                    <p className="font-bold text-lg">{project.location}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors h-full">
                              <div className="flex items-start mb-3">
                                <FiTag className="w-5 h-5 text-blue-500 mt-1 mr-2" />
                                <p className="text-sm font-bold text-gray-900">Skills Required</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {project.requiredSkills?.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1.5 bg-white text-blue-700 text-sm font-medium rounded-lg border border-blue-100 shadow-sm"
                                  >
                                    {skill}
                                  </span>
                                )) || <span className="text-gray-500 italic">No skills specified</span>}
                              </div>
                            </div>

                            {project.category && (
                              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="flex items-center text-gray-900 mb-1">
                                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg mr-3">
                                    <FiGlobe className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Category</p>
                                    <p className="font-bold text-lg capitalize">{project.category.replace('_', ' ')}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Files/Attachments */}
                        {project.attachments && project.attachments.length > 0 && (
                          <div className="pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                              <FiBriefcase className="w-5 h-5 mr-2 text-gray-400" />
                              Attachments
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {project.attachments.map((file, index) => (
                                <a
                                  key={index}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                                >
                                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors mr-3">
                                    <FiFileText className="w-5 h-5" />
                                  </div>
                                  <span className="text-gray-700 font-medium truncate group-hover:text-gray-900">{file.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="proposals"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-6 p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start">
                          <FiAlertCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-blue-900 text-lg mb-1">Contract Creation</h4>
                            <p className="text-blue-700 leading-relaxed">
                              When you accept a proposal, a contract creation modal will appear.
                              Fill in the contract details and submit to create a formal contract.
                            </p>
                          </div>
                        </div>
                        <ProposalList
                          proposals={proposals}
                          project={project}
                          onAccept={handleAcceptProposal}
                          onUpdate={fetchProposals}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Panel */}
              <motion.div
                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sticky top-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {user?.role === 'freelancer' ? 'Submit Proposal' : 'Project Actions'}
                  </h3>
                  <div className={`w-3 h-3 rounded-full ${project.status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>

                {user?.role === 'freelancer' && project.status === 'open' ? (
                  <>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                      Submit your proposal for this project. Include your bid, timeline, and relevant experience to stand out.
                    </p>
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 flex items-center justify-center font-bold transition-all duration-200"
                    >
                      Write a Proposal
                      <FiArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </>
                ) : user?.role === 'freelancer' && proposals.some(p => p.freelancerId?._id === user?._id || p.freelancerId === user?._id) ? (
                  <div className="text-center py-6 px-4 bg-green-50 rounded-2xl border border-green-200">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800 mb-1">Applied</h3>
                    <p className="text-green-600 text-sm">You have successfully applied to this project.</p>
                  </div>
                ) : isClientOwner ? (
                  <div className="space-y-6">
                    {/* Status Management */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                        Update Status
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['open', 'in_progress', 'completed', 'closed'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(status)}
                            disabled={project.status === status}
                            className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors border ${project.status === status
                              ? 'bg-gray-900 text-white border-gray-900 cursor-default'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {status.replace('_', ' ').toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-3">Proposals Summary</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total</p>
                          <p className="text-2xl font-bold text-gray-900">{proposals.length}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Avg Bid</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${proposals.length > 0
                              ? Math.round(proposals.reduce((sum, p) => sum + (p.bidAmount || 0), 0) / proposals.length)
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : project.status !== 'open' ? (
                  <div className="text-center py-8">
                    <FiArchive className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">This project is no longer accepting proposals.</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">Sign in as a freelancer to submit a proposal.</p>
                    <button
                      onClick={() => navigate('/auth/login')}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Client Info */}
              <motion.div
                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FiUser className="w-5 h-5 mr-2 text-gray-400" />
                  About the Client
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-50">
                    {project.client?.avatar ? (
                      <img
                        src={project.client.avatar}
                        alt={project.client.name}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 text-xl font-bold">
                        {project.client?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{project.client?.name || 'Unknown'}</h4>
                    <p className="text-sm text-gray-500">{project.client?.email || 'No email'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {project.client?.company && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <FiBriefcase className="w-4 h-4 mr-2 text-gray-400" />
                      {project.client.company}
                    </div>
                  )}
                  {project.client?.location && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {project.client.location}
                    </div>
                  )}
                </div>

                {project.client?.bio && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 italic leading-relaxed">"{project.client.bio}"</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showProposalForm && (
            <ProposalForm
              projectId={id}
              onClose={() => setShowProposalForm(false)}
              onSuccess={handleProposalSuccess}
            />
          )}

          {showContractModal && selectedProposal && project && (
            <CreateContractModal
              project={project}
              proposal={selectedProposal}
              onClose={() => {
                console.log('🔒 Closing contract modal')
                setShowContractModal(false)
                setSelectedProposal(null)
              }}
              onSuccess={handleContractCreated}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  )
}

export default ProjectDetail