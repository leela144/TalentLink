// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dashboardAPI } from '../services/api'
import Layout from '../components/Layout/Layout'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaProjectDiagram, FaFileContract, FaUserTie, FaStar, FaArrowRight, FaCommentDots, FaUserEdit } from 'react-icons/fa'
import { FiGrid, FiActivity, FiCheckCircle, FiTrendingUp } from 'react-icons/fi'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats()
      setStats(data.stats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon, label, value, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 rounded-bl-3xl ${color}`}>
        {icon}
      </div>
      <div className="flex items-center relative z-10">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-white mr-5 shadow-sm group-hover:scale-110 transition-transform`}>
          {/* Clone icon to apply text color derived from bg class if needed, or just use colored text in parent */}
          <div className="text-2xl text-current">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </motion.div>
  )

  const ClientDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<FaProjectDiagram className="text-blue-600" />}
        label="Total Projects"
        value={stats?.totalProjects || 0}
        color="bg-blue-600"
        delay={0.1}
      />
      <StatCard
        icon={<FiActivity className="text-green-600" />}
        label="Open Projects"
        value={stats?.openProjects || 0}
        color="bg-green-600"
        delay={0.2}
      />
      <StatCard
        icon={<FiTrendingUp className="text-orange-600" />}
        label="In Progress"
        value={stats?.inProgress || 0}
        color="bg-orange-600"
        delay={0.3}
      />
      <StatCard
        icon={<FaFileContract className="text-purple-600" />}
        label="Total Proposals"
        value={stats?.totalProposals || 0}
        color="bg-purple-600"
        delay={0.4}
      />
    </div>
  )

  const FreelancerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<FaFileContract className="text-blue-600" />}
        label="Proposals Sent"
        value={stats?.proposalsSent || 0}
        color="bg-blue-600"
        delay={0.1}
      />
      <StatCard
        icon={<FiCheckCircle className="text-green-600" />}
        label="Accepted"
        value={stats?.proposalsAccepted || 0}
        color="bg-green-600"
        delay={0.2}
      />
      <StatCard
        icon={<FaUserTie className="text-orange-600" />}
        label="Active Contracts"
        value={stats?.activeContracts || 0}
        color="bg-orange-600"
        delay={0.3}
      />
      <StatCard
        icon={<FaStar className="text-yellow-500" />}
        label="Rating"
        value={stats?.averageRating || 'N/A'}
        color="bg-yellow-500"
        delay={0.4}
      />
    </div>
  )

  const QuickActionCard = ({ to, icon, title, description, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <Link
        to={to}
        className="block bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group h-full"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-xl`}>
            {icon}
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FaArrowRight className="w-3 h-3" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </Link>
    </motion.div>
  )

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-dashed rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-white opacity-10 rounded-full w-64 h-64 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 p-12 -ml-16 -mb-16 bg-black opacity-10 rounded-full w-64 h-64 blur-3xl"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome {user?.name}!
            </h1>
            <p className="text-blue-100 max-w-xl">
              Here's what's happening with your projects and proposals today.
            </p>
          </div>

          {user?.role === 'client' && (
            <div className="relative z-10">
              <Link
                to="/projects/create"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-0.5"
              >
                <FiGrid className="mr-2" />
                Create New Project
              </Link>
            </div>
          )}
        </motion.div>

        {/* Stats Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Overview</h2>
          </div>
          {user?.role === 'client' ? <ClientDashboard /> : <FreelancerDashboard />}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionCard
              to="/projects"
              icon={<FaProjectDiagram className="text-blue-600" />}
              title="Browse Projects"
              description={user?.role === 'freelancer' ? 'Find new opportunities and apply to projects that match your skills.' : 'Manage your posted projects and review proposals.'}
              color="bg-blue-600"
              delay={0.5}
            />

            <QuickActionCard
              to="/chat"
              icon={<FaCommentDots className="text-purple-600" />}
              title="Messages"
              description="Communicate with clients or freelancers directly to discuss project details."
              color="bg-purple-600"
              delay={0.6}
            />

            <QuickActionCard
              to="/profile"
              icon={<FaUserEdit className="text-orange-600" />}
              title="Profile"
              description="Update your profile information, skills, and portfolio to stand out."
              color="bg-orange-600"
              delay={0.7}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard