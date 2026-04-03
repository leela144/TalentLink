// src/pages/About.jsx
import { Link } from "react-router-dom";
import { 
  FiUsers, 
  FiTarget, 
  FiAward, 
  FiGlobe, 
  FiHeart,
  FiChevronRight,
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCode,
  FiDatabase,
  FiLayers,
  FiServer
} from "react-icons/fi";
import { FaRocket, FaHandshake, FaLightbulb, FaChartLine, FaUserTie, FaUserGraduate } from "react-icons/fa";

const About = () => {
  const team = [
    {
      name: "Chandra Sowrya",
      role: "Team lead and Full Stack Developer",
      imageColor: "from-blue-500 to-indigo-600"
    },
    {
      name: "Eswar Sai",
      role: "Full Stack Developer",
      imageColor: "from-green-500 to-teal-600"
    },
    {
      name: "Kasinaidu",
      role: "Full Stack Developer",
      imageColor: "from-purple-500 to-pink-600"
    },
    {
      name: "Manikanta",
      role: "Full Stack Developer",
      bio: "Creates engaging user interfaces and ensures optimal user experience",
      imageColor: "from-orange-500 to-red-600"
    },
    {
      name: "Leela Prabhavi",
      role: "Full Stack Developer",
      imageColor: "from-pink-500 to-rose-600"
    }
  ];

  const teamRoles = [
    {
      icon: <FaUserTie className="text-2xl text-blue-600" />,
      role: "Project Management",
      description: "Planning, coordination, and project oversight"
    },
    {
      icon: <FiCode className="text-2xl text-green-600" />,
      role: "Frontend Development",
      description: "React.js, UI/UX design, and client-side logic"
    },
    {
      icon: <FiServer className="text-2xl text-purple-600" />,
      role: "Backend Development",
      description: "Node.js, Express, and server architecture"
    },
    {
      icon: <FiDatabase className="text-2xl text-yellow-600" />,
      role: "Database Management",
      description: "MongoDB, data modeling, and optimization"
    },
    {
      icon: <FiLayers className="text-2xl text-red-600" />,
      role: "Full Stack Integration",
      description: "End-to-end development and system integration"
    }
  ];;

  const techStack = [
    { name: "React.js", color: "bg-blue-100 text-blue-700" },
    { name: "Node.js", color: "bg-green-100 text-green-700" },
    { name: "Express.js", color: "bg-gray-100 text-gray-700" },
    { name: "MongoDB", color: "bg-emerald-100 text-emerald-700" },
    { name: "Tailwind CSS", color: "bg-cyan-100 text-cyan-700" },
    { name: "Socket.io", color: "bg-orange-100 text-orange-700" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Bar */}
      <nav className="w-full py-4 px-6 md:px-8 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Return to Home Link */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">TL</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">TalentLink</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
            <Link to="/help" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Help
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Meet the <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Team</span> Behind TalentLink
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A dedicated group of developers working together to create the ultimate freelance marketplace. 
              Get to know the people who make TalentLink possible.
            </p>
          </div>

          {/* Team Introduction */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12 mb-16">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-6">
                <FiUsers className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Development Team</h2>
                <p className="text-gray-600">
                  Five passionate developers collaborating to build a seamless freelance platform
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {teamRoles.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.role}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Our Technology Stack</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {techStack.map((tech, index) => (
                  <div key={index} className={`px-4 py-2 rounded-xl font-medium ${tech.color} shadow-sm`}>
                    {tech.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-32 bg-gradient-to-br ${member.imageColor}`}></div>
                  <div className="p-6 text-center -mt-16">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-gray-700">
                      {member.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Description */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white mb-20">
            <div className="max-w-3xl mx-auto text-center">
              <FaRocket className="text-4xl mb-6 mx-auto" />
              <h2 className="text-3xl font-bold mb-6">About TalentLink</h2>
              <p className="text-lg mb-8 opacity-90">
                TalentLink is a comprehensive freelance marketplace built from the ground up by our team. 
                We combined our diverse skills to create a platform that connects talented freelancers with clients worldwide.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold mb-2">5</div>
                  <div className="text-sm opacity-90">Dedicated Developers</div>
                </div>
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold mb-2">8+</div>
                  <div className="text-sm opacity-90">Technologies Used</div>
                </div>
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold mb-2">100%</div>
                  <div className="text-sm opacity-90">Team Collaboration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Want to Know More?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Interested in our work or have questions about TalentLink? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                <FiMail className="mr-2" />
                Contact Us
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-800 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                <FiArrowLeft className="mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} TalentLink. Built with passion by our team.
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                About
              </Link>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;