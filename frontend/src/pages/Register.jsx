// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { FiUser, FiMail, FiLock, FiDollarSign, FiEye, FiEyeOff, FiHome } from 'react-icons/fi'
import SkillSearch from '../components/SkillSearch'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'freelancer',
    skills: [],
    hourlyRate: '',
    bio: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Name validation
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/
    if (!passwordRegex.test(formData.password)) {
      toast.error('Password must be at least 8 characters and include a number and special character')
      return
    }

    // Hourly rate validation for freelancers
    if (formData.role === 'freelancer' && formData.hourlyRate) {
      const rate = parseFloat(formData.hourlyRate)
      if (rate < 5 || rate > 500) {
        toast.error('Hourly rate must be between $5 and $500')
        return
      }
    }

    setLoading(true)
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      skills: formData.skills,
      hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : 0,
      bio: formData.bio.trim()
    }

    const result = await register(userData)
    setLoading(false)

    if (!result.success) {
      toast.error(result.message || 'Registration failed')
    } else {
      toast.success('Account created successfully!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 to-indigo-900 relative overflow-hidden">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 md:px-8 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Home Link */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-white hover:text-blue-100 transition-colors"
          >
            <FiHome className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>

          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">TL</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">TalentLink</span>
          </div>

          {/* Login Link */}
          <Link 
            to="/login" 
            className="text-white hover:text-blue-100 font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-3xl mix-blend-overlay animate-blob"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/20 blur-3xl mix-blend-overlay animate-blob animation-delay-2000"></div>
          <div className="absolute top-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-3xl mix-blend-overlay animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative z-10 overflow-hidden my-10">
          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
                <span className="text-3xl font-bold text-white">TL</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-500">Join our community of professionals</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="John Doe"
                      required
                      minLength={2}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Container Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5" />
                        ) : (
                          <FiEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-1">
                      Must be at least 8 characters with a number and special character
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="h-5 w-5" />
                        ) : (
                          <FiEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 ml-1">I want to join as a</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'client' }))}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      formData.role === 'client'
                        ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-[5px] mr-3 transition-colors ${
                          formData.role === 'client'
                            ? 'border-blue-600 bg-white'
                            : 'border-gray-300 bg-transparent'
                        }`}
                      />
                      <span
                        className={`font-bold text-lg ${
                          formData.role === 'client'
                            ? 'text-blue-800'
                            : 'text-gray-700'
                        }`}
                      >
                        Client
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">
                      Hire professionals for your projects
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'freelancer' }))}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      formData.role === 'freelancer'
                        ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-[5px] mr-3 transition-colors ${
                          formData.role === 'freelancer'
                            ? 'border-blue-600 bg-white'
                            : 'border-gray-300 bg-transparent'
                        }`}
                      />
                      <span
                        className={`font-bold text-lg ${
                          formData.role === 'freelancer'
                            ? 'text-blue-800'
                            : 'text-gray-700'
                        }`}
                      >
                        Freelancer
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">
                      Find work and build your portfolio
                    </p>
                  </button>
                </div>
              </div>

              {/* Freelancer Specific Fields */}
              {formData.role === 'freelancer' && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Hourly Rate ($)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiDollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        min="5"
                        max="500"
                        step="5"
                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        placeholder="e.g., 25"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-1">
                      Suggested: $20-100 per hour
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4 ml-1">
                      Skills
                    </label>
                    <SkillSearch
                      selectedSkills={formData.skills}
                      onAddSkill={handleAddSkill}
                      onRemoveSkill={handleRemoveSkill}
                      placeholder="Search for skills or add custom skills..."
                      maxSuggestions={6}
                      allowCustomSkills={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Bio (Optional)
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                      placeholder="Tell us about yourself, your experience, and what you specialize in..."
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-gray-500 ml-1 text-right">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all mt-8"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              By creating an account, you agree to our{' '}
              <Link
                to="/terms"
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
              >
                Terms
              </Link>
              {' '}and{' '}
              <Link
                to="/terms"
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
              >
                Privacy Policy
              </Link>
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for blob animation */}
      <style>
        {`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}
      </style>
    </div>
  )
}

export default Register