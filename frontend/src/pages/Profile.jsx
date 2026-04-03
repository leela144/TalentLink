// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { userAPI } from '../services/api'
import Layout from '../components/Layout/Layout'
import { toast } from 'react-toastify'
import {
  FiUser,
  FiMail,
  FiBriefcase,
  FiDollarSign,
  FiEdit2,
  FiSave,
  FiX,
  FiUpload,
  FiStar,
  FiCalendar,
  FiCheck,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiShield
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const ProfileHeader = ({ user, editMode, setEditMode, handleSubmit, loading, handlePhotoUpload, photoUploading }) => {

  return (
    <div className="relative">
      <div className="h-40 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>

        <div className="absolute top-4 right-4 flex gap-2">
          {editMode ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditMode(false)
                  setFormData({
                    name: user.name || '',
                    bio: user.bio || '',
                    skills: user.skills || [],
                    hourlyRate: user.hourlyRate || '',
                  })
                }}
                className="flex items-center px-4 py-2 bg-white/95 text-gray-800 rounded-xl hover:bg-white shadow-xl backdrop-blur-sm border border-white/20"
              >
                <FiX className="w-4 h-4 mr-2" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 shadow-xl"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditMode(true)}
              className="flex items-center px-4 py-2 bg-white/95 text-gray-800 rounded-xl hover:bg-white shadow-xl backdrop-blur-sm border border-white/20"
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </motion.button>
          )}
        </div>
      </div>

      <div className="absolute -bottom-20 left-6 md:left-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="w-40 h-40 rounded-3xl border-[6px] border-white bg-gradient-to-br from-blue-100 to-indigo-100 shadow-2xl flex items-center justify-center overflow-hidden">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center">
                <FiUser className="w-20 h-20 text-blue-600 opacity-80" />
              </div>
            )}
          </div>

          {editMode && (
            <motion.label
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full cursor-pointer shadow-2xl hover:shadow-3xl transition-shadow"
            >
              <FiUpload className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={photoUploading}
              />
            </motion.label>
          )}

          {user.verified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white p-2 rounded-full shadow-2xl"
            >
              <FiCheck className="w-5 h-5" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

const ProfileInfoCard = ({ user, editMode, formData, setFormData }) => {
  const handleHourlyRateChange = (e) => {
    setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-7 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-7 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 font-sans">Account Information</h3>
        <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
          <FiShield className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center text-gray-700">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-sky-100 rounded-xl flex items-center justify-center mr-4">
            <FiMail className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1 font-medium">Email Address</p>
            <div className="flex items-center">
              <p className="font-bold text-gray-900 font-sans text-lg">
                {user.email ? (
                  <>
                    {user.email.split('@')[0].slice(0, 3)}•••@{user.email.split('@')[1]}
                  </>
                ) : 'Not provided'}
              </p>
              {user.emailVerified && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-3 p-1 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                  <FiCheck className="w-4 h-4 text-emerald-600" />
                </motion.div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">Your email is kept private and secure</p>
          </div>
        </div>

        <div className="flex items-center text-gray-700">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mr-4">
            <FiBriefcase className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Account Type</p>
            <p className="font-bold text-gray-900 font-sans text-lg capitalize">{user.role || 'Not specified'}</p>
          </div>
        </div>

        {user.role === 'freelancer' && (
          <div className="relative">
            <div className="flex items-center text-gray-700">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mr-4">
                <FiDollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1 font-medium">Hourly Rate</p>
                {editMode ? (
                  <div className="flex items-center">
                    <span className="mr-3 font-bold text-gray-900 text-lg">$</span>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={handleHourlyRateChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans"
                      placeholder="Enter hourly rate"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ) : (
                  <p className="font-bold text-gray-900 font-sans text-lg">
                    ${user.hourlyRate ? Number(user.hourlyRate).toFixed(2) : 'Not set'}
                  </p>
                )}
              </div>
            </div>
            {!editMode && user.hourlyRate && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="ml-16 mt-3 text-sm text-emerald-600 font-bold flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-2" />
                Competitive rate in the market
              </motion.div>
            )}
          </div>
        )}

        <div className="flex items-center text-gray-700">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-4">
            <FiCalendar className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Member Since</p>
            <p className="font-bold text-gray-900 font-sans text-lg">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const RatingCard = ({ user }) => {
  if (user.role !== 'freelancer' || !user.rating) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mr-3">
              <FiStar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.rating.toFixed(1)}</p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(user.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Based on</p>
            <p className="text-lg font-semibold text-gray-900">
              {user.ratingCount} review{user.ratingCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {user.stats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-yellow-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{user.stats.completedJobs || 0}</div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-1">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                Jobs Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{user.stats.avgResponseTime || 'N/A'}h</div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-1">
                  <FiClock className="w-4 h-4" />
                </div>
                Response Time
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const NameAndRoleDisplay = ({ user, editMode, formData, setFormData }) => {
  const handleNameChange = (e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }))
  }

  return (
    <div className="mb-10">
      {editMode ? (
        <div className="space-y-6">
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            className="text-4xl md:text-5xl font-black text-gray-900 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-indigo-500 w-full pb-3 font-sans placeholder-gray-400"
            placeholder="Enter your full name"
          />
          <div className="flex items-center">
            <span className="text-2xl font-medium text-gray-600 mr-3">Role:</span>
            <span className="px-5 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-xl font-bold text-lg capitalize">
              {user.role}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 font-sans tracking-tight"
          >
            {user.name}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center px-5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 rounded-xl border border-indigo-200"
            >
              <span className="font-bold text-lg capitalize">{user.role}</span>
            </motion.div>

            {user.rating > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center px-5 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 text-gray-800 rounded-2xl shadow-lg border border-amber-200"
              >
                <div className="flex items-center mr-3">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(user.rating) ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <div>
                  <span className="font-bold text-xl">{user.rating.toFixed(1)}</span>
                  <span className="text-gray-600 text-sm ml-1">({user.ratingCount} review{user.ratingCount !== 1 ? 's' : ''})</span>
                </div>
              </motion.div>
            )}

            {user.verified && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center px-5 py-3 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 rounded-2xl shadow-lg border border-emerald-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mr-3">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">Verified Profile</span>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SkillTag = ({ skill, editable, onRemove }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200"
  >
    {skill}
    {editable && (
      <button onClick={() => onRemove(skill)} className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none">
        &times;
      </button>
    )}
  </motion.span>
)

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: [],
    hourlyRate: '',
  })
  const [newSkill, setNewSkill] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills || [],
        hourlyRate: user.hourlyRate || '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        toast.success('Profile updated successfully 🎉')
        setEditMode(false)
      } else {
        toast.error(result.message || 'Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB')
      return
    }
    setPhotoUploading(true)
    try {
      await userAPI.uploadPhoto(file)
      toast.success('Profile photo updated successfully 📸')
      updateProfile({}) // Trigger re-fetch or update
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo')
    } finally {
      setPhotoUploading(false)
    }
  }

  const addSkill = (e) => {
    e.preventDefault()
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  if (!user) return null

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/20 to-purple-50/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-10 border border-gray-100"
          >
            <ProfileHeader
              user={user}
              editMode={editMode}
              setEditMode={setEditMode}
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              loading={loading}
              handlePhotoUpload={handlePhotoUpload}
              photoUploading={photoUploading}
            />

            <div className="pt-28 px-8 md:px-10 pb-10">
              <NameAndRoleDisplay user={user} editMode={editMode} formData={formData} setFormData={setFormData} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center font-sans">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <FiUser className="w-6 h-6 text-indigo-600" />
                      </div>
                      About Me
                    </h3>
                    {editMode ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white/70 font-sans text-lg"
                        placeholder="Tell your story... Share your experience, passion, and what makes you unique..."
                      />
                    ) : (
                      <p className="text-gray-800 leading-relaxed text-lg font-sans">
                        {user.bio || (
                          <span className="text-gray-400 italic font-medium">
                            Add a captivating bio to showcase your personality and expertise...
                          </span>
                        )}
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center font-sans">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                          <FiAward className="w-6 h-6 text-blue-600" />
                        </div>
                        Skills & Expertise
                      </h3>
                      {!editMode && (
                        <span className="px-4 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-xl font-bold">
                          {user.skills?.length || 0} SKILLS
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {editMode ? (
                        <div>
                          <form onSubmit={addSkill} className="flex gap-3 mb-6">
                            <input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Add a skill (e.g., React, UX Design, Python)"
                              className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans text-lg"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="submit"
                              className="px-7 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg"
                            >
                              Add
                            </motion.button>
                          </form>
                          <div className="flex flex-wrap gap-3">
                            {formData.skills.map((skill, index) => (
                              <motion.span
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="inline-flex items-center px-5 py-3 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200"
                              >
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="ml-3 text-blue-500 hover:text-blue-700 focus:outline-none">
                                  &times;
                                </button>
                              </motion.span>
                            ))}
                          </div>
                          {formData.skills.length === 0 && (
                            <p className="text-gray-400 italic text-center py-8 text-lg font-medium">
                              Add your top skills to attract opportunities...
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-4">
                          {user.skills?.length > 0 ? (
                            user.skills.map((skill, index) => (
                              <motion.span
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-6 py-3 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                              >
                                {skill}
                              </motion.span>
                            ))
                          ) : (
                            <div className="text-center w-full py-10">
                              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FiAward className="w-10 h-10 text-gray-400" />
                              </div>
                              <p className="text-gray-500 text-xl font-medium mb-4">No skills added yet</p>
                              <button onClick={() => setEditMode(true)} className="text-indigo-600 hover:text-indigo-700 font-bold text-lg underline">
                                + Add your skills
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <div className="space-y-8">
                  <ProfileInfoCard user={user} editMode={editMode} formData={formData} setFormData={setFormData} />
                  <RatingCard user={user} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default Profile