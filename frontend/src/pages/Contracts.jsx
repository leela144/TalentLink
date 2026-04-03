// src/pages/Contracts.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { contractAPI, chatAPI } from '../services/api'
import Layout from '../components/Layout/Layout'
import ContractCard from '../components/contracts/ContractCard'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiFileText, FiFilter, FiPlus, FiMessageSquare,
  FiCheckCircle, FiAlertCircle, FiClock, FiSearch,
  FiX
} from 'react-icons/fi'

const Contracts = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [initiatingChat, setInitiatingChat] = useState(null)

  // New state for search/filtering
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      console.log('📋 Fetching contracts...')
      const response = await contractAPI.getMyContracts()
      console.log('📦 Contracts API response:', response)

      // Handle different response structures
      const contractsData = response.data?.contracts || response.data?.data || response.data || []

      setContracts(contractsData)
    } catch (err) {
      console.error('❌ Failed to load contracts:', err)
      toast.error('Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  const initiateChat = async (contract) => {
    if (!contract) return;

    try {
      setInitiatingChat(contract._id);

      // Use the new contract chat endpoint
      const { data } = await chatAPI.getContractChat(contract._id);

      if (data.chat) {
        // Navigate to chat with the selected chat
        navigate('/chat', {
          state: {
            selectedChat: data.chat,
            contractId: contract._id
          }
        });

        toast.success('Chat opened successfully');
      } else {
        // Create chat if it doesn't exist
        const chatData = {
          contractId: contract._id
        };

        const { data: newChat } = await chatAPI.accessChat(chatData);
        navigate('/chat', {
          state: {
            selectedChat: newChat,
            contractId: contract._id
          }
        });
        toast.success('New chat created');
      }
    } catch (err) {
      console.error('Failed to initiate chat:', err);

      if (err.response?.status === 403) {
        toast.error('Contract is not active. Chat is read-only.');
      } else {
        toast.error('Failed to start chat. Please try again.');
      }
    } finally {
      setInitiatingChat(null);
    }
  };

  const handleCreateContract = () => {
    navigate('/projects')
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesFilter = filter === 'all' || contract.status === filter
    const matchesSearch = contract.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.freelancer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStats = () => {
    const total = contracts.length
    const active = contracts.filter(c => c.status === 'active').length
    const completed = contracts.filter(c => c.status === 'completed').length
    const pending = contracts.filter(c => c.status === 'pending').length
    const cancelled = contracts.filter(c => c.status === 'cancelled').length

    return { total, active, completed, pending, cancelled }
  }

  const stats = getStats()

  const StatCard = ({ label, value, icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between"
    >
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-xl`}>
        {icon}
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-white opacity-10 rounded-full w-64 h-64 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 p-12 -ml-16 -mb-16 bg-black opacity-10 rounded-full w-64 h-64 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Contracts</h1>
              <p className="text-blue-100 max-w-xl">
                Manage your contracts and agreements.
                {user.role === 'client' ? ' Create contracts from accepted proposals.' : ' View your active contracts.'}
              </p>
            </div>

            <div className="flex gap-3">
              {user.role === 'client' && (
                <button
                  onClick={handleCreateContract}
                  className="px-5 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 flex items-center shadow-lg font-bold transition-transform hover:-translate-y-0.5"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Create Contract
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<FiFileText className="text-blue-600" />}
            color="bg-blue-600"
            delay={0.1}
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={<FiCheckCircle className="text-green-600" />}
            color="bg-green-600"
            delay={0.2}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<FiClock className="text-yellow-600" />}
            color="bg-yellow-600"
            delay={0.3}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<FiFileText className="text-purple-600" />}
            color="bg-purple-600"
            delay={0.4}
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            icon={<FiAlertCircle className="text-red-600" />}
            color="bg-red-600"
            delay={0.5}
          />
        </div>

        {/* Action Panel / Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === value
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chat Info Banner */}
        {stats.active > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-4 text-blue-600">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Chat Feature</h3>
              <p className="text-sm text-blue-700">
                You can chat with users you have active contracts with.
                Click the chat button on any active contract card to start messaging.
              </p>
            </div>
          </motion.div>
        )}

        {/* Contracts List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {filter === 'all' ? 'All Contracts' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Contracts`}
              <span className="ml-2 text-gray-500 text-base font-normal">
                ({filteredContracts.length})
              </span>
            </h2>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredContracts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                  <FiFileText className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No contracts found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {filter === 'all'
                    ? "You don't have any contracts yet."
                    : `No ${filter} contracts found.`}
                </p>
                {user.role === 'client' && filter === 'all' && (
                  <button
                    onClick={handleCreateContract}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 inline-flex items-center shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                  >
                    <FiPlus className="w-5 h-5 mr-2" />
                    Create Your First Contract
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredContracts.map((contract, index) => (
                  <motion.div
                    key={contract._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <ContractCard
                      contract={contract}
                      userRole={user.role}
                      onUpdate={fetchContracts}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}

export default Contracts