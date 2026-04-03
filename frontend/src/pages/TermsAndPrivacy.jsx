import { FiShield, FiFileText, FiLock, FiUserCheck, FiGlobe, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function TermsAndPrivacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="w-full py-4 px-6 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">TL</span>
            </div>
            <span className="text-lg font-bold">TalentLink</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Contact
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <FiShield className="text-blue-600 text-2xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service & Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#terms" className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <FiFileText className="text-blue-600" />
              <span className="font-medium">Terms of Service</span>
            </a>
            <a href="#privacy" className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <FiLock className="text-blue-600" />
              <span className="font-medium">Privacy Policy</span>
            </a>
            <a href="#contact" className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <FiUserCheck className="text-blue-600" />
              <span className="font-medium">Contact Info</span>
            </a>
          </div>
        </div>

        {/* Terms of Service */}
        <section id="terms" className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FiFileText className="mr-3" />
                Terms of Service
              </h2>
            </div>
            
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h3>
                <p className="text-gray-700 mb-3">
                  By accessing and using TalentLink ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">2. User Responsibilities</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span>You must be at least 18 years old to use our services</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span>You are responsible for maintaining the confidentiality of your account</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span>You agree not to use the service for any illegal activities</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span>You must provide accurate and complete information</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">3. Service Modifications</h3>
                <p className="text-gray-700">
                  TalentLink reserves the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">4. Intellectual Property</h3>
                <p className="text-gray-700">
                  All content included on the Platform, such as text, graphics, logos, images, and software, is the property of TalentLink or its content suppliers and protected by international copyright laws.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <FiAlertCircle className="text-yellow-500 text-xl mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-800 font-medium">Important Notice</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section id="privacy" className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FiLock className="mr-3" />
                Privacy Policy
              </h2>
            </div>
            
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-bold text-blue-900 mb-2">Personal Information</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Name and contact information</li>
                      <li>• Email address</li>
                      <li>• Professional information</li>
                      <li>• Profile picture</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <h4 className="font-bold text-green-900 mb-2">Usage Information</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• IP address and browser type</li>
                      <li>• Pages visited and time spent</li>
                      <li>• Device information</li>
                      <li>• Cookies and tracking data</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <FiUserCheck className="text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">Service Delivery</h4>
                    <p className="text-sm text-gray-600 mt-2">To provide and maintain our services</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <FiGlobe className="text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">Communication</h4>
                    <p className="text-sm text-gray-600 mt-2">To send important updates and notifications</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <FiShield className="text-purple-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">Security</h4>
                    <p className="text-sm text-gray-600 mt-2">To protect against fraud and abuse</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">3. Data Protection</h3>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-start mb-4">
                    <FiLock className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">Security Measures</h4>
                      <p className="text-gray-700 mt-1">
                        We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiShield className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">Data Retention</h4>
                      <p className="text-gray-700 mt-1">
                        We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">4. Your Rights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Right to Access</span>
                    <span className="text-sm text-blue-600 font-medium">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Right to Correction</span>
                    <span className="text-sm text-blue-600 font-medium">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Right to Deletion</span>
                    <span className="text-sm text-blue-600 font-medium">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Data Portability</span>
                    <span className="text-sm text-blue-600 font-medium">✓ Available</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <FiGlobe className="text-blue-500 text-xl mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">GDPR Compliance</p>
                    <p className="text-blue-700 text-sm mt-1">
                      We comply with the General Data Protection Regulation (GDPR) and other applicable data protection laws. European users have specific rights regarding their personal data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Questions About Our Policies?</h2>
            <p className="mb-6 opacity-90">
              If you have any questions about our Terms of Service or Privacy Policy, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/contact" 
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Contact Support
              </Link>
              <a 
                href="mailto:legal@talentlink.com" 
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-center"
              >
                Email Legal Team
              </a>
            </div>
          </div>
        </section>

        {/* Policy Updates */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Policy Updates</h3>
          <p className="text-gray-700 mb-4">
            We may update our Terms of Service and Privacy Policy from time to time. We will notify you of any changes by posting the new policies on this page and updating the "Last updated" date.
          </p>
          <div className="flex items-center text-sm text-gray-600">
            <FiAlertCircle className="mr-2" />
            <span>You are advised to review this page periodically for any changes.</span>
          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ↑ Back to Top
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-white">TL</span>
                </div>
                <span className="text-lg font-bold text-gray-900">TalentLink</span>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Connecting talent with opportunities worldwide.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </Link>
              <Link to="/terms" className="text-blue-600 font-medium">
                Terms & Privacy
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} TalentLink. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              This document is provided for informational purposes only and does not constitute legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}