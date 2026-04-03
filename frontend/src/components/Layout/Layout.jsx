// src/components/layout/Layout.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMenu, FiX, FiHome, FiBriefcase, FiMessageSquare, FiFileText, FiUser, FiLogOut, FiChevronDown, FiSettings, FiLifeBuoy } from 'react-icons/fi'
import NotificationDropdown from '../common/NotificationDropdown'

const Layout = ({ children }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef(null)

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogoutClick = () => {
    setUserDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    logout()
    navigate('/')
    setShowLogoutConfirm(false)
  }

  const navItems = [
    { icon: <FiHome className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FiBriefcase className="w-5 h-5" />, label: 'Projects', path: '/projects' },
    { icon: <FiMessageSquare className="w-5 h-5" />, label: 'Chat', path: '/chat' },
    { icon: <FiFileText className="w-5 h-5" />, label: 'Contracts', path: '/contracts' },
    { icon: <FiUser className="w-5 h-5" />, label: 'Profile', path: '/profile' },
    { icon: <FiLifeBuoy className="w-5 h-5" />, label: 'Support', path: '/support' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full shadow-2xl">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <FiX className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-6 mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg shadow-blue-200">
                  TL
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">TalentLink</h1>
              </div>
              <nav className="mt-5 px-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all ${isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogoutClick}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              >
                <FiLogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col flex-1 pt-8 pb-4 overflow-y-auto bg-white border-r border-gray-100">
            <div className="flex items-center flex-shrink-0 px-8 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg shadow-blue-200">
                TL
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">TalentLink</h1>
            </div>
            <nav className="mt-2 flex-1 px-4 space-y-2">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Menu
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1'
                    }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Mini Profile in Sidebar Bottom - Simplified since top right now has full dropdown */}
            <div className="p-4 mt-auto">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-1">Need Help?</p>
                <p className="text-xs text-blue-600 mb-3">Check our support center or contact us</p>
                <Link to="/support" className="block w-full text-center py-2 bg-white text-blue-600 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                  Support Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 h-full">
        {/* Top bar */}
        <div className="relative z-30 flex-shrink-0 flex h-20 bg-white shadow-sm border-b border-gray-100 px-4 md:px-8">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-800 hidden md:block">
                {user?.role === 'client' ? 'Client Workspace' : 'Freelancer Workspace'}
              </h2>
            </div>
            <div className="ml-4 flex items-center space-x-4">
              <NotificationDropdown />

              <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 group outline-none"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <div className="relative">
                    {user?.profilePhoto ? (
                      <img className="h-10 w-10 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all shadow-sm" src={user.profilePhoto} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <FiChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fadeIn border border-gray-100">
                    <div className="px-4 py-3 bg-gray-50/50 rounded-t-2xl">
                      <p className="text-sm text-gray-900 font-bold truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FiUser className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        {/* Assuming you might have a settings page later */}
                        <FiSettings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        Settings
                      </Link>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogoutClick}
                        className="group flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-2xl"
                      >
                        <FiLogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide p-4 md:p-8">
            <div className="max-w-7xl mx-auto pb-10 min-h-full">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLogOut className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Confirm Logout</h3>
            <p className="text-gray-500 mb-8 text-center leading-relaxed">
              Are you sure you want to log out of your account? You will need to login again to access your workspace.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmLogout}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold shadow-lg shadow-red-200"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout