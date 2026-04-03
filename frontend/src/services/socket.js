// import { io } from 'socket.io-client'

// class SocketService {
//   socket = null
//   listeners = new Map()

//   connect(token) {
//     if (this.socket) {
//       this.disconnect()
//     }

//     this.socket = io(
//       import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
//       {
//         auth: { token },
//         transports: ['websocket'],
//         reconnection: true,
//         reconnectionAttempts: 10,
//         reconnectionDelay: 1000,
//         reconnectionDelayMax: 5000,
//         timeout: 20000
//       }
//     )

//     this.socket.on('connect', () => {
//       console.log('✅ Socket connected:', this.socket.id)
//     })

//     this.socket.on('connect_error', err => {
//       console.error('❌ Socket connection error:', err.message)
//     })

//     this.socket.on('disconnect', reason => {
//       console.log('⚠️ Socket disconnected:', reason)
//       if (reason === 'io server disconnect') {
//         this.socket.connect()
//       }
//     })

//     this.socket.on('reconnect', attempt => {
//       console.log(`♻️ Socket reconnected after ${attempt} attempts`)
//     })

//     this.socket.on('reconnect_error', err => {
//       console.error('❌ Socket reconnect error:', err)
//     })

//     this.socket.on('reconnect_failed', () => {
//       console.error('❌ Socket reconnect failed')
//     })

//     return this.socket
//   }

//   disconnect() {
//     if (!this.socket) return

//     this.listeners.forEach((cb, event) => {
//       this.socket.off(event, cb)
//     })

//     this.listeners.clear()
//     this.socket.disconnect()
//     this.socket = null
//     console.log('👋 Socket disconnected and cleaned up')
//   }

//   on(event, callback) {
//     if (!this.socket) return
//     this.socket.on(event, callback)
//     this.listeners.set(event, callback)
//   }

//   off(event, callback) {
//     if (!this.socket) return
//     this.socket.off(event, callback)
//     this.listeners.delete(event)
//   }

//   emit(event, data) {
//     if (!this.socket || !this.socket.connected) {
//       return Promise.reject(new Error('Socket not connected'))
//     }

//     return new Promise((resolve, reject) => {
//       this.socket.emit(event, data, response => {
//         if (response?.error) {
//           reject(new Error(response.error))
//         } else {
//           resolve(response)
//         }
//       })
//     })
//   }

//   isConnected() {
//     return !!this.socket?.connected
//   }

//   getSocketId() {
//     return this.socket?.id || null
//   }

//   joinChat(chatId) {
//     if (this.isConnected()) {
//       this.emit('joinChat', chatId)
//     }
//   }

//   sendMessage(chatId, text) {
//     if (this.isConnected()) {
//       this.emit('sendMessage', { chatId, text })
//     }
//   }
// }

// export default new SocketService()








import { io } from 'socket.io-client'

class SocketService {
  socket = null
  listeners = new Map()
  reconnectAttempts = 0
  maxReconnectAttempts = 20
  isManuallyDisconnecting = false

  connect(token) {
    if (this.socket) {
      this.disconnect()
    }

    this.isManuallyDisconnecting = false

    // Get token from localStorage if not provided
    if (!token) {
      token = localStorage.getItem('token')
    }

    if (!token) {
      console.error('❌ No authentication token available for socket connection')
      return null
    }

    this.socket = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        auth: { token },
        transports: ['websocket', 'polling'], // Add polling as fallback
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        forceNew: false,
        withCredentials: true,
        path: '/socket.io/'
      }
    )

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id)
      this.reconnectAttempts = 0 // Reset on successful connection

      // Emit connection event for UI updates
      this.socket.emit('userConnected', { userId: this.getUserIdFromToken(token) })
    })

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message)
      this.reconnectAttempts++

      // Handle authentication errors
      if (err.message.includes('auth') || err.message.includes('401')) {
        console.error('Authentication failed, clearing token...')
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected. Reason:', reason)

      // Don't auto-reconnect if manually disconnected
      if (!this.isManuallyDisconnecting) {
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          this.socket.connect()
        } else if (reason === 'transport close') {
          console.log('Transport closed, will attempt reconnect...')
        }
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`♻️ Socket reconnected after ${attemptNumber} attempts`)
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Attempting to reconnect (${attemptNumber}/${this.maxReconnectAttempts})`)
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnect error:', error)
    })

    this.socket.on('reconnect_failed', () => {
      console.error(`❌ Socket reconnect failed after ${this.maxReconnectAttempts} attempts`)
      // Optionally show user notification
      if (typeof window !== 'undefined') {
        // You could dispatch a custom event or update a global state
        window.dispatchEvent(new CustomEvent('socket:reconnect_failed'))
      }
    })

    // Handle ping/pong for connection monitoring
    this.socket.on('ping', () => {
      console.log('🏓 Ping received')
    })

    this.socket.on('pong', (latency) => {
      console.log(`🏓 Pong received (latency: ${latency}ms)`)
    })

    return this.socket
  }

  disconnect() {
    if (!this.socket) return

    this.isManuallyDisconnecting = true

    // Notify server before disconnecting
    if (this.socket.connected) {
      this.socket.emit('userDisconnecting')
    }

    // Clean up all listeners
    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback)
    })
    this.listeners.clear()

    // Disconnect socket
    this.socket.disconnect()
    this.socket = null

    console.log('👋 Socket disconnected and cleaned up')
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn(`⚠️ Cannot add listener for "${event}" - socket not connected`)
      return
    }

    this.socket.on(event, callback)
    this.listeners.set(event, callback)
    return () => this.off(event, callback) // Return cleanup function
  }

  off(event, callback) {
    if (!this.socket) return

    if (callback) {
      this.socket.off(event, callback)
      this.listeners.delete(event)
    } else {
      // Remove all listeners for this event
      this.socket.removeAllListeners(event)
      this.listeners.delete(event)
    }
  }

  emit(event, data) {
    if (!this.socket || !this.socket.connected) {
      console.error(`❌ Cannot emit "${event}" - socket not connected`)
      return Promise.reject(new Error('Socket not connected'))
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Socket emit timeout for event: ${event}`))
      }, 10000) // 10 second timeout

      this.socket.emit(event, data, (response) => {
        clearTimeout(timeout)

        if (response?.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }

  isConnected() {
    return !!this.socket?.connected
  }

  getSocketId() {
    return this.socket?.id || null
  }

  getConnectionStatus() {
    if (!this.socket) return 'disconnected'
    if (this.socket.connected) return 'connected'
    if (this.socket.disconnected) return 'disconnected'
    return 'connecting'
  }

  getReconnectAttempts() {
    return this.reconnectAttempts
  }

  joinChat(chatId) {
    if (!this.isConnected()) {
      console.warn(`⚠️ Cannot join chat ${chatId} - socket not connected`)
      return Promise.reject(new Error('Socket not connected'))
    }

    return this.emit('joinChat', { chatId })
  }

  leaveChat(chatId) {
    if (!this.isConnected()) return

    this.emit('leaveChat', { chatId })
  }

  sendMessage(chatId, text, attachments = []) {
    if (!this.isConnected()) {
      console.warn(`⚠️ Cannot send message - socket not connected`)
      return Promise.reject(new Error('Socket not connected'))
    }

    const messageData = {
      chatId,
      text,
      attachments,
      timestamp: new Date().toISOString()
    }

    return this.emit('sendMessage', messageData)
  }

  // Helper method to extract user ID from token
  getUserIdFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId || payload.id
    } catch (error) {
      console.error('Failed to parse token:', error)
      return null
    }
  }

  // Typing indicators
  startTyping(chatId) {
    if (!this.isConnected()) return

    this.emit('typingStart', { chatId })
  }

  stopTyping(chatId) {
    if (!this.isConnected()) return

    this.emit('typingStop', { chatId })
  }

  // Message status updates
  markAsRead(messageId, chatId) {
    if (!this.isConnected()) return

    this.emit('markAsRead', { messageId, chatId })
  }

  markAsDelivered(messageId, chatId) {
    if (!this.isConnected()) return

    this.emit('markAsDelivered', { messageId, chatId })
  }
}

// Create and export singleton instance
const socketService = new SocketService()

// Optional: Add global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    socketService.disconnect()
  })
}

export default socketService