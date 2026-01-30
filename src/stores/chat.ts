import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { Client } from '@stomp/stompjs'

export interface ChatMessage {
    id: string
    conversationId: string
    senderId: string
    content: string
    type: 'TEXT' | 'IMAGE' | 'VOCAL'
    fileUrl: string | null
    isRead: boolean
    createdAt: string
}

export interface Conversation {
    id: string
    otherUser?: {
        id: string
        name: string
        avatarUrl: string | null
        role: string
    }
    otherParticipant?: {
        id: string
        fullName: string
        avatarUrl: string | null
        role: string
    }
    lastMessage: string
    lastMessageTime?: string
    lastMessageDate?: string
    unreadCount: number
    orderId?: string
    contextId?: string
    contextType?: string
}

export const useChatStore = defineStore('chat', () => {
    const conversations = ref<Conversation[]>([])
    const currentMessages = ref<ChatMessage[]>([])
    const isLoading = ref(false)
    const stompClient = ref<Client | null>(null)
    const activeConversationId = ref<string | null>(null)

    // WebSocket Connection
    function connectWebSocket() {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            console.warn('Cannot connect WebSocket: No access token')
            return
        }

        // Prevent duplicate connections
        if (stompClient.value?.active) {
            console.log('WebSocket already connected')
            return
        }

        console.log('📡 Tentative de connexion WebSocket...')

        stompClient.value = new Client({
            brokerURL: 'ws://213.199.54.136/ws-titra',
            connectHeaders: {
                'Authorization': 'Bearer ' + token,
                'authorization': 'Bearer ' + token
            },
            debug: (str) => {
                if (str.includes('CONNECTED') || str.includes('SUBSCRIBE')) {
                    console.log('🛰️ STOMP:', str)
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        })

        stompClient.value.onConnect = (frame) => {
            console.log(' Connecté! Headers session:', frame.headers)

            const destination = '/user/queue/messages'
            console.log(` Abonnement à : ${destination}`)

            stompClient.value?.subscribe(destination, (message) => {
                console.log(' MESSAGE REÇU via WS:', message.body)
                handleIncomingMessage(message.body)
            })
        }

        stompClient.value.onStompError = (frame) => {
            console.error(' STOMP error:', frame.headers['message'])
        }

        stompClient.value.onWebSocketError = (event) => {
            console.error(' WebSocket link error:', event)
        }

        stompClient.value.activate()
    }

    function disconnectWebSocket() {
        if (stompClient.value) {
            stompClient.value.deactivate()
            stompClient.value = null
            console.log('Disconnected from WebSocket')
        }
    }

    // API Actions
    async function fetchConversations() {
        isLoading.value = true
        try {
            const response = await api.get('/api/chat/conversations')
            let conversationsList = []
            if (Array.isArray(response.data)) {
                conversationsList = response.data
            } else if (response.data?.content && Array.isArray(response.data.content)) {
                conversationsList = response.data.content
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                conversationsList = response.data.data
            } else if (response.data?.data?.content && Array.isArray(response.data.data.content)) {
                conversationsList = response.data.data.content
            }
            conversations.value = conversationsList
            return conversationsList
        } catch (error) {
            console.error('Fetch conversations error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function startConversation(recipientPhoneNumber: string, contextId?: string, contextType?: string) {
        isLoading.value = true
        try {
            const payload: any = { recipientPhoneNumber }
            if (contextId) payload.contextId = contextId
            if (contextType) payload.contextType = contextType

            const response = await api.post('/api/chat/conversations/start', payload)
            const conversation = response.data.data || response.data

            const existingIndex = conversations.value.findIndex(c => c.id === conversation.id)
            if (existingIndex === -1) {
                conversations.value.unshift(conversation)
            }
            return conversation
        } catch (error) {
            console.error('Start conversation error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchMessages(conversationId: string, page = 0, size = 20) {
        isLoading.value = true
        try {
            const response = await api.get(`/api/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`)
            let messagesList = []
            if (Array.isArray(response.data)) {
                messagesList = response.data
            } else if (response.data?.content && Array.isArray(response.data.content)) {
                messagesList = response.data.content
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                messagesList = response.data.data
            } else if (response.data?.data?.content && Array.isArray(response.data.data.content)) {
                messagesList = response.data.data.content
            }

            if (page === 0) {
                currentMessages.value = [...messagesList].reverse()
            } else {
                currentMessages.value = [...[...messagesList].reverse(), ...currentMessages.value]
            }
            activeConversationId.value = conversationId
            return messagesList
        } catch (error) {
            console.error('Fetch messages error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function sendMessage(recipientId: string, content: string) {
        try {
            const response = await api.post('/api/chat/messages', { recipientId, content })
            const sentMessage = response.data.data || response.data
            currentMessages.value.push(sentMessage)
            return sentMessage
        } catch (error) {
            console.error('Send message error:', error)
            throw error
        }
    }

    async function sendFile(recipientId: string, file: File, type: 'IMAGE' | 'VOCAL') {
        try {
            const formData = new FormData()
            formData.append('recipientId', recipientId)
            formData.append('file', file)
            formData.append('type', type)
            const response = await api.post('/api/chat/messages/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const sentMessage = response.data.data || response.data
            currentMessages.value.push(sentMessage)
            return sentMessage
        } catch (error) {
            console.error('Send file error:', error)
            throw error
        }
    }

    async function markAsRead(conversationId: string) {
        try {
            await api.post(`/api/chat/conversations/${conversationId}/read`)
            const conv = conversations.value.find(c => c.id === conversationId)
            if (conv) conv.unreadCount = 0
        } catch (error) {
            console.error('Mark as read error:', error)
        }
    }

    function handleIncomingMessage(body: string) {
        try {
            const newMessage = JSON.parse(body) as ChatMessage
            if (activeConversationId.value === newMessage.conversationId) {
                const exists = currentMessages.value.some(m => m.id === newMessage.id)
                if (!exists) {
                    currentMessages.value.push(newMessage)
                    markAsRead(newMessage.conversationId)
                }
            }
            updateConversationList(newMessage)
        } catch (e) {
            console.error('Error parsing incoming message:', e)
        }
    }

    function updateConversationList(message: ChatMessage) {
        const index = conversations.value.findIndex(c => c.id === message.conversationId)
        if (index !== -1) {
            const conv = conversations.value[index]
            conv.lastMessage = message.content
            conv.lastMessageTime = message.createdAt
            conv.lastMessageDate = message.createdAt
            if (activeConversationId.value !== message.conversationId) {
                conv.unreadCount++
            }
            conversations.value.splice(index, 1)
            conversations.value.unshift(conv)
        } else {
            fetchConversations()
        }
    }

    return {
        conversations,
        currentMessages,
        isLoading,
        activeConversationId,
        connectWebSocket,
        disconnectWebSocket,
        fetchConversations,
        startConversation,
        fetchMessages,
        sendMessage,
        sendFile,
        markAsRead
    }
})
