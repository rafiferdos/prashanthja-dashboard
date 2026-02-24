// ─── Enums / Literals ─────────────────────────────────────────────────────────

export type MessageSender = 'admin' | 'customer'
export type ConversationStatus = 'open' | 'pending' | 'closed'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

// ─── Core entities ────────────────────────────────────────────────────────────

export interface ChatParticipant {
  id: string
  name: string
  email: string
  /** URL or null — falls back to initials avatar */
  avatarUrl: string | null
}

export interface ChatMessage {
  id: string
  conversationId: string
  sender: MessageSender
  /** Participant who sent the message */
  senderId: string
  content: string
  timestamp: string // ISO 8601
  status: MessageStatus
  /** True when this is a temporary optimistic insert */
  isPending?: boolean
}

export interface Conversation {
  id: string
  customer: ChatParticipant
  status: ConversationStatus
  subject: string
  lastMessage: string
  lastMessageAt: string // ISO 8601
  unreadCount: number
  createdAt: string
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface SendMessagePayload {
  conversationId: string
  content: string
}

export interface GetMessagesPayload {
  conversationId: string
  /** cursor-based pagination — pass last message id to load older messages */
  before?: string
  limit?: number
}

export interface UpdateConversationStatusPayload {
  conversationId: string
  status: ConversationStatus
}

// ─── Socket event payloads ────────────────────────────────────────────────────

/** Emitted by the server when a new message arrives in any conversation */
export interface SocketNewMessagePayload {
  message: ChatMessage
  conversationId: string
}

/** Emitted while a participant starts/stops typing */
export interface SocketTypingPayload {
  conversationId: string
  participantId: string
  participantName: string
  isTyping: boolean
}

/** Emitted when a conversation's metadata changes (status, unread count, etc.) */
export interface SocketConversationUpdatePayload {
  conversationId: string
  patch: Partial<Conversation>
}

// ─── Socket event names ───────────────────────────────────────────────────────

export const SOCKET_EVENTS = {
  // ── Client → Server ──────────────────────────────────────────────────────
  SEND_MESSAGE: 'support:send_message',
  TYPING_START: 'support:typing_start',
  TYPING_STOP: 'support:typing_stop',
  MARK_READ: 'support:mark_read',
  JOIN_CONVERSATION: 'support:join',
  LEAVE_CONVERSATION: 'support:leave',
  CLOSE_CONVERSATION: 'support:close',

  // ── Server → Client ──────────────────────────────────────────────────────
  NEW_MESSAGE: 'support:new_message',
  MESSAGE_STATUS: 'support:message_status',
  PARTICIPANT_TYPING: 'support:typing',
  CONVERSATION_UPDATED: 'support:conversation_updated',
  ERROR: 'support:error'
} as const
