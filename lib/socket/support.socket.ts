/**
 * Support Socket Service — socket.io-client v4  (Zustand-agnostic)
 *
 * Usage:
 *   import { supportSocket } from '@/lib/socket/support.socket'
 *
 *   // Connect (call once after sign-in)
 *   supportSocket.connect(accessToken)
 *
 *   // Subscribe to events
 *   supportSocket.on('new_message', handler)
 *   supportSocket.off('new_message', handler)
 *
 *   // Disconnect on logout
 *   supportSocket.disconnect()
 *
 * In production, replace SUPPORT_SOCKET_URL with your real WebSocket server URL.
 */

import { io, Socket } from 'socket.io-client'

import type {
  SendMessagePayload,
  SocketConversationUpdatePayload,
  SocketNewMessagePayload,
  SocketTypingPayload
} from '@/types/chat'
import { SOCKET_EVENTS } from '@/types/chat'

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPPORT_SOCKET_URL =
  process.env.NEXT_PUBLIC_SUPPORT_SOCKET_URL ?? 'http://localhost:4000'

// ─── Typed event map ─────────────────────────────────────────────────────────

type SupportSocketEvents = {
  new_message: (payload: SocketNewMessagePayload) => void
  typing: (payload: SocketTypingPayload) => void
  conversation_updated: (payload: SocketConversationUpdatePayload) => void
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (err: Error) => void
}

// ─── Service class ───────────────────────────────────────────────────────────

class SupportSocketService {
  private socket: Socket | null = null
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>()

  /** Returns true when a socket exists and is connected. */
  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Create the socket connection and authenticate.
   * Safe to call multiple times — will no-op if already connected.
   */
  connect(accessToken: string): void {
    if (this.socket?.connected) return

    this.socket = io(SUPPORT_SOCKET_URL, {
      // Attach auth token so the server can verify the admin session
      auth: { token: accessToken },
      // Reconnect indefinitely with exponential back-off
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling']
      // Namespace dedicated to support
      // Change to io(`${SUPPORT_SOCKET_URL}/support`, ...) when using namespaces
    })

    this._bindServerEvents()
  }

  /** Gracefully close the socket (e.g. on logout). */
  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
    this.listeners.clear()
  }

  // ── Client → Server emitters ───────────────────────────────────────────────

  sendMessage(payload: SendMessagePayload): void {
    this._emit(SOCKET_EVENTS.SEND_MESSAGE, payload)
  }

  joinConversation(conversationId: string): void {
    this._emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId })
  }

  leaveConversation(conversationId: string): void {
    this._emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId })
  }

  startTyping(conversationId: string): void {
    this._emit(SOCKET_EVENTS.TYPING_START, { conversationId })
  }

  stopTyping(conversationId: string): void {
    this._emit(SOCKET_EVENTS.TYPING_STOP, { conversationId })
  }

  markRead(conversationId: string): void {
    this._emit(SOCKET_EVENTS.MARK_READ, { conversationId })
  }

  closeConversation(conversationId: string): void {
    this._emit(SOCKET_EVENTS.CLOSE_CONVERSATION, { conversationId })
  }

  // ── Event subscription ─────────────────────────────────────────────────────

  on<K extends keyof SupportSocketEvents>(
    event: K,
    handler: SupportSocketEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void)
    this.socket?.on(this._serverEventName(event), handler as never)
  }

  off<K extends keyof SupportSocketEvents>(
    event: K,
    handler: SupportSocketEvents[K]
  ): void {
    this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void)
    this.socket?.off(this._serverEventName(event), handler as never)
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _emit(event: string, payload?: unknown): void {
    if (!this.socket?.connected) {
      console.warn('[SupportSocket] Cannot emit — socket not connected.', event)
      return
    }
    this.socket.emit(event, payload)
  }

  /** Map our typed event key to the actual SOCKET_EVENTS string */
  private _serverEventName(event: string): string {
    const map: Record<string, string> = {
      new_message: SOCKET_EVENTS.NEW_MESSAGE,
      typing: SOCKET_EVENTS.PARTICIPANT_TYPING,
      conversation_updated: SOCKET_EVENTS.CONVERSATION_UPDATED,
      connect: 'connect',
      disconnect: 'disconnect',
      connect_error: 'connect_error'
    }
    return map[event] ?? event
  }

  /** Bind server-emitted events and re-emit to registered listeners. */
  private _bindServerEvents(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.info('[SupportSocket] Connected:', this.socket?.id)
      this._notifyListeners('connect')
    })

    this.socket.on('disconnect', (reason) => {
      console.info('[SupportSocket] Disconnected:', reason)
      this._notifyListeners('disconnect', reason)
    })

    this.socket.on('connect_error', (err) => {
      console.error('[SupportSocket] Connection error:', err.message)
      this._notifyListeners('connect_error', err)
    })

    this.socket.on(
      SOCKET_EVENTS.NEW_MESSAGE,
      (payload: SocketNewMessagePayload) => {
        this._notifyListeners('new_message', payload)
      }
    )

    this.socket.on(
      SOCKET_EVENTS.PARTICIPANT_TYPING,
      (payload: SocketTypingPayload) => {
        this._notifyListeners('typing', payload)
      }
    )

    this.socket.on(
      SOCKET_EVENTS.CONVERSATION_UPDATED,
      (payload: SocketConversationUpdatePayload) => {
        this._notifyListeners('conversation_updated', payload)
      }
    )
  }

  private _notifyListeners(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(...args)
      } catch (err) {
        console.error('[SupportSocket] Listener error:', err)
      }
    })
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

/**
 * Singleton socket service instance.
 * Import and use directly — no need to instantiate.
 */
export const supportSocket = new SupportSocketService()
