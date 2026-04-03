// // src/components/contracts/CreateContractModal.jsx
// import { useState, useEffect } from 'react'
// import { useFormik } from 'formik'
// import * as Yup from 'yup'
// import { contractAPI, proposalAPI, projectAPI } from '../../services/api'
// import { toast } from 'react-toastify'
// // Change this line at the top:
// import { FiX, FiCalendar, FiDollarSign, FiCheck, FiClock, FiUser, FiAlertCircle, FiDatabase, FiKey } from 'react-icons/fi'
// // Removed FiId, added FiKey instead
// const CreateContractModal = ({ project, proposal, onClose, onSuccess }) => {
//   const [loading, setLoading] = useState(false)
//   const [debugInfo, setDebugInfo] = useState('')
//   const [step, setStep] = useState(1)

//   const calculateDefaultDeadline = () => {
//     const date = new Date()
//     date.setDate(date.getDate() + 30)
//     return date.toISOString().split('T')[0]
//   }

//   const validationSchema = Yup.object({
//     title: Yup.string()
//       .required('Contract title is required')
//       .min(5, 'Title must be at least 5 characters')
//       .max(100, 'Title must be less than 100 characters'),
//     description: Yup.string()
//       .required('Description is required')
//       .min(10, 'Description must be at least 10 characters'),
//     budget: Yup.number()
//       .typeError('Budget must be a number')
//       .min(1, 'Budget must be at least $1')
//       .max(1000000, 'Budget cannot exceed $1,000,000')
//       .required('Budget is required'),
//     startDate: Yup.date()
//       .required('Start date is required')
//       .min(new Date(), 'Start date cannot be in the past'),
//     deadline: Yup.date()
//       .required('Deadline is required')
//       .min(Yup.ref('startDate'), 'Deadline must be after start date'),
//     terms: Yup.string()
//       .required('Terms and conditions are required')
//       .min(20, 'Terms must be at least 20 characters'),
//   })

//   const formik = useFormik({
//     initialValues: {
//       title: project?.title || '',
//       description: proposal?.message || proposal?.description || '',
//       budget: proposal?.bidAmount || project?.budget || '',
//       startDate: new Date().toISOString().split('T')[0],
//       deadline: calculateDefaultDeadline(),
//       terms: `CONTRACT TERMS AND CONDITIONS

// 1. SCOPE OF WORK
// The freelancer agrees to complete the work as described in the project proposal: "${project?.title}"

// 2. PAYMENT
// The client agrees to pay $${proposal?.bidAmount || '[Amount]'} upon satisfactory completion of the work.
// Payment will be made within 7 days of project completion.

// 3. TIMELINE
// Work to be completed by ${calculateDefaultDeadline()}. Any delays must be communicated in advance.

// 4. REVISIONS
// Includes up to 3 rounds of revisions. Additional revisions may incur extra charges.

// 5. COMMUNICATION
// Both parties agree to maintain professional communication throughout the project.

// 6. INTELLECTUAL PROPERTY
// All work produced becomes the property of the client upon full payment.

// 7. CONFIDENTIALITY
// Both parties agree to keep project details confidential.

// 8. TERMINATION
// Either party may terminate with 7 days written notice.

// 9. DISPUTE RESOLUTION
// Any disputes will be resolved through mediation before legal action.

// 10. GOVERNING LAW
// This contract is governed by the laws of the client's jurisdiction.`,
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       setLoading(true)
//       setStep(1)
//       setDebugInfo('🚀 Starting contract creation process...')

//       try {
//         // Step 1: Extract IDs - FIXED VERSION
//         setStep(2)
//         setDebugInfo('📋 Step 1: Extracting user IDs...')

//         // Fix clientId extraction - handle different data structures
//         let clientId = null;

//         console.log('🔍 DEBUG - Project structure:', project);
//         console.log('🔍 DEBUG - Project clientId field:', project?.clientId);
//         console.log('🔍 DEBUG - Project client field:', project?.client);

//         // Try multiple ways to get clientId
//         if (project?.clientId) {
//           // If clientId is a string/ObjectId
//           if (typeof project.clientId === 'string') {
//             clientId = project.clientId;
//           } 
//           // If clientId is an object with _id
//           else if (project.clientId._id) {
//             clientId = project.clientId._id;
//           }
//           // If clientId is an object with id
//           else if (project.clientId.id) {
//             clientId = project.clientId.id;
//           }
//         }
//         // Try project.client if clientId doesn't exist
//         else if (project?.client?._id) {
//           clientId = project.client._id;
//         }
//         // Try project.client if it's a string
//         else if (typeof project?.client === 'string') {
//           clientId = project.client;
//         }

//         // Fix freelancerId extraction
//         let freelancerId = null;

//         console.log('🔍 DEBUG - Proposal structure:', proposal);
//         console.log('🔍 DEBUG - Proposal freelancerId field:', proposal?.freelancerId);

//         if (proposal?.freelancerId) {
//           if (typeof proposal.freelancerId === 'string') {
//             freelancerId = proposal.freelancerId;
//           } else if (proposal.freelancerId._id) {
//             freelancerId = proposal.freelancerId._id;
//           } else if (proposal.freelancerId.id) {
//             freelancerId = proposal.freelancerId.id;
//           }
//         }

//         console.log('🔍 DEBUG - Extracted IDs:', {
//           clientId,
//           freelancerId,
//           projectId: project?._id,
//           proposalId: proposal?._id
//         });

//         if (!clientId) {
//           console.error('❌ Client ID extraction failed. Project data:', project);
//           const errorMsg = `❌ Client ID is missing. Project structure: ${JSON.stringify(project, null, 2)}`
//           setDebugInfo(errorMsg)
//           throw new Error('Client ID could not be extracted from project data')
//         }

//         if (!freelancerId) {
//           console.error('❌ Freelancer ID extraction failed. Proposal data:', proposal);
//           const errorMsg = `❌ Freelancer ID is missing. Proposal structure: ${JSON.stringify(proposal, null, 2)}`
//           setDebugInfo(errorMsg)
//           throw new Error('Freelancer ID could not be extracted from proposal data')
//         }

//         // Validate MongoDB ObjectId format
//         const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id)
//         console.log('🔍 DEBUG - ID Validation:', {
//           clientIdValid: isValidObjectId(clientId),
//           clientIdValue: clientId,
//           freelancerIdValid: isValidObjectId(freelancerId),
//           freelancerIdValue: freelancerId,
//           projectIdValid: isValidObjectId(project?._id),
//           proposalIdValid: isValidObjectId(proposal?._id)
//         })

//         if (!isValidObjectId(clientId)) {
//           throw new Error(`Invalid Client ID format: ${clientId}`)
//         }

//         if (!isValidObjectId(freelancerId)) {
//           throw new Error(`Invalid Freelancer ID format: ${freelancerId}`)
//         }

//         setStep(3)
//         setDebugInfo('📝 Step 2: Preparing contract data...')

//         // Prepare contract data
//         const contractData = {
//           projectId: project?._id,
//           proposalId: proposal?._id,
//           freelancerId: freelancerId,
//           clientId: clientId,
//           title: values.title,
//           description: values.description,
//           budget: parseFloat(values.budget),
//           startDate: values.startDate,
//           deadline: values.deadline,
//           terms: values.terms,
//         }

//         console.log('📤 DEBUG - Contract data to send:', JSON.stringify(contractData, null, 2))

//         setStep(4)
//         setDebugInfo('🔄 Step 3: Creating contract in database...')

//         // Create contract
//         const response = await contractAPI.create(contractData)
//         console.log('✅ DEBUG - Contract creation response:', response)

//         if (!response.data?.success) {
//           throw new Error(response.data?.message || 'Contract creation failed')
//         }

//         console.log('✅ DEBUG - Contract ID:', response.data?.contract?._id)
//         setDebugInfo('✅ Step 4: Contract created successfully!')
//         setStep(5)



//         setDebugInfo('🎉 All steps completed! Contract is ready.')
//         toast.success('✅ Contract created successfully!')

//         // Call success callback
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(response.data.contract || response.data.data)
//         }

//         // Close modal after delay
//         setTimeout(() => {
//           onClose()
//         }, 2000)

//       } catch (err) {
//         console.error('❌ Contract creation error:', err)

//         // Detailed error handling
//         let errorMessage = 'Failed to create contract. Please try again.'

//         if (err.response?.data?.message) {
//           errorMessage = err.response.data.message
//           setDebugInfo(`❌ Error: ${err.response.data.message}`)

//           if (err.response.data.missing) {
//             errorMessage += ` Missing: ${err.response.data.missing.join(', ')}`
//           }
//         } else if (err.response?.data?.error) {
//           errorMessage = err.response.data.error
//           setDebugInfo(`❌ Error: ${err.response.data.error}`)
//         } else if (err.message) {
//           errorMessage = err.message
//           setDebugInfo(`❌ Error: ${err.message}`)
//         }

//         toast.error(errorMessage)

//         // Log full error for debugging
//         if (err.response?.data) {
//           console.error('Server response:', err.response.data)
//         }
//       } finally {
//         setLoading(false)
//       }
//     },
//   })

//   // Update deadline when start date changes
//   useEffect(() => {
//     if (formik.values.startDate && !formik.touched.deadline) {
//       const startDate = new Date(formik.values.startDate)
//       startDate.setDate(startDate.getDate() + 30)
//       const defaultDeadline = startDate.toISOString().split('T')[0]
//       formik.setFieldValue('deadline', defaultDeadline, false)
//     }
//   }, [formik.values.startDate, formik.touched.deadline])

//   const getOtherPartyName = () => {
//     if (!proposal?.freelancerId) return 'Freelancer'
//     return typeof proposal.freelancerId === 'object' 
//       ? proposal.freelancerId.name 
//       : 'Freelancer'
//   }

//   // Check if required data is available
//   if (!project || !proposal) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//           <div className="text-center">
//             <div className="text-red-500 text-5xl mb-4">⚠️</div>
//             <h3 className="text-xl font-bold text-gray-900 mb-2">Missing Data</h3>
//             <p className="text-gray-600 mb-4">
//               Project or proposal data is missing. Please try again.
//             </p>
//             <button
//               onClick={onClose}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Helper function to extract ID from nested object
//   const extractId = (obj, fieldName) => {
//     if (!obj) return null;

//     if (typeof obj === 'string') {
//       return obj;
//     }

//     if (obj._id) {
//       return obj._id;
//     }

//     if (obj.id) {
//       return obj.id;
//     }

//     // Try to get the field directly
//     if (obj[fieldName]) {
//       return extractId(obj[fieldName], '_id');
//     }

//     return null;
//   }

//   const clientId = extractId(project, 'clientId') || extractId(project, 'client');
//   const freelancerId = extractId(proposal, 'freelancerId');

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h3 className="text-2xl font-bold text-gray-900">Create Contract</h3>
//               <p className="text-gray-600 mt-1">
//                 Creating contract with {getOtherPartyName()}
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-500 p-1"
//               disabled={loading}
//             >
//               <FiX className="w-6 h-6" />
//             </button>
//           </div>

//           {/* Debug Info & Progress */}
//           <div className="mb-6">
//             <div className="flex items-center justify-between mb-2">
//               <h4 className="text-sm font-semibold text-gray-700">Creation Progress</h4>
//               <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                 Step {step} of 7
//               </span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
//               <div 
//                 className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
//                 style={{ width: `${(step / 7) * 100}%` }}
//               ></div>
//             </div>
//             {debugInfo && (
//               <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                 <div className="flex items-start">
//                   <FiDatabase className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
//                   <div className="text-sm text-blue-800 font-mono whitespace-pre-line">{debugInfo}</div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ID Debug Section */}
//           <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//             <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center">
//               <FiKey className="w-4 h-4 mr-2" />
//               ID Debug Information
//             </h4>
//             <div className="grid grid-cols-2 gap-4 text-xs">
//               <div>
//                 <div className="text-gray-500 mb-1">Client ID Status:</div>
//                 <div className={`px-2 py-1 rounded ${clientId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                   {clientId ? `✅ Found: ${clientId.slice(-6)}` : '❌ Missing'}
//                 </div>
//                 <div className="text-gray-500 mt-1 text-xs">
//                   Source: {project?.clientId ? 'clientId' : project?.client ? 'client' : 'unknown'}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-gray-500 mb-1">Freelancer ID Status:</div>
//                 <div className={`px-2 py-1 rounded ${freelancerId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                   {freelancerId ? `✅ Found: ${freelancerId.slice(-6)}` : '❌ Missing'}
//                 </div>
//               </div>
//               <div className="col-span-2">
//                 <button
//                   onClick={() => {
//                     console.log('🔍 Project structure:', project);
//                     console.log('🔍 Proposal structure:', proposal);
//                     console.log('🔍 Extracted IDs:', { clientId, freelancerId });
//                     console.log('🔍 Project clientId field:', project?.clientId);
//                     console.log('🔍 Project client field:', project?.client);
//                     console.log('🔍 Proposal freelancerId field:', proposal?.freelancerId);
//                     toast.info('Project data logged to console');
//                   }}
//                   className="w-full px-3 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-sm"
//                 >
//                   Log Data to Console (F12)
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Data Preview */}
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
//             <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Preview</h4>
//             <div className="grid grid-cols-2 gap-3 text-xs">
//               <div>
//                 <span className="text-gray-500">Project:</span>
//                 <span className="ml-2 font-medium">{project?.title?.substring(0, 30)}...</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Proposal:</span>
//                 <span className="ml-2 font-medium">${proposal?.bidAmount}</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Client:</span>
//                 <span className="ml-2 font-medium">{project?.client?.name || project?.clientId?.name || 'Unknown'}</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Freelancer:</span>
//                 <span className="ml-2 font-medium">{proposal?.freelancerId?.name || 'Unknown'}</span>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={formik.handleSubmit}>
//             <div className="space-y-6">
//               {/* Project Summary */}
//               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                 <div className="flex items-center justify-between mb-2">
//                   <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Project Details</h4>
//                   <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     #{project?._id?.slice(-6) || 'N/A'}
//                   </span>
//                 </div>
//                 <h5 className="text-lg font-medium text-gray-900">{project?.title || 'No Title'}</h5>
//                 <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project?.description || 'No description'}</p>
//                 <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
//                   <span className="flex items-center">
//                     <FiDollarSign className="w-3 h-3 mr-1" />
//                     Budget: ${project?.budget || 'N/A'}
//                   </span>
//                   <span>•</span>
//                   <span>Category: {project?.category || 'N/A'}</span>
//                 </div>
//               </div>

//               {/* Freelancer Info */}
//               <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//                 <div className="flex items-center justify-between mb-2">
//                   <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Selected Freelancer</h4>
//                   <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Selected</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 border-2 border-white">
//                     {proposal?.freelancerId?.avatar ? (
//                       <img 
//                         src={proposal.freelancerId.avatar} 
//                         alt={proposal.freelancerId.name}
//                         className="w-12 h-12 rounded-full object-cover"
//                       />
//                     ) : (
//                       <FiUser className="w-6 h-6 text-blue-600" />
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <h5 className="font-semibold text-blue-900">{getOtherPartyName()}</h5>
//                     <div className="flex flex-wrap gap-2 mt-1">
//                       <span className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200">
//                         Bid: ${proposal?.bidAmount || 'N/A'}
//                       </span>
//                       <span className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200">
//                         Timeline: {proposal?.estimatedTime || 'N/A'}
//                       </span>
//                       <span className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200">
//                         Status: {proposal?.status || 'pending'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 {proposal?.message && (
//                   <div className="mt-3 pt-3 border-t border-blue-200">
//                     <p className="text-sm text-blue-800 italic">"{proposal.message.substring(0, 150)}..."</p>
//                   </div>
//                 )}
//               </div>

//               {/* Contract Form */}
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Contract Title *
//                   </label>
//                   <input
//                     type="text"
//                     name="title"
//                     value={formik.values.title}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       formik.touched.title && formik.errors.title
//                         ? 'border-red-300 ring-2 ring-red-200'
//                         : 'border-gray-300'
//                     }`}
//                     placeholder="e.g., Website Development Contract"
//                     disabled={loading}
//                   />
//                   {formik.touched.title && formik.errors.title && (
//                     <p className="mt-2 text-sm text-red-600 flex items-center">
//                       <FiAlertCircle className="w-4 h-4 mr-1" />
//                       {formik.errors.title}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Contract Description *
//                   </label>
//                   <textarea
//                     name="description"
//                     rows="4"
//                     value={formik.values.description}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       formik.touched.description && formik.errors.description
//                         ? 'border-red-300 ring-2 ring-red-200'
//                         : 'border-gray-300'
//                     }`}
//                     placeholder="Describe in detail what work will be completed..."
//                     disabled={loading}
//                   />
//                   {formik.touched.description && formik.errors.description && (
//                     <p className="mt-2 text-sm text-red-600 flex items-center">
//                       <FiAlertCircle className="w-4 h-4 mr-1" />
//                       {formik.errors.description}
//                     </p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <div className="flex items-center">
//                         <FiDollarSign className="w-4 h-4 mr-2 text-green-600" />
//                         Contract Budget ($) *
//                       </div>
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                       <input
//                         type="number"
//                         name="budget"
//                         value={formik.values.budget}
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                           formik.touched.budget && formik.errors.budget
//                             ? 'border-red-300 ring-2 ring-red-200'
//                             : 'border-gray-300'
//                         }`}
//                         placeholder="0.00"
//                         step="0.01"
//                         min="1"
//                         disabled={loading}
//                       />
//                     </div>
//                     {formik.touched.budget && formik.errors.budget && (
//                       <p className="mt-2 text-sm text-red-600 flex items-center">
//                         <FiAlertCircle className="w-4 h-4 mr-1" />
//                         {formik.errors.budget}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <div className="flex items-center">
//                         <FiCalendar className="w-4 h-4 mr-2 text-purple-600" />
//                         Start Date *
//                       </div>
//                     </label>
//                     <input
//                       type="date"
//                       name="startDate"
//                       value={formik.values.startDate}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       min={new Date().toISOString().split('T')[0]}
//                       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                         formik.touched.startDate && formik.errors.startDate
//                           ? 'border-red-300 ring-2 ring-red-200'
//                           : 'border-gray-300'
//                       }`}
//                       disabled={loading}
//                     />
//                     {formik.touched.startDate && formik.errors.startDate && (
//                       <p className="mt-2 text-sm text-red-600 flex items-center">
//                         <FiAlertCircle className="w-4 h-4 mr-1" />
//                         {formik.errors.startDate}
//                     </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <div className="flex items-center">
//                         <FiClock className="w-4 h-4 mr-2 text-orange-600" />
//                         Deadline *
//                       </div>
//                     </label>
//                     <input
//                       type="date"
//                       name="deadline"
//                       value={formik.values.deadline}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       min={formik.values.startDate}
//                       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                         formik.touched.deadline && formik.errors.deadline
//                           ? 'border-red-300 ring-2 ring-red-200'
//                           : 'border-gray-300'
//                       }`}
//                       disabled={loading}
//                     />
//                     {formik.touched.deadline && formik.errors.deadline && (
//                       <p className="mt-2 text-sm text-red-600 flex items-center">
//                         <FiAlertCircle className="w-4 h-4 mr-1" />
//                         {formik.errors.deadline}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Terms and Conditions *
//                   </label>
//                   <textarea
//                     name="terms"
//                     rows="8"
//                     value={formik.values.terms}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
//                       formik.touched.terms && formik.errors.terms
//                         ? 'border-red-300 ring-2 ring-red-200'
//                         : 'border-gray-300'
//                     }`}
//                     placeholder="Enter the terms and conditions of this contract..."
//                     disabled={loading}
//                   />
//                   {formik.touched.terms && formik.errors.terms && (
//                     <p className="mt-2 text-sm text-red-600 flex items-center">
//                       <FiAlertCircle className="w-4 h-4 mr-1" />
//                       {formik.errors.terms}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Important Notes */}
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                 <h4 className="text-sm font-semibold text-yellow-800 uppercase tracking-wide mb-3 flex items-center">
//                   <FiAlertCircle className="w-4 h-4 mr-2" />
//                   Important Notes
//                 </h4>
//                 <ul className="space-y-2 text-sm text-yellow-700">
//                   <li className="flex items-start">
//                     <span className="mr-2 text-yellow-600">•</span>
//                     <span>Creating this contract will automatically assign the project to this freelancer</span>
//                   </li>
//                   <li className="flex items-start">
//                     <span className="mr-2 text-yellow-600">•</span>
//                     <span>The proposal status will be changed to "accepted"</span>
//                   </li>
//                   <li className="flex items-start">
//                     <span className="mr-2 text-yellow-600">•</span>
//                     <span>The project status will be changed to "In Progress"</span>
//                   </li>
//                   <li className="flex items-start">
//                     <span className="mr-2 text-yellow-600">•</span>
//                     <span>The freelancer will need to accept the contract before it becomes active</span>
//                   </li>
//                   <li className="flex items-start">
//                     <span className="mr-2 text-yellow-600">•</span>
//                     <span>Both parties will be notified about the contract creation</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading || !clientId || !freelancerId}
//                 className={`px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors ${
//                   !clientId || !freelancerId
//                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
//                 }`}
//                 title={!clientId || !freelancerId ? "Missing required IDs. Check debug section above." : "Create contract"}
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     Creating Contract...
//                   </>
//                 ) : (
//                   <>
//                     <FiCheck className="w-5 h-5 mr-2" />
//                     {!clientId || !freelancerId ? 'Missing IDs' : 'Create Contract'}
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CreateContractModal







// src/components/contracts/CreateContractModal.jsx
import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { contractAPI, proposalAPI, projectAPI, chatAPI } from '../../services/api' // Added chatAPI
import { toast } from 'react-toastify'
import { FiX, FiCalendar, FiDollarSign, FiCheck, FiClock, FiUser, FiAlertCircle, FiDatabase, FiKey, FiMessageCircle } from 'react-icons/fi'

const CreateContractModal = ({ project, proposal, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const [step, setStep] = useState(1)
  const [establishmentSteps, setEstablishmentSteps] = useState([])

  const calculateDefaultDeadline = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Contract title is required')
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .test('not-empty', 'Description cannot be empty', function (value) {
        return value && value.trim().length >= 10;
      }),
    budget: Yup.number()
      .typeError('Budget must be a number')
      .positive('Budget must be a positive number')
      .min(1, 'Budget must be at least $1')
      .max(1000000, 'Budget cannot exceed $1,000,000')
      .required('Budget is required')
      .test('is-valid', 'Budget is required and must be a valid number', function (value) {
        if (value === null || value === undefined || value === '') return false;
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue > 0;
      }),
    startDate: Yup.string()
      .required('Start date is required')
      .test('is-valid-date', 'Start date must be a valid date', function (value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      })
      .test('not-past', 'Start date cannot be in the past', function (value) {
        if (!value) return true;
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = new Date(value);
          if (isNaN(selectedDate.getTime())) return false;
          selectedDate.setHours(0, 0, 0, 0);
          return selectedDate >= today;
        } catch (e) {
          return false;
        }
      }),
    deadline: Yup.string()
      .required('Deadline is required')
      .test('is-valid-date', 'Deadline must be a valid date', function (value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      })
      .test('after-start', 'Deadline must be after start date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        try {
          const deadlineDate = new Date(value);
          const startDateObj = new Date(startDate);
          if (isNaN(deadlineDate.getTime()) || isNaN(startDateObj.getTime())) return false;
          deadlineDate.setHours(0, 0, 0, 0);
          startDateObj.setHours(0, 0, 0, 0);
          return deadlineDate >= startDateObj;
        } catch (e) {
          return false;
        }
      }),
    terms: Yup.string()
      .required('Terms and conditions are required')
      .min(20, 'Terms must be at least 20 characters'),
  })

  const formik = useFormik({
    initialValues: {
      title: project?.title || '',
      description: proposal?.message || proposal?.description || '',
      budget: proposal?.bidAmount || project?.budget || '',
      startDate: new Date().toISOString().split('T')[0],
      deadline: calculateDefaultDeadline(),
      terms: `CONTRACT TERMS AND CONDITIONS

1. SCOPE OF WORK
The freelancer agrees to complete the work as described in the project proposal: "${project?.title}"

2. PAYMENT
The client agrees to pay $${proposal?.bidAmount || '[Amount]'} upon satisfactory completion of the work.
Payment will be made within 7 days of project completion.

3. TIMELINE
Work to be completed by ${calculateDefaultDeadline()}. Any delays must be communicated in advance.

4. REVISIONS
Includes up to 3 rounds of revisions. Additional revisions may incur extra charges.

5. COMMUNICATION
Both parties agree to maintain professional communication throughout the project.

6. INTELLECTUAL PROPERTY
All work produced becomes the property of the client upon full payment.

7. CONFIDENTIALITY
Both parties agree to keep project details confidential.

8. TERMINATION
Either party may terminate with 7 days written notice.

9. DISPUTE RESOLUTION
Any disputes will be resolved through mediation before legal action.

10. GOVERNING LAW
This contract is governed by the laws of the client's jurisdiction.`,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, formikHelpers) => {
      // Debug: Log validation state
      console.log('🔍 Form submission - Values:', values);
      console.log('🔍 Form submission - Validation errors:', formikHelpers.errors);

      setLoading(true)
      setStep(1)
      setEstablishmentSteps([])

      try {
        // Step 1: Extract IDs
        setStep(1)
        setEstablishmentSteps(prev => [...prev, '🔍 Extracting user IDs...'])

        let clientId = null;
        let freelancerId = null;

        // Helper function to extract ID
        const extractId = (obj) => {
          if (!obj) return null;
          if (typeof obj === 'string') return obj;
          if (obj._id) return obj._id;
          if (obj.id) return obj.id;
          return null;
        };

        // Extract clientId
        if (project?.clientId) {
          clientId = extractId(project.clientId);
        } else if (project?.client) {
          clientId = extractId(project.client);
        }

        // Extract freelancerId
        if (proposal?.freelancerId) {
          freelancerId = extractId(proposal.freelancerId);
        }

        setEstablishmentSteps(prev => [...prev, `✅ Client ID: ${clientId ? 'Found' : 'Missing'}`])
        setEstablishmentSteps(prev => [...prev, `✅ Freelancer ID: ${freelancerId ? 'Found' : 'Missing'}`])

        if (!clientId || !freelancerId) {
          throw new Error('Missing required user IDs. Please check project and proposal data.')
        }

        // Validate MongoDB ObjectId format
        const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id)
        if (!isValidObjectId(clientId) || !isValidObjectId(freelancerId)) {
          throw new Error('Invalid user ID format')
        }

        setStep(2)
        setEstablishmentSteps(prev => [...prev, '📝 Preparing contract data...'])

        // Prepare contract data
        const contractData = {
          projectId: project?._id,
          proposalId: proposal?._id,
          freelancerId: freelancerId,
          clientId: clientId,
          title: values.title,
          description: values.description,
          budget: values.budget ? parseFloat(values.budget) : (proposal?.bidAmount || project?.budget || 0),
          startDate: values.startDate,
          deadline: values.deadline,
          terms: values.terms,
        }

        console.log('📤 Sending contract data to backend:', contractData);

        setStep(3)
        setEstablishmentSteps(prev => [...prev, '🔄 Creating contract in database...'])

        // Step 1: Create contract
        const contractResponse = await contractAPI.create(contractData)
        const contract = contractResponse.data?.contract || contractResponse.data?.data

        if (!contract) {
          throw new Error('Contract creation failed - no contract returned')
        }

        setEstablishmentSteps(prev => [...prev, `✅ Contract created (ID: ${contract._id?.slice(-6)})`])
        setStep(4)

        // Step 2: Update proposal status to "accepted"
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
          // Continue with other steps even if this fails
        }

        setStep(5)

        // Step 3: Update project status and assign freelancer
        setEstablishmentSteps(prev => [...prev, '🎯 Updating project assignment...'])
        try {
          await projectAPI.update(project._id, {
            status: 'in progress',
            assignedTo: freelancerId,
            contractId: contract._id
          })
          setEstablishmentSteps(prev => [...prev, '✅ Project assigned and marked "in progress"'])
        } catch (err) {
          console.error('Error updating project:', err)
          setEstablishmentSteps(prev => [...prev, '⚠️ Could not update project status'])
          // Continue with other steps even if this fails
        }

        setStep(6)

        // Step 4: Create chat for communication
        setEstablishmentSteps(prev => [...prev, '💬 Setting up communication channel...'])
        try {
          const chatData = {
            contractId: contract._id,
            participants: [clientId, freelancerId],
            title: `Chat for: ${values.title}`,
            isActive: true
          }

          await chatAPI.createOrGetContractChat(chatData)
          setEstablishmentSteps(prev => [...prev, '✅ Communication channel created'])
        } catch (err) {
          console.error('Error creating chat:', err)
          setEstablishmentSteps(prev => [...prev, '⚠️ Could not create chat (but contract is established)'])
          // Continue even if chat creation fails
        }

        setStep(7)

        // Step 5: Send notification/email
        setEstablishmentSteps(prev => [...prev, '📧 Sending notifications...'])
        try {
          // Here you would call your notification API
          // For now, we'll just simulate it
          setTimeout(() => {
            setEstablishmentSteps(prev => [...prev, '✅ Notifications sent to both parties'])
          }, 500)
        } catch (err) {
          console.error('Error sending notifications:', err)
          setEstablishmentSteps(prev => [...prev, '⚠️ Notifications failed (but contract is established)'])
        }

        setEstablishmentSteps(prev => [...prev, '🎉 Contract fully established!'])

        toast.success(
          <div>
            <div className="font-semibold">✅ Contract Established Successfully!</div>
            <div className="text-sm mt-1">Freelancer has been notified and chat is ready.</div>
          </div>,
          { autoClose: 5000 }
        )

        // Call success callback with all data
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess({
            contract,
            projectId: project._id,
            proposalId: proposal._id,
            freelancerId,
            clientId
          })
        }

        // Auto-close after delay
        setTimeout(() => {
          onClose()
        }, 3000)

      } catch (err) {
        console.error('❌ Contract establishment error:', err)
        console.error('❌ Error response:', err.response?.data)
        console.error('❌ Error status:', err.response?.status)

        let errorMessage = 'Failed to establish contract. Please try again.'
        let errorDetails = ''

        if (err.response?.data) {
          // Backend returned an error response
          if (err.response.data.message) {
            errorMessage = err.response.data.message
          }
          if (err.response.data.missing && Array.isArray(err.response.data.missing)) {
            errorDetails = `Missing fields: ${err.response.data.missing.join(', ')}`
          }
          if (err.response.data.error) {
            errorDetails = err.response.data.error
          }
          if (err.response.data.details) {
            errorDetails = JSON.stringify(err.response.data.details)
          }

          setEstablishmentSteps(prev => [...prev, `❌ Error: ${errorMessage}`, errorDetails ? `Details: ${errorDetails}` : ''])
        } else if (err.message) {
          errorMessage = err.message
          setEstablishmentSteps(prev => [...prev, `❌ Error: ${err.message}`])
        }

        toast.error(
          <div>
            <div className="font-semibold">{errorMessage}</div>
            {errorDetails && <div className="text-sm mt-1">{errorDetails}</div>}
          </div>,
          { autoClose: 5000 }
        )
      } finally {
        setLoading(false)
      }
    },
  })

  // Update deadline when start date changes
  useEffect(() => {
    if (formik.values.startDate && !formik.touched.deadline) {
      const startDate = new Date(formik.values.startDate)
      startDate.setDate(startDate.getDate() + 30)
      const defaultDeadline = startDate.toISOString().split('T')[0]
      formik.setFieldValue('deadline', defaultDeadline, false)
    }
  }, [formik.values.startDate, formik.touched.deadline])

  const getOtherPartyName = () => {
    if (!proposal?.freelancerId) return 'Freelancer'
    return typeof proposal.freelancerId === 'object'
      ? proposal.freelancerId.name
      : 'Freelancer'
  }

  // Helper function to extract ID from nested object
  const extractId = (obj, fieldName) => {
    if (!obj) return null;

    if (typeof obj === 'string') {
      return obj;
    }

    if (obj._id) {
      return obj._id;
    }

    if (obj.id) {
      return obj.id;
    }

    // Try to get the field directly
    if (obj[fieldName]) {
      return extractId(obj[fieldName], '_id');
    }

    return null;
  }

  const clientId = extractId(project, 'clientId') || extractId(project, 'client');
  const freelancerId = extractId(proposal, 'freelancerId');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Establish Contract</h3>
              <p className="text-gray-600 mt-1">
                Creating contract with {getOtherPartyName()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-1"
              disabled={loading}
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Validation Errors Summary */}
          {Object.keys(formik.errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-2" />
                Please fix the following errors:
              </h4>
              <ul className="space-y-1 text-sm text-red-700">
                {Object.entries(formik.errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>{field}:</strong> {error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}



          {/* ID Validation Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">

              Contract Readiness Check
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${clientId ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
                  }`}>
                  {clientId ? (
                    <FiUser className="w-8 h-8 text-green-600" />
                  ) : (
                    <FiAlertCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div className="text-sm font-medium">Client</div>
                <div className={`text-xs ${clientId ? 'text-green-600' : 'text-red-600'}`}>
                  {clientId ? '✅ Ready' : '❌ Missing'}
                </div>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${freelancerId ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
                  }`}>
                  {freelancerId ? (
                    <FiUser className="w-8 h-8 text-green-600" />
                  ) : (
                    <FiAlertCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div className="text-sm font-medium">Freelancer</div>
                <div className={`text-xs ${freelancerId ? 'text-green-600' : 'text-red-600'}`}>
                  {freelancerId ? '✅ Ready' : '❌ Missing'}
                </div>
              </div>
            </div>


          </div>

          {/* What will happen section */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
              <FiMessageCircle className="w-4 h-4 mr-2" />
              What will happen when you click "Establish Contract":
            </h4>
            <ol className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start">
                <span className="mr-2 text-purple-600 font-bold">1.</span>
                <span><strong>Contract created</strong> with all terms and conditions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-600 font-bold">2.</span>
                <span><strong>Proposal status changed</strong> to "accepted"</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-600 font-bold">3.</span>
                <span><strong>Project assigned</strong> to selected freelancer</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-600 font-bold">4.</span>
                <span><strong>Communication channel created</strong> for direct messaging</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-600 font-bold">5.</span>
                <span><strong>Both parties notified</strong> about the new contract</span>
              </li>
            </ol>
          </div>

          {/* Main Form */}
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
              {/* Project Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Project Details</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    #{project?._id?.slice(-6) || 'N/A'}
                  </span>
                </div>
                <h5 className="text-lg font-medium text-gray-900">{project?.title || 'No Title'}</h5>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project?.description || 'No description'}</p>
              </div>

              {/* Contract Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.touched.title && formik.errors.title
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Description *
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.touched.description && formik.errors.description
                      ? 'border-red-300 ring-2 ring-red-200'
                      : 'border-gray-300'
                      }`}
                    placeholder="Describe in detail what work will be completed..."
                    disabled={loading}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FiAlertCircle className="w-4 h-4 mr-1" />
                      {formik.errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <FiDollarSign className="w-4 h-4 mr-2 text-green-600" />
                        Contract Budget ($) *
                      </div>
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formik.values.budget}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.touched.budget && formik.errors.budget
                        ? 'border-red-300 ring-2 ring-red-200'
                        : 'border-gray-300'
                        }`}
                      placeholder="0.00"
                      step="0.01"
                      min="1"
                      disabled={loading}
                    />
                    {formik.touched.budget && formik.errors.budget && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1" />
                        {formik.errors.budget}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-2 text-purple-600" />
                        Start Date *
                      </div>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formik.values.startDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.touched.startDate && formik.errors.startDate
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-2 text-orange-600" />
                        Deadline *
                      </div>
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formik.values.deadline}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      min={formik.values.startDate}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.touched.deadline && formik.errors.deadline
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
              </div>
            </div>

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
                disabled={loading || !clientId || !freelancerId || !formik.isValid}
                className={`px-6 py-3 rounded-lg font-medium flex items-center transition-all ${!clientId || !freelancerId || !formik.isValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : loading
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg'
                  }`}
                title={!clientId || !freelancerId ? "Missing required IDs. Please check project data." : !formik.isValid ? "Please fix validation errors" : "Establish complete contract"}
                onClick={(e) => {
                  // Force validation before submit
                  formik.validateForm().then(() => {
                    if (!formik.isValid) {
                      console.log('❌ Validation errors:', formik.errors);
                      toast.error('Please fix all validation errors before submitting');
                    }
                  });
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Establishing Contract...
                  </>
                ) : (
                  <>

                    {!clientId || !freelancerId ? 'Missing Data' : 'Establish Contract'}
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

export default CreateContractModal