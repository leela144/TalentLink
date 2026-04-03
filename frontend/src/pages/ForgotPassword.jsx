// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import emailjs from '@emailjs/browser'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return toast.error('Please enter your email address')

        setLoading(true)
        try {
            // 1. Get Reset Token from Backend
            const { data } = await authAPI.forgotPassword(email)

            if (data.success && data.resetToken) {
                // 2. Send Email using EmailJS
                const resetLink = `${window.location.origin}/reset-password/${data.resetToken}`

                // EMAILJS CONFIGURATION
                const publicKey = "JjxdmsgtiZxt0gq4R";
                const serviceId = "service_72b3w9f";
                const templateId = "template_9i0389r";

                const templateParams = {
                    to_email: email,
                    reset_link: resetLink,
                    message: `We received a request to reset the password for your account. To proceed, please click the link below to create a new password:\n\n${resetLink}\n\nThis link will expire in one hour.\n\nIf you didn't request this password reset, please ignore this email.`
                }

                await emailjs.send(serviceId, templateId, templateParams, publicKey)

                setSuccess(true)
                toast.success('Password reset link sent to your email!')
            } else {
                toast.error('Failed to generate reset token')
            }
        } catch (err) {
            console.error("Forgot Password Error Detailed:", err)

            // Handle EmailJS specific errors
            if (err.status && err.text) {
                toast.error(`Email Delivery Failed: ${err.text} (${err.status})`)
            }
            // Handle Axios/API errors
            else if (err.response?.data?.message) {
                toast.error(err.response.data.message)
            }
            // Generic fallback
            else {
                toast.error(`Error: ${err.message || 'Something went wrong'}`)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 relative overflow-hidden p-6">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-3xl rounded-full mix-blend-overlay animate-blob"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/20 blur-3xl rounded-full mix-blend-overlay animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative z-10 overflow-hidden">
                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl text-blue-600 mb-6">
                            <FiMail className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                        <p className="text-gray-500 text-sm">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-4 animate-bounce">
                                <FiCheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
                            <p className="text-gray-500 mb-8 text-sm">
                                We sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => window.open('https://gmail.com', '_blank')}
                                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Open Email App
                                </button>
                                <div className="pt-2">
                                    <p className="text-sm text-gray-500 mb-2">Didn't receive the email?</p>
                                    <button
                                        onClick={() => { setSuccess(false); setLoading(false); }}
                                        className="text-blue-600 font-medium hover:text-blue-700 text-sm"
                                    >
                                        Click to resend
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <Link to="/login" className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium">
                                    <FiArrowLeft className="w-4 h-4" /> Back to log in
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        placeholder="Enter your email"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all"
                            >
                                {loading ? 'Sending instruction...' : 'Reset Password'}
                            </button>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium">
                                    <FiArrowLeft className="w-4 h-4" /> Back to log in
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
