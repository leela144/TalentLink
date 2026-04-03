import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { chatAPI } from '../services/api'
import socketService from '../services/socket'
import Layout from '../components/Layout/Layout'
import {
  FiSend, FiUser, FiFileText, FiCheckCircle, FiAlertCircle,
  FiDownload, FiTrash2, FiX, FiMessageSquare, FiMoreVertical,
  FiClock, FiFilePlus, FiSearch
} from 'react-icons/fi'
import { Menu, Transition } from '@headlessui/react'
import moment from 'moment'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const Chat = () => {
  const { user, token } = useAuth()
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)
  const [sending, setSending] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [chatSearch, setChatSearch] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchChats()

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [])

  useEffect(() => {
    if (token) {
      // Connect socket with token
      socketService.connect(token)

      // Setup socket listeners
      const handleConnect = () => {
        console.log('Socket connected successfully')
        setSocketConnected(true)
      }

      const handleConnectError = (err) => {
        console.error('Socket connection error:', err)
        setSocketConnected(false)
        toast.error('Connection error. Please refresh.')
      }

      const handleNewMessage = (msg) => {
        console.log('New message received via socket:', msg)
        if (selectedChat && msg.chat === selectedChat._id) {
          setMessages(prev => [...prev, msg])
        }
        // Update chat list with latest message
        setChats(prev => prev.map(chat =>
          chat._id === msg.chat
            ? { ...chat, latestMessage: msg }
            : chat
        ))
      }

      socketService.on('connect', handleConnect)
      socketService.on('connect_error', handleConnectError)
      socketService.on('newMessage', handleNewMessage)

      return () => {
        socketService.off('connect', handleConnect)
        socketService.off('connect_error', handleConnectError)
        socketService.off('newMessage', handleNewMessage)
      }
    }
  }, [token, selectedChat])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id)
      // Join socket room for this chat
      if (socketService.isConnected()) {
        socketService.emit('joinChat', selectedChat._id)
      }
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChats = async () => {
    try {
      setLoading(true)
      const { data } = await chatAPI.getChats()
      // Filter out chats that don't have active contracts
      const validChats = data.filter(chat => {
        const contract = chat.contractId
        return contract
      })
      setChats(validChats)
      if (validChats.length > 0 && !selectedChat) {
        setSelectedChat(validChats[0])
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await chatAPI.getMessages(chatId)
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    }
  }

  const validateChatPermissions = () => {
    if (!selectedChat) return false

    const contract = selectedChat.contractId
    if (!contract) {
      toast.error('No contract associated with this chat')
      return false
    }

    if (contract.status !== 'active') {
      toast.error('Chat is only available for active contracts')
      return false
    }

    return true
  }

  const sendMessage = async (e) => {
    e.preventDefault()

    // Validate permissions before sending
    if (!validateChatPermissions()) return

    if (!newMessage.trim() || sending) return

    const text = newMessage
    setNewMessage('')
    setSending(true)

    // Optimistic message
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      sender: user,
      text,
      chat: selectedChat._id,
      createdAt: new Date(),
      isOptimistic: true
    }

    setMessages(prev => [...prev, optimisticMessage])

    try {
      const { data } = await chatAPI.sendMessage({
        chatId: selectedChat._id,
        text
      })

      // Replace optimistic message with real one
      setMessages(prev =>
        prev.map(msg =>
          msg._id === optimisticMessage._id ? data : msg
        )
      )

      // Update chat list
      setChats(prev => prev.map(chat =>
        chat._id === selectedChat._id
          ? { ...chat, latestMessage: data }
          : chat
      ))

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMsg = error.response?.data?.message || 'Failed to send message'
      toast.error(errorMsg)

      // Remove optimistic message on error
      setMessages(prev =>
        prev.filter(msg => msg._id !== optimisticMessage._id)
      )
    } finally {
      setSending(false)
    }
  }

  const uploadFile = async (file) => {
    // Validate permissions before uploading
    if (!validateChatPermissions()) return

    if (!file) return

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size too large (max 10MB)')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('chatId', selectedChat._id)

    try {
      // Optimistic file message (placeholder)
      const optimisticMessage = {
        _id: `temp-file-${Date.now()}`,
        sender: user,
        file: { name: file.name, url: '#' },
        chat: selectedChat._id,
        createdAt: new Date(),
        isOptimistic: true,
        text: 'Uploading file...'
      }
      setMessages(prev => [...prev, optimisticMessage])

      const { data } = await chatAPI.sendFile(formData)

      // Replace optimistic message
      setMessages(prev =>
        prev.map(msg =>
          msg._id === optimisticMessage._id ? data : msg
        )
      )

      // Update chat list
      setChats(prev => prev.map(chat =>
        chat._id === selectedChat._id
          ? { ...chat, latestMessage: data }
          : chat
      ))

    } catch (error) {
      console.error('Error uploading file:', error)
      const errorMsg = error.response?.data?.message || 'Failed to upload file'
      toast.error(errorMsg)

      // Remove optimistic message on error
      setMessages(prev =>
        prev.filter(msg => msg._id && !msg._id.startsWith('temp-file'))
      )
    }
  }

  const getOtherUser = (chat) =>
    chat.users?.find(u => u._id !== user?._id)

  const filteredChats = chats.filter(chat => {
    const other = getOtherUser(chat)
    return other?.name.toLowerCase().includes(chatSearch.toLowerCase())
  })

  const contract = selectedChat?.contractId
  const otherUser = selectedChat && getOtherUser(selectedChat)

  // Revised isReadOnly logic: Check strict status
  const isReadOnly = !contract || contract.status !== 'active'

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full min-h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Container with defined height that fits within Layout's overflow area */}
      <div className="flex h-[80vh] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Sidebar - Chat List */}
        <div className="w-80 md:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h2 className="font-bold text-2xl text-gray-800 mb-4">Messages</h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={chatSearch}
                onChange={e => setChatSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            {!socketConnected && (
              <div className="flex items-center text-amber-600 text-xs mt-3 bg-amber-50 p-2 rounded-lg">
                <FiAlertCircle className="mr-1.5" />
                Connecting to server...
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiMessageSquare className="text-gray-400 text-xl" />
                </div>
                <p>No conversations found</p>
              </div>
            ) : (
              filteredChats.map(chat => {
                const other = getOtherUser(chat)
                const isActive = selectedChat?._id === chat._id
                const isContractActive = chat.contractId?.status === 'active'

                return (
                  <button
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 text-left rounded-2xl transition-all duration-200 group ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${isActive ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'
                          }`}>
                          {other?.profilePhoto ? (
                            <img
                              src={other.profilePhoto}
                              alt={other.name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            other?.name?.charAt(0).toUpperCase() || <FiUser />
                          )}
                        </div>
                        {isContractActive && (
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                            {other?.name || 'Unknown User'}
                          </span>
                          {chat.latestMessage && (
                            <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                              {moment(chat.latestMessage.createdAt).format('h:mm A')}
                            </span>
                          )}
                        </div>

                        <div className={`text-sm truncate ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                          {chat.latestMessage?.text || (chat.latestMessage?.file ? '📎 sent a file' : 'Start a conversation')}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-4 shadow-md">
                    {otherUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{otherUser?.name}</h2>
                    <div className="flex items-center text-xs">
                      {isReadOnly ? (
                        <span className="text-gray-500 flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                          <FiAlertCircle className="mr-1" /> Contract Ended
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div> Active Contract
                        </span>
                      )}

                      {contract && (
                        <span className="text-gray-400 mx-2">•</span>
                      )}

                      {contract && (
                        <span className="text-gray-500">
                          Budget: <span className="font-medium text-gray-700 font-mono">₹{contract.payment}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete/Options Menu placeholder */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.info('Click on a contract to view details')}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Contract Details"
                  >
                    <FiFileText className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <FiMessageSquare className="text-3xl text-blue-200" />
                    </div>
                    <p className="font-medium text-gray-500">No messages yet</p>
                    <p className="text-sm">Say hello to start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwnMessage = msg.sender?._id === user?._id
                    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].sender?._id !== msg.sender?._id)

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwnMessage && (
                          <div className="w-8 mr-2 flex flex-col justify-end">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 mb-1">
                                {msg.sender?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`max-w-[75%] lg:max-w-[60%] rounded-2xl p-4 shadow-sm ${isOwnMessage
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                          } ${msg.isOptimistic ? 'opacity-70' : ''}`}>

                          {msg.text && (
                            <div className="break-words leading-relaxed text-sm">{msg.text}</div>
                          )}

                          {msg.file && (
                            <div className={`mt-2 p-3 rounded-xl flex items-center gap-3 ${isOwnMessage ? 'bg-white/10' : 'bg-gray-50 border border-gray-100'
                              }`}>
                              <div className={`p-2 rounded-lg ${isOwnMessage ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                                <FiFileText />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{msg.file.name}</div>
                                <div className="text-xs opacity-70">Attachment</div>
                              </div>
                              <a
                                href={msg.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-2 rounded-lg hover:bg-opacity-20 transition-colors ${isOwnMessage ? 'hover:bg-white' : 'hover:bg-gray-200 text-gray-500'
                                  }`}
                                download
                              >
                                <FiDownload />
                              </a>
                            </div>
                          )}

                          <div className={`text-[10px] mt-2 text-right ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                            }`}>
                            {moment(msg.createdAt).format('h:mm A')}
                            {msg.isOptimistic && ' • Sending...'}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                {isReadOnly ? (
                  <div className="flex items-center justify-center p-3 bg-gray-50 rounded-xl text-gray-500 border border-gray-200">
                    <FiAlertCircle className="mr-2" />
                    <span>This contract has ended. Chat is read-only.</span>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex gap-2 items-end">
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={e => {
                          if (e.target.files[0]) {
                            uploadFile(e.target.files[0])
                            e.target.value = ''
                          }
                        }}
                        disabled={!socketConnected}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!socketConnected}
                        className="p-3.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                        title="Upload File"
                      >
                        <FiFilePlus className="text-xl" />
                      </button>
                    </div>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        disabled={!socketConnected}
                        placeholder="Type your message..."
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3.5 pr-10 shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!socketConnected || sending || !newMessage.trim()}
                      className={`p-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 ${!socketConnected || sending || !newMessage.trim()
                          ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed translate-y-0'
                          : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
                        }`}
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiSend className="text-xl" />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <FiMessageSquare className="text-5xl text-blue-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Conversation</h3>
              <p className="max-w-xs text-center text-gray-500">
                Choose a chat from the sidebar to start messaging your clients or freelancers.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Chat