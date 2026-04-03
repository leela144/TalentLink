import { useState, useEffect } from "react";
import axios from "axios";
import { FiSend, FiUser, FiMail, FiMessageSquare, FiCheckCircle, FiMail as FiMail2, FiHome, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      // Check for token in localStorage (common authentication pattern)
      const token = localStorage.getItem("token");
      // Or check for user data in localStorage/sessionStorage
      const userData = localStorage.getItem("user");
      // You might have different logic based on your auth setup
      setIsLoggedIn(!!token || !!userData);
    };

    checkAuth();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/contact",
        form
      );

      setStatus({ type: "success", message: res.data.message });
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({ 
        type: "error", 
        message: error.response?.data?.message ||
          "Failed to send message. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiMail2 className="text-purple-600 text-xl" />,
      title: "Email Us",
      details: "talentlink58@gmail.com",
      description: "We'll respond within 24 hours"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="w-full py-4 px-6 md:px-8 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Conditional Back Button */}
          <Link 
            to={isLoggedIn ? "/dashboard" : "/"} 
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            onClick={(e) => {
              // Optional: You can also use navigate for more control
              if (isLoggedIn && window.history.length > 1) {
                e.preventDefault();
                navigate(-1); // Go back one page in history
              }
            }}
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>{isLoggedIn ? "Back to Dashboard" : "Back to Home"}</span>
          </Link>

          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">TL</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">TalentLink</span>
          </div>

          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-2 text-gray-600">
            <FiMail2 className="w-4 h-4" />
            <span className="text-sm">talentlink58@gmail.com</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-10 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in <span className="text-blue-600">Touch</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{info.title}</h3>
                      <p className="text-gray-900 font-medium mb-1">{info.details}</p>
                      <p className="text-gray-500 text-sm">{info.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to={isLoggedIn ? "/dashboard" : "/"}
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors group"
                  >
                    <FiHome className="text-blue-600 group-hover:text-blue-700" />
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      {isLoggedIn ? "Go to Dashboard" : "Return to Homepage"}
                    </span>
                  </Link>
                  <a 
                    href="mailto:talentlink58@gmail.com"
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors group"
                  >
                    <FiMail2 className="text-blue-600 group-hover:text-blue-700" />
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">Send Direct Email</span>
                  </a>
                  <Link 
                    to="/about"
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors group"
                  >
                    <FiUser className="text-blue-600 group-hover:text-blue-700" />
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">About Our Team</span>
                  </Link>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-gray-900 text-lg mb-3">Common Questions</h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Response Time:</span> Within 24 hours
                  </li>
                  <li className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Support Hours:</span> 24/7 for urgent issues
                  </li>
                  <li className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Privacy:</span> We respect your data
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form fields remain the same */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                          <FiUser className="inline mr-2 text-gray-400" />
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="John Doe"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                          <FiMail className="inline mr-2 text-gray-400" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                        <FiMessageSquare className="inline mr-2 text-gray-400" />
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        placeholder="Tell us how we can help you..."
                        rows="5"
                        value={form.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="text-lg" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>

                  {status && (
                    <div className={`mt-6 p-4 rounded-xl border ${status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                      <div className="flex items-center">
                        {status.type === "success" ? (
                          <FiCheckCircle className="text-green-500 text-xl mr-3" />
                        ) : null}
                        <span className="font-medium">{status.message}</span>
                      </div>
                    </div>
                  )}

                  {/* Privacy Note */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-600 text-center">
                      By submitting this form, you agree to our{" "}
                      <a href="#" className="text-blue-600 font-medium hover:underline">Privacy Policy</a>
                      {" "}and consent to us contacting you about your inquiry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Return Button */}
              <div className="mt-6 md:hidden">
                <Link 
                  to={isLoggedIn ? "/dashboard" : "/"}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  <FiHome />
                  <span>{isLoggedIn ? "Go to Dashboard" : "Return to Home"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Same as About page */}
      <footer className="mt-auto py-8 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} TalentLink. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Link to={isLoggedIn ? "/dashboard" : "/"} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {isLoggedIn ? "Dashboard" : "Home"}
              </Link>
              <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Contact
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </Link>
              {!isLoggedIn && (
                <>
                  <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}