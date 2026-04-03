// src/contexts/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AuthContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/users/profile')
      setUser(data)
    } catch (err) {
      console.error(err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      navigate('/')
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData)
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      navigate('/')
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/api/users/profile', profileData)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}