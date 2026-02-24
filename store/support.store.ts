/**
 * Support Store — Zustand v5
 *
 * Manages conversations list, active conversation, messages, typing indicators
 * and socket connection state for the Customer Support page.
 */

import { create } from 'zustand'

import type { ChatMessage, Conversation } from '@/types/chat'

// ─── Typing indicator ─────────────────────────────────────────────────────────

interface TypingIndicator {
  participantId: string
  participantName: string
}

// ─── State shape ──────────────────────────────────────────────────────────────

interface SupportState {
  /** All conversations (sorted by lastMessageAt desc) */
  conversations: Conversation[]
  /** ID of the currently open conversation */
  activeConversationId: string | null
  /** Messages keyed by conversationId */
  messagesByConversation: Record<string, ChatMessage[]>
  /** IDs of conversations currently loading their messages */
  loadingMessageIds: Set<string>
  /** True while the conversation list is loading */
  isLoadingConversations: boolean
  /** Who is typing, keyed by conversationId */
  typingByConversation: Record<string, TypingIndicator | null>
  /** Whether the socket is currently connected */
  socketConnected: boolean

  // ── Actions ──────────────────────────────────────────────────────────────
  setConversations: (conversations: Conversation[]) => void
  upsertConversation: (conversation: Conversation) => void
  patchConversation: (id: string, patch: Partial<Conversation>) => void

  setActiveConversation: (id: string | null) => void

  setMessages: (conversationId: string, messages: ChatMessage[]) => void
  appendMessage: (message: ChatMessage) => void
  /** Replace an optimistic (pending) message with the confirmed server message */
  replacePendingMessage: (tempId: string, confirmed: ChatMessage) => void
  setMessageStatus: (
    messageId: string,
    conversationId: string,
    status: ChatMessage['status']
  ) => void

  setLoadingMessages: (conversationId: string, loading: boolean) => void
  setLoadingConversations: (loading: boolean) => void

  setTyping: (conversationId: string, indicator: TypingIndicator | null) => void
  setSocketConnected: (connected: boolean) => void

  reset: () => void
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  loadingMessageIds: new Set<string>(),
  isLoadingConversations: false,
  typingByConversation: {},
  socketConnected: false
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSupportStore = create<SupportState>()((set) => ({
  ...initialState,

  // ── Conversations ───────────────────────────────────────────────────────────

  setConversations: (conversations) => set({ conversations }),

  upsertConversation: (conversation) =>
    set((state) => {
      const exists = state.conversations.some((c) => c.id === conversation.id)
      const next =
        exists ?
          state.conversations.map((c) =>
            c.id === conversation.id ? conversation : c
          )
        : [conversation, ...state.conversations]
      return {
        conversations: next.sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime()
        )
      }
    }),

  patchConversation: (id, patch) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      )
    })),

  // ── Active conversation ─────────────────────────────────────────────────────

  setActiveConversation: (id) => set({ activeConversationId: id }),

  // ── Messages ────────────────────────────────────────────────────────────────

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages
      }
    })),

  appendMessage: (message) =>
    set((state) => {
      const existing =
        state.messagesByConversation[message.conversationId] ?? []
      // Prevent duplicate inserts
      if (existing.some((m) => m.id === message.id)) return state
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...existing, message]
        },
        // Bump conversation to top and update last message
        conversations: state.conversations
          .map((c) =>
            c.id === message.conversationId ?
              {
                ...c,
                lastMessage: message.content,
                lastMessageAt: message.timestamp,
                // Only increment unread if this conversation isn't active
                unreadCount:
                  state.activeConversationId === message.conversationId ?
                    0
                  : c.unreadCount + (message.sender === 'customer' ? 1 : 0)
              }
            : c
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
          )
      }
    }),

  replacePendingMessage: (tempId, confirmed) =>
    set((state) => {
      const msgs = state.messagesByConversation[confirmed.conversationId] ?? []
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [confirmed.conversationId]: msgs.map((m) =>
            m.id === tempId ? confirmed : m
          )
        }
      }
    }),

  setMessageStatus: (messageId, conversationId, status) =>
    set((state) => {
      const msgs = state.messagesByConversation[conversationId] ?? []
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: msgs.map((m) =>
            m.id === messageId ? { ...m, status } : m
          )
        }
      }
    }),

  // ── Loading flags ───────────────────────────────────────────────────────────

  setLoadingMessages: (conversationId, loading) =>
    set((state) => {
      const next = new Set(state.loadingMessageIds)
      loading ? next.add(conversationId) : next.delete(conversationId)
      return { loadingMessageIds: next }
    }),

  setLoadingConversations: (isLoadingConversations) =>
    set({ isLoadingConversations }),

  // ── Presence / typing ───────────────────────────────────────────────────────

  setTyping: (conversationId, indicator) =>
    set((state) => ({
      typingByConversation: {
        ...state.typingByConversation,
        [conversationId]: indicator
      }
    })),

  setSocketConnected: (socketConnected) => set({ socketConnected }),

  // ── Reset ───────────────────────────────────────────────────────────────────

  reset: () => set({ ...initialState, loadingMessageIds: new Set() })
}))

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Stable empty array — prevents new reference on every selector call */
const EMPTY_MESSAGES: ChatMessage[] = []

export const selectActiveConversation = (state: SupportState) =>
  state.conversations.find((c) => c.id === state.activeConversationId) ?? null

/**
 * Returns the messages for the active conversation.
 * Uses a module-level constant as fallback so the reference is stable across
 * renders, avoiding the Zustand / useSyncExternalStore infinite-loop warning.
 */
export const selectActiveMessages = (state: SupportState): ChatMessage[] =>
  state.activeConversationId ?
    (state.messagesByConversation[state.activeConversationId] ?? EMPTY_MESSAGES)
  : EMPTY_MESSAGES

export const selectTotalUnread = (state: SupportState) =>
  state.conversations.reduce((sum, c) => sum + c.unreadCount, 0)
