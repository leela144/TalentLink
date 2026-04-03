// frontend/src/pages/Help.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { FaRobot, FaPaperPlane, FaLightbulb, FaComments, FaQuestionCircle, FaHeadset, FaStar } from "react-icons/fa";
import { FiHelpCircle, FiMessageSquare, FiChevronRight } from "react-icons/fi";

const QUICK_SUGGESTIONS = [
  "How do I reset my password?",
  "How do I post a job or project?",
  "How can I contact a freelancer?",
  "Where can I see my contracts?",
];

const TIPS = [
  {
    icon: <FaHeadset className="text-blue-600" />,
    title: "Role Context",
    description: "Mention if you're a client or freelancer"
  },
  {
    icon: <FaStar className="text-purple-600" />,
    title: "Be Specific",
    description: "Include which page you're on"
  },
  {
    icon: <FaQuestionCircle className="text-green-600" />,
    title: "Error Details",
    description: "Share any error messages you see"
  }
];
const Support = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm the TalentLink Help Centre bot.\nYou can ask me anything about using TalentLink — or pick a quick question below to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const chatRef = useRef(null);

  const sendMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    const userMessage = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/chatbot/chat",
        { message: trimmed }
      );

      const botAnswer =
        response.data.reply || "Sorry, I could not answer that.";

      const steps = botAnswer.split("\n").filter((s) => s.trim().length > 0);

      for (let step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        setMessages((prev) => [...prev, { sender: "bot", text: step }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Sorry, something went wrong while trying to answer. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Smooth auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] px-6 py-4 rounded-3xl shadow-lg break-words text-sm md:text-base leading-relaxed ${
          message.sender === "bot"
            ? "bg-white text-gray-900 border border-gray-100"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        }`}
      >
        {message.sender === "bot" && (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-3">
              <FaRobot className="text-blue-600 text-sm" />
            </div>
            <span className="text-xs font-medium text-gray-500">Help Bot</span>
          </div>
        )}
        {message.text
          .replace(/\*\*/g, "")
          .split("\n")
          .map((line, idx) => (
            <p key={idx} className="mb-1 last:mb-0">
              {line}
            </p>
          ))}
      </div>
    </div>
  );

  const QuickSuggestionButton = ({ text, onClick, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-200 font-medium text-sm shadow-sm transition-colors"
    >
      {text}
    </button>
  );

  const InfoCard = ({ icon, title, items, color }) => (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 mr-4`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <FiChevronRight className="text-blue-500 mr-2" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const TipCard = ({ tip }) => (
    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
      <div className="p-3 rounded-xl bg-white shadow-sm">
        {tip.icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{tip.title}</h4>
        <p className="text-gray-600 text-xs mt-1">{tip.description}</p>
      </div>
    </div>
  );

  const handleContactHumanSupport = () => {
    navigate("/contact");
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-white opacity-10 rounded-full w-64 h-64 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 p-12 -ml-16 -mb-16 bg-black opacity-10 rounded-full w-64 h-64 blur-3xl"></div>

          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <FiHelpCircle className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Help Centre
              </h1>
              <p className="text-blue-100">
                Get instant answers from our AI assistant or browse common questions
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-xl font-medium shadow-lg ${loading ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30' : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                <span>{loading ? "Bot is typing..." : "Online & Ready"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <FaRobot className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">AI Assistant</h2>
                    <p className="text-gray-500 text-sm">Ask anything about TalentLink</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatRef}
                className="flex-1 px-6 py-4 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-white space-y-4"
              >
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-6 py-4 rounded-3xl bg-white border border-gray-100 shadow-lg flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                      </div>
                      <span className="text-gray-600 text-sm font-medium">Assistant is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Section */}
              <div className="border-t border-gray-100 bg-white px-6 py-4 space-y-4">
                {/* Quick Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((q, index) => (
                    <QuickSuggestionButton
                      key={index}
                      text={q}
                      onClick={() => sendMessage(q)}
                      disabled={loading}
                    />
                  ))}
                </div>

                {/* Input Area */}
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      className="w-full min-h-[44px] max-h-32 px-5 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 text-sm md:text-base resize-none shadow-sm transition-all duration-200"
                      placeholder="Describe your issue or question… (Press Enter to send, Shift+Enter for new line)"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      spellCheck={false}
                      rows="2"
                    />
                    <div className="absolute bottom-3 right-3 text-gray-400 text-xs">
                      ↵ Enter
                    </div>
                  </div>
                  <button
                    className={`px-5 py-3 rounded-2xl font-bold shadow-lg flex items-center space-x-2 transition-all duration-200 ${
                      input.trim() && !loading
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                  >
                    <span>Send</span>
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel - 1/3 width */}
          <div className="space-y-6">
            {/* Tips Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <FaLightbulb />
                </div>
                <h2 className="font-bold text-gray-900 text-xl">Tips for Better Answers</h2>
              </div>
              <div className="space-y-3">
                {TIPS.map((tip, index) => (
                  <TipCard key={index} tip={tip} />
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-4">
                <FaComments className="text-blue-600 text-xl" />
                <h3 className="font-bold text-gray-900">Need More Help?</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                If our AI assistant can't solve your issue, our human support team is ready to help.
              </p>
              <button 
                onClick={handleContactHumanSupport}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transition-all duration-300"
              >
                Contact Human Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;