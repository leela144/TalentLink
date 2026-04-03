// src/components/proposals/ProposalForm.jsx
import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { proposalAPI, contractAPI, projectAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import {
  FiX,
  FiDollarSign,
  FiClock,
  FiFileText,
  FiCheck,
  FiAlertCircle,
  FiMessageCircle,
  FiCalendar,
  FiTrendingUp,
  FiUser,
  FiPaperclip,
  FiSend,
  FiFilePlus,
  FiBookOpen
} from 'react-icons/fi'

const ProposalForm = ({
  projectId,
  onClose,
  onSuccess,
  project,
  proposal,
  mode = 'submit' // 'submit' or 'create-contract'
}) => {
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [characterCount, setCharacterCount] = useState(0)
  const [establishmentSteps, setEstablishmentSteps] = useState([])

  const { user } = useAuth()

  // Determine which validation schema to use
  const validationSchema = mode === 'create-contract'
    ? Yup.object({
      title: Yup.string()
        .required('Contract title is required')
        .min(5, 'Title must be at least 5 characters'),
      description: Yup.string()
        .required('Contract description is required')
        .min(20, 'Description must be at least 20 characters'),
      bidAmount: Yup.number()
        .typeError('Amount must be a number')
        .positive('Amount must be positive')
        .min(1, 'Amount must be at least $1')
        .max(1000000, 'Amount cannot exceed $1,000,000')
        .required('Contract amount is required'),
      estimatedTime: Yup.string()
        .required('Timeline is required'),
      terms: Yup.string()
        .required('Terms and conditions are required')
        .min(100, 'Please provide detailed terms'),
      startDate: Yup.date()
        .required('Start date is required')
        .min(new Date(), 'Start date cannot be in the past'),
      deadline: Yup.date()
        .required('Deadline is required')
        .min(Yup.ref('startDate'), 'Deadline must be after start date'),
    })
    : Yup.object({
      bidAmount: Yup.number()
        .typeError('Bid amount must be a number')
        .positive('Bid amount must be positive')
        .min(1, 'Bid must be at least $1')
        .max(1000000, 'Bid cannot exceed $1,000,000')
        .required('Bid amount is required'),
      estimatedTime: Yup.string()
        .min(2, 'Estimated time must be at least 2 characters')
        .max(50, 'Estimated time is too long')
        .required('Estimated time is required'),
      message: Yup.string()
        .min(20, 'Message should be at least 20 characters')
        .max(5000, 'Message cannot exceed 5000 characters')
        .required('Message is required'),
    })

  // Different initial values based on mode
  const getInitialValues = () => {
    if (mode === 'create-contract' && proposal && project) {
      return {
        title: project?.title || '',
        description: proposal?.message || proposal?.description || '',
        bidAmount: proposal?.bidAmount || project?.budget || '',
        estimatedTime: proposal?.estimatedTime || '',
        terms: `CONTRACT TERMS AND CONDITIONS

1. SCOPE OF WORK
The freelancer agrees to complete the work as described in the project.

2. PAYMENT
The client agrees to pay $${proposal?.bidAmount || '[Amount]'} upon satisfactory completion.
Payment will be made within 7 days of project completion.

3. TIMELINE
Work to be completed as per the agreed timeline.

4. REVISIONS
Includes up to 3 rounds of revisions. Additional revisions may incur extra charges.

5. COMMUNICATION
Both parties agree to maintain professional communication.

6. INTELLECTUAL PROPERTY
All work produced becomes the property of the client upon full payment.

7. CONFIDENTIALITY
Both parties agree to keep project details confidential.

8. TERMINATION
Either party may terminate with 7 days written notice.

9. DISPUTE RESOLUTION
Any disputes will be resolved through mediation.`,
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
    } else {
      return {
        bidAmount: project?.budget ? Math.round(project.budget * 0.8) : '',
        estimatedTime: '',
        message: '',
      }
    }
  }

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema,
    onSubmit: async (values) => {
      if (mode === 'create-contract') {
        await handleContractCreation(values)
      } else {
        await handleProposalSubmission(values)
      }
    },
  })

  // Handle proposal submission
  const handleProposalSubmission = async (values) => {
    setLoading(true)
    try {
      const proposalData = {
        projectId,
        bidAmount: parseFloat(values.bidAmount),
        estimatedTime: values.estimatedTime,
        message: values.message,
        freelancerId: user?._id,
        attachments: attachments.map(file => ({
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size
        }))
      }

      const response = await proposalAPI.create(proposalData)

      toast.success(
        <div className="flex items-center">
          <FiCheck className="w-5 h-5 mr-2 text-green-500" />
          <div>
            <div className="font-semibold">Proposal Submitted!</div>
            <div className="text-sm">The client has been notified.</div>
          </div>
        </div>,
        { autoClose: 4000 }
      )

      onSuccess(response.data?.proposal || response.data)

    } catch (err) {
      console.error('❌ Proposal submission error:', err)

      let errorMessage = 'Failed to submit proposal. Please try again.'
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }

      toast.error(
        <div className="flex items-center">
          <FiAlertCircle className="w-5 h-5 mr-2 text-red-500" />
          <div className="font-medium">{errorMessage}</div>
        </div>,
        { autoClose: 5000 }
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle contract creation
  const handleContractCreation = async (values) => {
    setLoading(true)
    setEstablishmentSteps([])
    setStep(1)

    try {
      // Step 1: Extract IDs
      setStep(1)
      setEstablishmentSteps(prev => [...prev, '🔍 Extracting user IDs...'])

      let clientId = null
      let freelancerId = null

      // Extract clientId from project
      if (project?.clientId) {
        if (typeof project.clientId === 'string') {
          clientId = project.clientId
        } else if (project.clientId._id) {
          clientId = project.clientId._id
        }
      } else if (project?.client) {
        if (typeof project.client === 'string') {
          clientId = project.client
        } else if (project.client._id) {
          clientId = project.client._id
        }
      }

      // Extract freelancerId from proposal
      if (proposal?.freelancerId) {
        if (typeof proposal.freelancerId === 'string') {
          freelancerId = proposal.freelancerId
        } else if (proposal.freelancerId._id) {
          freelancerId = proposal.freelancerId._id
        }
      }

      if (!clientId || !freelancerId) {
        throw new Error('Missing required user IDs')
      }

      setStep(2)
      setEstablishmentSteps(prev => [...prev, '📝 Preparing contract data...'])

      // Step 2: Prepare contract data
      const contractData = {
        projectId: project?._id,
        proposalId: proposal?._id,
        freelancerId: freelancerId,
        clientId: clientId,
        title: values.title,
        description: values.description,
        budget: parseFloat(values.bidAmount),
        startDate: values.startDate,
        deadline: values.deadline,
        terms: values.terms,
      }

      setStep(3)
      setEstablishmentSteps(prev => [...prev, '🔄 Creating contract in database...'])

      // Step 3: Create contract
      const contractResponse = await contractAPI.create(contractData)
      const contract = contractResponse.data?.contract || contractResponse.data?.data

      if (!contract) {
        throw new Error('Contract creation failed')
      }

      setEstablishmentSteps(prev => [...prev, `✅ Contract created (ID: ${contract._id?.slice(-6)})`])
      setStep(4)

      // Step 4: Update proposal status
      setEstablishmentSteps(prev => [...prev, '📋 Updating proposal status...'])
      try {
        await proposalAPI.update(proposal._id, {
          status: 'accepted',
          contractId: contract._id
        })
        setEstablishmentSteps(prev => [...prev, '✅ Proposal marked as accepted'])
      } catch (err) {
        console.error('Error updating proposal:', err)
        setEstablishmentSteps(prev => [...prev, '⚠️ Could not update proposal status'])
      }

      setStep(5)

      // Step 5: Update project
      setEstablishmentSteps(prev => [...prev, '🎯 Updating project...'])
      try {
        await projectAPI.update(project._id, {
          status: 'in progress',
          assignedTo: freelancerId,
          contractId: contract._id
        })
        setEstablishmentSteps(prev => [...prev, '✅ Project updated to "in progress"'])
      } catch (err) {
        console.error('Error updating project:', err)
        setEstablishmentSteps(prev => [...prev, '⚠️ Could not update project'])
      }

      setStep(6)
      setEstablishmentSteps(prev => [...prev, '🎉 Contract fully established!'])

      toast.success(
        <div className="flex items-center">
          <FiCheck className="w-6 h-6 mr-2 text-green-500" />
          <div>
            <div className="font-bold text-lg">Contract Established!</div>
            <div className="text-sm">The freelancer has been notified and work can begin.</div>
          </div>
        </div>,
        { autoClose: 5000 }
      )

      // Call success callback
      if (onSuccess) {
        onSuccess({
          contract,
          projectId: project._id,
          proposalId: proposal._id,
          freelancerId,
          clientId
        })
      }

      // Auto close after delay
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err) {
      console.error('❌ Contract creation error:', err)

      let errorMessage = 'Failed to establish contract. Please try again.'
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
        setEstablishmentSteps(prev => [...prev, `❌ Error: ${err.response.data.message}`])
      } else if (err.message) {
        errorMessage = err.message
        setEstablishmentSteps(prev => [...prev, `❌ Error: ${err.message}`])
      }

      toast.error(
        <div className="flex items-center">
          <FiAlertCircle className="w-5 h-5 mr-2 text-red-500" />
          <div className="font-medium">{errorMessage}</div>
        </div>,
        { autoClose: 5000 }
      )
    } finally {
      setLoading(false)
    }
  }

  // Update character count
  useEffect(() => {
    if (mode === 'create-contract') {
      setCharacterCount(formik.values.terms?.length || 0)
    } else {
      setCharacterCount(formik.values.message?.length || 0)
    }
  }, [formik.values, mode])

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploadingFile(true)

    try {
      const newAttachments = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type.split('/')[1] || file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        file: file
      }))

      setAttachments(prev => [...prev, ...newAttachments])
      toast.success(`Added ${files.length} file(s)`)

    } catch (err) {
      console.error('Error handling files:', err)
      toast.error('Failed to add files')
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(file => file.id !== id))
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Render based on mode
  const renderForm = () => {
    if (mode === 'create-contract') {
      return renderContractForm()
    } else {
      return renderProposalForm()
    }
  }

  const renderProposalForm = () => {
    return (
      <div className="space-y-6">
        {/* Bid Amount & Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span>Your Bid Amount ($) *</span>
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="bidAmount"
                value={formik.values.bidAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.bidAmount && formik.errors.bidAmount
                  ? 'border-red-300 ring-2 ring-red-200'
                  : 'border-gray-300'
                  }`}
                placeholder="Enter your bid"
                step="0.01"
                disabled={loading}
              />
            </div>
            {formik.touched.bidAmount && formik.errors.bidAmount && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1" />
                {formik.errors.bidAmount}
              </p>
            )}
            {project?.budget && (
              <p className="mt-2 text-sm text-gray-500">
                Client's budget: <span className="font-semibold">${project.budget.toLocaleString()}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <FiClock className="w-5 h-5 text-purple-600" />
                </div>
                <span>Estimated Timeline *</span>
              </div>
            </label>
            <input
              type="text"
              name="estimatedTime"
              value={formik.values.estimatedTime}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.estimatedTime && formik.errors.estimatedTime
                ? 'border-red-300 ring-2 ring-red-200'
                : 'border-gray-300'
                }`}
              placeholder="e.g., 2 weeks, 30 days"
              disabled={loading}
            />
            {formik.touched.estimatedTime && formik.errors.estimatedTime && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1" />
                {formik.errors.estimatedTime}
              </p>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FiMessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <span>Cover Letter *</span>
            </div>
          </label>
          <textarea
            name="message"
            rows={6}
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.message && formik.errors.message
              ? 'border-red-300 ring-2 ring-red-200'
              : 'border-gray-300'
              }`}
            placeholder="Introduce yourself and explain why you're the best fit for this project. Mention your relevant experience and how you plan to approach the work..."
            disabled={loading}
          />
          <div className="flex justify-between mt-2">
            <div className="flex items-center">
              {formik.touched.message && formik.errors.message ? (
                <p className="text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="w-4 h-4 mr-1" />
                  {formik.errors.message}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Minimum 20 characters
                </p>
              )}
            </div>
            <p className={`text-sm ${characterCount < 20 ? 'text-red-600' : 'text-green-600'}`}>
              {characterCount}/5000
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderContractForm = () => {
    return (
      <div className="space-y-6">
        {/* Contract Title & Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FiFileText className="w-5 h-5 text-blue-600" />
              </div>
              <span>Contract Title *</span>
            </div>
          </label>
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.title && formik.errors.title
              ? 'border-red-300 ring-2 ring-red-200'
              : 'border-gray-300'
              }`}
            placeholder="e.g., Website Development Contract"
            disabled={loading}
          />
          {formik.touched.title && formik.errors.title && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="w-4 h-4 mr-1" />
              {formik.errors.title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <FiBookOpen className="w-5 h-5 text-green-600" />
              </div>
              <span>Contract Description *</span>
            </div>
          </label>
          <textarea
            name="description"
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.description && formik.errors.description
              ? 'border-red-300 ring-2 ring-red-200'
              : 'border-gray-300'
              }`}
            placeholder="Detailed description of what work will be completed..."
            disabled={loading}
          />
          {formik.touched.description && formik.errors.description && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="w-4 h-4 mr-1" />
              {formik.errors.description}
            </p>
          )}
        </div>

        {/* Amount & Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center">
                <FiDollarSign className="w-5 h-5 mr-2 text-green-600" />
                <span>Contract Amount ($) *</span>
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="bidAmount"
                value={formik.values.bidAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.bidAmount && formik.errors.bidAmount
                  ? 'border-red-300 ring-2 ring-red-200'
                  : 'border-gray-300'
                  }`}
                disabled={loading}
              />
            </div>
            {formik.touched.bidAmount && formik.errors.bidAmount && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1" />
                {formik.errors.bidAmount}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center">
                <FiCalendar className="w-5 h-5 mr-2 text-purple-600" />
                <span>Start Date *</span>
              </div>
            </label>
            <input
              type="date"
              name="startDate"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.startDate && formik.errors.startDate
                ? 'border-red-300 ring-2 ring-red-200'
                : 'border-gray-300'
                }`}
              disabled={loading}
            />
            {formik.touched.startDate && formik.errors.startDate && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1" />
                {formik.errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center">
                <FiClock className="w-5 h-5 mr-2 text-orange-600" />
                <span>Deadline *</span>
              </div>
            </label>
            <input
              type="date"
              name="deadline"
              value={formik.values.deadline}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min={formik.values.startDate}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.deadline && formik.errors.deadline
                ? 'border-red-300 ring-2 ring-red-200'
                : 'border-gray-300'
                }`}
              disabled={loading}
            />
            {formik.touched.deadline && formik.errors.deadline && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1" />
                {formik.errors.deadline}
              </p>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <FiFilePlus className="w-5 h-5 text-red-600" />
              </div>
              <span>Terms and Conditions *</span>
            </div>
          </label>
          <textarea
            name="terms"
            rows={8}
            value={formik.values.terms}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${formik.touched.terms && formik.errors.terms
              ? 'border-red-300 ring-2 ring-red-200'
              : 'border-gray-300'
              }`}
            placeholder="Enter the terms and conditions for this contract..."
            disabled={loading}
          />
          <div className="flex justify-between mt-2">
            <div>
              {formik.touched.terms && formik.errors.terms && (
                <p className="text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="w-4 h-4 mr-1" />
                  {formik.errors.terms}
                </p>
              )}
            </div>
            <p className={`text-sm ${characterCount < 100 ? 'text-red-600' : 'text-green-600'}`}>
              {characterCount} characters
            </p>
          </div>
        </div>

        {/* Establishment Progress */}
        {establishmentSteps.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Establishment Progress:</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {establishmentSteps.map((stepText, index) => (
                <div key={index} className="text-sm text-blue-700 font-mono">
                  {stepText}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {mode === 'create-contract' ? 'Establish Contract' : 'Submit Proposal'}
              </h3>
              <div className="flex items-center mt-2 text-gray-600">
                {mode === 'create-contract' ? (
                  <>
                    <FiUser className="w-4 h-4 mr-2" />
                    <span className="font-medium">Creating contract with {proposal?.freelancerId?.name}</span>
                  </>
                ) : (
                  <>
                    <FiUser className="w-4 h-4 mr-2" />
                    <span className="font-medium">{user?.name}</span>
                    <span className="mx-2">•</span>
                    <FiTrendingUp className="w-4 h-4 mr-2" />
                    <span>Applying as Freelancer</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Project Info Card */}
          {project && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-1">
                    {mode === 'create-contract' ? 'CONTRACT FOR' : 'PROJECT DETAILS'}
                  </h4>
                  <h5 className="text-lg font-bold text-gray-900">{project.title}</h5>

                  <div className="flex flex-wrap gap-4 mt-3">
                    {mode === 'create-contract' && proposal && (
                      <div className="flex items-center text-gray-700">
                        <FiUser className="w-4 h-4 mr-2 text-purple-600" />
                        <div>
                          <div className="text-xs text-gray-500">Freelancer</div>
                          <div className="font-bold">{proposal.freelancerId?.name || 'Unknown'}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-gray-700">
                      <FiDollarSign className="w-4 h-4 mr-2 text-green-600" />
                      <div>
                        <div className="text-xs text-gray-500">{mode === 'create-contract' ? 'Agreed Amount' : 'Client Budget'}</div>
                        <div className="font-bold">
                          ${mode === 'create-contract' ? (proposal?.bidAmount?.toLocaleString() || 'N/A') : (project.budget?.toLocaleString() || 'Negotiable')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={formik.handleSubmit}>
            {renderForm()}

            {/* File Attachments (for proposals only) */}
            {mode === 'submit' && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <FiPaperclip className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>Attachments (Optional)</span>
                  </div>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={loading || uploadingFile}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <FiPaperclip className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        {uploadingFile ? 'Uploading...' : 'Click to upload files'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Support for PDF, DOC, images, etc. (Max 10MB each)
                      </p>
                    </div>
                  </label>
                </div>

                {/* File List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center">
                          <FiFileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.type}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}



            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium flex items-center transition-all ${loading
                  ? 'bg-blue-400 text-white cursor-wait'
                  : mode === 'create-contract'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {mode === 'create-contract' ? 'Establishing Contract...' : 'Submitting Proposal...'}
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5 mr-2" />
                    {mode === 'create-contract' ? 'Establish Contract' : 'Submit Proposal'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProposalForm