// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import { 
  FiUsers, 
  FiBriefcase, 
  FiShield, 
  FiArrowRight, 
  FiStar, 
  FiTrendingUp,
  FiMessageCircle,
  FiChevronRight,
  FiGlobe,
  FiHome,
  FiHelpCircle,
  FiUser
} from "react-icons/fi";
import { FaRocket, FaRegChartBar } from "react-icons/fa";

const Landing = () => {
  const stats = [
    { value: "10K+", label: "Active Freelancers", icon: <FiUsers className="text-blue-500" /> },
    { value: "5K+", label: "Completed Projects", icon: <FiBriefcase className="text-green-500" /> },
    { value: "98%", label: "Client Satisfaction", icon: <FiStar className="text-yellow-500" /> },
    { value: "$2M+", label: "Paid to Freelancers", icon: <FaRegChartBar className="text-purple-500" /> },
  ];

  const features = [
    {
      icon: <FiGlobe className="w-8 h-8 text-green-600" />,
      title: "Global Reach",
      description: "Connect with clients and talent from around the world",
      color: "bg-green-50 border-green-100"
    },
    {
      icon: <FiMessageCircle className="w-8 h-8 text-purple-600" />,
      title: "Direct Communication",
      description: "Chat directly with clients and freelancers in real-time",
      color: "bg-purple-50 border-purple-100"
    },
    {
      icon: <FiTrendingUp className="w-8 h-8 text-orange-600" />,
      title: "Career Growth",
      description: "Build your portfolio and advance your career",
      color: "bg-orange-50 border-orange-100"
    },
  ];

  const testimonials = [
    {
      content: "TalentLink helped me double my income in just 6 months! The platform is intuitive and the clients are amazing.",
      rating: 5
    },
    {
      content: "Found the perfect developers for our project. The hiring process was smooth and the talent quality outstanding.",
      rating: 5
    },
    {
      content: "As a freelancer, I've never felt more supported. The payment protection gives me peace of mind.",
      rating: 5
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">TL</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TalentLink</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Testimonials
              </a>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 md:py-32 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <FaRocket className="mr-2" /> Join the Future of Work
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Where <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Great Talent</span> Meets <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Amazing Opportunities</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                Connect with top freelancers or find exciting projects that match your skills. 
                Join thousands of professionals building their careers on TalentLink.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 group"
                >
                  Start Your Journey
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-800 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Sign In to Account
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center space-x-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold text-gray-900">2,500+</span> professionals joined this week
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <FiUsers className="w-12 h-12 text-blue-600 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">For Freelancers</h3>
                    <p className="text-sm text-gray-600">Find work that matches your skills</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl">
                    <FiBriefcase className="w-12 h-12 text-indigo-600 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">For Clients</h3>
                    <p className="text-sm text-gray-600">Hire top talent for your projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools and support for freelancers and clients to thrive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className={`p-6 rounded-2xl border ${feature.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our community has to say about their TalentLink experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 flex-grow">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90">
            Join thousands of professionals who have already found success on TalentLink
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-all group"
            >
              Get Started Free
              <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Sign In to Account
            </Link>
          </div>
          <p className="mt-8 text-sm opacity-80">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer - Like Login Page */}
      <footer className="mt-auto py-8 px-6 md:px-8 border-t border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 max-w-7xl mx-auto">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} TalentLink. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <FiHome className="mr-2" />
              Home
            </Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;