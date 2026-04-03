// src/pages/Projects.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { projectAPI } from '../services/api'
import Layout from '../components/Layout/Layout'
import ProjectCard from '../components/projects/ProjectCard'
import CreateProjectModal from '../components/projects/CreateProjectModal'
import { FiPlus, FiFilter, FiSearch, FiBriefcase, FiCheckCircle, FiClock, FiArchive } from 'react-icons/fi'
import { motion } from 'framer-motion'

const Projects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    filterProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchTerm, statusFilter, categoryFilter])

  const fetchProjects = async () => {
    try {
      let data
      if (user?.role === 'client') {
        const response = await projectAPI.getClientProjects()
        data = response.data?.projects || []
      } else {
        const response = await projectAPI.getOpen()
        data = response.data?.projects || []
      }
      setProjects(data)
      setFilteredProjects(data)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = [...projects]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.category?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Category filter (for clients)
    if (categoryFilter !== 'all' && user?.role === 'client') {
      filtered = filtered.filter(project => project.category === categoryFilter)
    }

    setFilteredProjects(filtered)
  }

  const handleProjectCreated = () => {
    setShowCreateModal(false)
    fetchProjects()
  }

  const getStats = () => {
    const total = projects.length
    const open = projects.filter(p => p.status === 'open').length
    const inProgress = projects.filter(p => p.status === 'in_progress').length
    const completed = projects.filter(p => p.status === 'completed').length
    const closed = projects.filter(p => p.status === 'closed').length

    return { total, open, inProgress, completed, closed }
  }

  const stats = getStats()

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg text-white">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.role === 'client' ? 'My Projects' : 'Available Projects'}
            </h1>
            <p className="text-blue-100 mt-2 text-lg">
              {user?.role === 'client'
                ? 'Manage your projects and track proposals'
                : 'Browse available projects and submit proposals'}
            </p>
          </div>

          {user?.role === 'client' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Create New Project
            </motion.button>
          )}
        </div>

        {/* Stats (for clients only) */}
        {user?.role === 'client' && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard label="Total" value={stats.total} icon={<FiBriefcase />} color="blue" />
            <StatCard label="Open" value={stats.open} icon={<FiCheckCircle />} color="green" />
            <StatCard label="In Progress" value={stats.inProgress} icon={<FiClock />} color="indigo" />
            <StatCard label="Completed" value={stats.completed} icon={<FiCheckCircle />} color="purple" />
            <StatCard label="Closed" value={stats.closed} icon={<FiArchive />} color="gray" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all hover:bg-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-4">
              <div className="flex items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
                <FiFilter className="w-5 h-5 text-gray-500 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Category Filter (clients only) */}
              {user?.role === 'client' && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="web_development">Web Development</option>
                  <option value="mobile_development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="other">Other</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </h2>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search filters'
                  : user?.role === 'client'
                    ? 'You have not created any projects yet'
                    : 'No projects are available at the moment'}
              </p>
              {user?.role === 'client' && !searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  userRole={user?.role}
                  onUpdate={fetchProjects}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </Layout>
  )
}

// Helper Component for Stats
const StatCard = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </motion.div>
  )
}

export default Projects