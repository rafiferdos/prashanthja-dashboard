'use client'

import {
  IconCheck,
  IconChecks,
  IconCircleCheck,
  IconClock,
  IconLoader2,
  IconMessageCircle,
  IconSearch,
  IconSend,
  IconX
} from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  getConversations,
  getMessages,
  markConversationAsRead,
  sendMessage,
  updateConversationStatus
} from '@/lib/api/support'
import { supportSocket } from '@/lib/socket/support.socket'
import { useAuthStore } from '@/store/auth.store'
import {
  selectActiveConversation,
  selectActiveMessages,
  useSupportStore
} from '@/store/support.store'
import type {
  ChatMessage,
  Conversation,
  ConversationStatus
} from '@/types/chat'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function formatTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function formatDateDivider(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

const STATUS_CONFIG: Record<
  ConversationStatus,
  { label: string; className: string }
> = {
  open: {
    label: 'Open',
    className:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
  },
  pending: {
    label: 'Pending',
    className:
      'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground border-border'
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name,
  size = 'md'
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base'
  }[size]
  return (
    <span
      className={`
        ${sizeClass} flex shrink-0 items-center justify-center rounded-full
        bg-linear-to-br from-[#1F889E] to-[#20B482] font-bold text-white shadow-sm
      `}
    >
      {getInitials(name)}
    </span>
  )
}

// ─── Message status icon ──────────────────────────────────────────────────────

function MessageStatusIcon({ status }: { status: ChatMessage['status'] }) {
  if (status === 'sending') return <IconClock className='size-3 opacity-50' />
  if (status === 'sent') return <IconCheck className='size-3 opacity-60' />
  if (status === 'delivered')
    return <IconChecks className='size-3 opacity-60' />
  if (status === 'read') return <IconChecks className='size-3 text-sky-400' />
  if (status === 'failed') return <IconX className='size-3 text-destructive' />
  return null
}

// ─── Left panel — conversation list ──────────────────────────────────────────

type FilterTab = 'all' | ConversationStatus

function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelect
}: {
  conversations: Conversation[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchesTab = tab === 'all' || c.status === tab
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        c.customer.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      return matchesTab && matchesSearch
    })
  }, [conversations, search, tab])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'pending', label: 'Pending' },
    { key: 'closed', label: 'Closed' }
  ]

  return (
    <aside className='flex h-full w-72 shrink-0 flex-col border-r xl:w-80'>
      {/* Search */}
      <div className='px-4 pt-4 pb-3'>
        <div className='relative'>
          <IconSearch className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search conversations…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9 text-sm'
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className='flex gap-1 px-4 pb-3'>
        {tabs.map((t) => {
          const count =
            t.key === 'all' ?
              conversations.reduce((s, c) => s + c.unreadCount, 0)
            : conversations
                .filter((c) => c.status === t.key)
                .reduce((s, c) => s + c.unreadCount, 0)
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium
                transition-colors
                ${
                  tab === t.key ?
                    'bg-linear-to-r from-[#1F889E] to-[#20B482] text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-accent'
                }
              `}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={`
                    flex size-4 items-center justify-center rounded-full text-[10px] font-bold
                    ${tab === t.key ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}
                  `}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Separator />

      {/* List */}
      <div className='flex-1 overflow-y-auto'>
        {isLoading ?
          <div className='flex flex-col gap-0.5 p-2'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='flex gap-3 rounded-xl p-3'>
                <Skeleton className='size-10 shrink-0 rounded-full' />
                <div className='flex flex-1 flex-col gap-1.5'>
                  <Skeleton className='h-3.5 w-28 rounded' />
                  <Skeleton className='h-3 w-full rounded' />
                  <Skeleton className='h-3 w-16 rounded' />
                </div>
              </div>
            ))}
          </div>
        : filtered.length === 0 ?
          <div className='flex flex-col items-center justify-center gap-2 py-16 text-center'>
            <IconMessageCircle className='size-8 text-muted-foreground/40' />
            <p className='text-sm text-muted-foreground'>
              No conversations found
            </p>
          </div>
        : <div className='flex flex-col gap-0.5 p-2'>
            {filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onClick={() => onSelect(conv.id)}
              />
            ))}
          </div>
        }
      </div>
    </aside>
  )
}

function ConversationItem({
  conversation: c,
  isActive,
  onClick
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group flex w-full items-start gap-3 rounded-xl p-3 text-left
        transition-colors
        ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}
      `}
    >
      <Avatar name={c.customer.name} size='md' />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between gap-1'>
          <span
            className={`truncate text-sm font-semibold ${
              c.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
            }`}
          >
            {c.customer.name}
          </span>
          <span className='shrink-0 text-[10px] text-muted-foreground'>
            {formatTime(c.lastMessageAt)}
          </span>
        </div>
        <p className='mt-0.5 truncate text-xs text-muted-foreground'>
          {c.subject}
        </p>
        <div className='mt-1 flex items-center justify-between gap-1'>
          <p
            className={`truncate text-xs ${
              c.unreadCount > 0 ?
                'font-medium text-foreground/90'
              : 'text-muted-foreground'
            }`}
          >
            {c.lastMessage}
          </p>
          {c.unreadCount > 0 && (
            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1F889E] text-[10px] font-bold text-white'>
              {c.unreadCount > 9 ? '9+' : c.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Right panel — active conversation ───────────────────────────────────────

function ConversationHeader({
  conversation,
  onClose,
  isUpdating
}: {
  conversation: Conversation
  onClose: () => void
  isUpdating: boolean
}) {
  const cfg = STATUS_CONFIG[conversation.status]
  return (
    <div className='flex h-16 shrink-0 items-center justify-between gap-3 border-b px-5'>
      <div className='flex min-w-0 items-center gap-3'>
        <Avatar name={conversation.customer.name} size='sm' />
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>
            {conversation.customer.name}
          </p>
          <p className='truncate text-xs text-muted-foreground'>
            {conversation.customer.email}
          </p>
        </div>
        <span
          className={`
            ml-1 shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium
            ${cfg.className}
          `}
        >
          {cfg.label}
        </span>
      </div>

      {conversation.status !== 'closed' && (
        <Button
          size='sm'
          variant='outline'
          className='shrink-0 gap-1.5 rounded-full text-xs'
          onClick={onClose}
          disabled={isUpdating}
        >
          {isUpdating ?
            <IconLoader2 className='size-3.5 animate-spin' />
          : <IconCircleCheck className='size-3.5' />}
          Close Ticket
        </Button>
      )}
    </div>
  )
}

function TypingBubble() {
  return (
    <div className='flex items-end gap-2'>
      <div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground'>
        …
      </div>
      <div className='flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3'>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className='size-1.5 rounded-full bg-muted-foreground/50'
            style={{
              animation: `chatTypingBounce 1.2s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>
    </div>
  )
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className='flex items-center gap-3 py-2'>
      <div className='h-px flex-1 bg-border' />
      <span className='text-[11px] font-medium text-muted-foreground'>
        {label}
      </span>
      <div className='h-px flex-1 bg-border' />
    </div>
  )
}

function MessageBubble({
  message,
  showAvatar,
  customerName
}: {
  message: ChatMessage
  showAvatar: boolean
  customerName: string
}) {
  const isAdmin = message.sender === 'admin'

  return (
    <div
      className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar placeholder to keep bubble aligned */}
      <div className='size-7 shrink-0'>
        {!isAdmin && showAvatar && (
          <span
            className='
              flex size-7 items-center justify-center rounded-full
              bg-linear-to-br from-[#1F889E] to-[#20B482]
              text-[10px] font-bold text-white
            '
          >
            {getInitials(customerName)}
          </span>
        )}
      </div>

      <div
        className={`
          group flex max-w-[70%] flex-col gap-1
          ${isAdmin ? 'items-end' : 'items-start'}
        `}
      >
        <div
          className={`
            rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
            ${
              isAdmin ?
                'rounded-br-sm bg-linear-to-br from-[#1F889E] to-[#20B482] text-white'
              : 'rounded-bl-sm bg-muted text-foreground'
            }
            ${message.isPending ? 'opacity-60' : ''}
          `}
        >
          {message.content}
        </div>
        <div className='flex items-center gap-1 px-1'>
          <span className='text-[10px] text-muted-foreground'>
            {formatMessageTime(message.timestamp)}
          </span>
          {isAdmin && <MessageStatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  )
}

function MessagesArea({
  messages,
  isLoading,
  isTyping,
  customerName
}: {
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
  customerName: string
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (isLoading) {
    return (
      <div className='flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-2 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <Skeleton className='size-7 shrink-0 rounded-full' />
            <Skeleton
              className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-56' : 'w-44'}`}
            />
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center'>
        <IconMessageCircle className='size-12 text-muted-foreground/20' />
        <p className='text-sm text-muted-foreground'>No messages yet</p>
        <p className='text-xs text-muted-foreground/60'>
          Start the conversation below
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4'>
      {messages.map((msg, idx) => {
        const prev = messages[idx - 1]
        const showDivider = !prev || !isSameDay(prev.timestamp, msg.timestamp)
        const isNewGroup =
          !prev ||
          prev.sender !== msg.sender ||
          new Date(msg.timestamp).getTime() -
            new Date(prev.timestamp).getTime() >
            5 * 60_000
        const showAvatar = isNewGroup

        return (
          <div key={msg.id}>
            {showDivider && (
              <DateDivider label={formatDateDivider(msg.timestamp)} />
            )}
            <div className={isNewGroup ? 'mt-3' : 'mt-0.5'}>
              <MessageBubble
                message={msg}
                showAvatar={showAvatar}
                customerName={customerName}
              />
            </div>
          </div>
        )
      })}

      {isTyping && (
        <div className='mt-3'>
          <TypingBubble />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

function ChatInput({
  disabled,
  onSend
}: {
  disabled: boolean
  onSend: (text: string) => void
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='border-t bg-background px-4 py-3'>
      <div className='flex items-end gap-2 rounded-2xl border bg-muted/30 px-4 py-2 focus-within:ring-2 focus-within:ring-[#1F889E]/30'>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type a message… (Enter to send, Shift+Enter for newline)'
          disabled={disabled}
          rows={1}
          className='
            max-h-32 min-h-9 flex-1 resize-none border-0 bg-transparent p-0
            text-sm shadow-none focus-visible:ring-0
          '
        />
        <Button
          size='icon'
          disabled={disabled || !value.trim()}
          onClick={handleSend}
          className='
            mb-0.5 size-8 shrink-0 rounded-full
            bg-linear-to-br from-[#1F889E] to-[#20B482] text-white
            shadow-sm hover:opacity-90 disabled:opacity-40
          '
        >
          <IconSend className='size-4' />
        </Button>
      </div>
      <p className='mt-1.5 text-center text-[10px] text-muted-foreground'>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}

// ─── Empty state (no conversation selected) ───────────────────────────────────

function NoConversationSelected() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
      <div className='flex size-20 items-center justify-center rounded-full bg-muted'>
        <IconMessageCircle className='size-10 text-muted-foreground/40' />
      </div>
      <div>
        <p className='text-base font-semibold text-foreground/80'>
          No conversation selected
        </p>
        <p className='mt-1 text-sm text-muted-foreground'>
          Choose a conversation from the left to get started
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerSupportPage() {
  // ── Store ──────────────────────────────────────────────────────────────────
  const conversations = useSupportStore((s) => s.conversations)
  const activeConversationId = useSupportStore((s) => s.activeConversationId)
  const isLoadingConversations = useSupportStore(
    (s) => s.isLoadingConversations
  )
  const loadingMessageIds = useSupportStore((s) => s.loadingMessageIds)
  const setConversations = useSupportStore((s) => s.setConversations)
  const setMessages = useSupportStore((s) => s.setMessages)
  const appendMessage = useSupportStore((s) => s.appendMessage)
  const replacePendingMessage = useSupportStore((s) => s.replacePendingMessage)
  const setActiveConversation = useSupportStore((s) => s.setActiveConversation)
  const setLoadingConversations = useSupportStore(
    (s) => s.setLoadingConversations
  )
  const setLoadingMessages = useSupportStore((s) => s.setLoadingMessages)
  const patchConversation = useSupportStore((s) => s.patchConversation)
  const setSocketConnected = useSupportStore((s) => s.setSocketConnected)
  const setTyping = useSupportStore((s) => s.setTyping)
  const socketConnected = useSupportStore((s) => s.socketConnected)

  const activeConversation = useSupportStore(selectActiveConversation)
  const activeMessages = useSupportStore(selectActiveMessages)
  // Inline selector — avoids creating a new function via a factory on every render,
  // which would make Zustand's useSyncExternalStore think the snapshot changed.
  const typingIndicator = useSupportStore(
    (s) => s.typingByConversation[activeConversationId ?? ''] ?? null
  )

  const accessToken = useAuthStore((s) => s.accessToken)

  const [isSending, setIsSending] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // ── Load conversations on mount ────────────────────────────────────────────
  useEffect(() => {
    setLoadingConversations(true)
    getConversations()
      .then(setConversations)
      .finally(() => setLoadingConversations(false))
  }, [setConversations, setLoadingConversations])

  // ── Socket setup & teardown ────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return

    supportSocket.connect(accessToken)

    const handleConnect = () => setSocketConnected(true)
    const handleDisconnect = () => setSocketConnected(false)

    const handleNewMessage = ({
      message
    }: {
      message: import('@/types/chat').ChatMessage
    }) => {
      appendMessage(message)
    }

    const handleTyping = ({
      conversationId,
      participantId,
      participantName,
      isTyping
    }: import('@/types/chat').SocketTypingPayload) => {
      setTyping(
        conversationId,
        isTyping ? { participantId, participantName } : null
      )
      // Auto-clear after 4 seconds in case stop event is missed
      if (isTyping) {
        setTimeout(() => setTyping(conversationId, null), 4000)
      }
    }

    const handleConversationUpdated = ({
      conversationId,
      patch
    }: import('@/types/chat').SocketConversationUpdatePayload) => {
      patchConversation(conversationId, patch)
    }

    supportSocket.on('connect', handleConnect)
    supportSocket.on('disconnect', handleDisconnect)
    supportSocket.on('new_message', handleNewMessage)
    supportSocket.on('typing', handleTyping)
    supportSocket.on('conversation_updated', handleConversationUpdated)

    return () => {
      supportSocket.off('connect', handleConnect)
      supportSocket.off('disconnect', handleDisconnect)
      supportSocket.off('new_message', handleNewMessage)
      supportSocket.off('typing', handleTyping)
      supportSocket.off('conversation_updated', handleConversationUpdated)
    }
  }, [
    accessToken,
    appendMessage,
    patchConversation,
    setSocketConnected,
    setTyping
  ])

  // ── Select conversation & load messages ────────────────────────────────────
  const handleSelectConversation = useCallback(
    async (id: string) => {
      if (id === activeConversationId) return
      setActiveConversation(id)
      supportSocket.joinConversation(id)

      // Load messages if not already cached
      const cached = useSupportStore.getState().messagesByConversation[id]
      if (cached) {
        // Still mark as read
        markConversationAsRead(id)
          .then(() => patchConversation(id, { unreadCount: 0 }))
          .catch(() => {})
        return
      }

      setLoadingMessages(id, true)
      try {
        const [msgs] = await Promise.all([
          getMessages({ conversationId: id }),
          markConversationAsRead(id)
        ])
        setMessages(id, msgs)
        patchConversation(id, { unreadCount: 0 })
      } finally {
        setLoadingMessages(id, false)
      }
    },
    [
      activeConversationId,
      setActiveConversation,
      patchConversation,
      setLoadingMessages,
      setMessages
    ]
  )

  // ── Send a message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      if (!activeConversationId || isSending) return

      // Optimistic insert
      const tempId = `tmp_${Date.now()}`
      const optimistic: ChatMessage = {
        id: tempId,
        conversationId: activeConversationId,
        sender: 'admin',
        senderId: 'admin_001',
        content: text,
        timestamp: new Date().toISOString(),
        status: 'sending',
        isPending: true
      }
      appendMessage(optimistic)
      setIsSending(true)

      // Also emit via socket (real-time path)
      supportSocket.sendMessage({
        conversationId: activeConversationId,
        content: text
      })

      try {
        const res = await sendMessage({
          conversationId: activeConversationId,
          content: text
        })
        if (res.success && res.data) {
          replacePendingMessage(tempId, res.data)
        } else {
          // Mark as failed
          useSupportStore
            .getState()
            .setMessageStatus(tempId, activeConversationId, 'failed')
        }
      } catch {
        useSupportStore
          .getState()
          .setMessageStatus(tempId, activeConversationId, 'failed')
      } finally {
        setIsSending(false)
      }
    },
    [activeConversationId, isSending, appendMessage, replacePendingMessage]
  )

  // ── Close ticket ───────────────────────────────────────────────────────────
  const handleCloseTicket = useCallback(async () => {
    if (!activeConversationId) return
    setIsUpdatingStatus(true)
    try {
      const res = await updateConversationStatus({
        conversationId: activeConversationId,
        status: 'closed'
      })
      if (res.success && res.data) {
        patchConversation(activeConversationId, { status: 'closed' })
        supportSocket.closeConversation(activeConversationId)
      }
    } finally {
      setIsUpdatingStatus(false)
    }
  }, [activeConversationId, patchConversation])

  const isLoadingMessages =
    activeConversationId ? loadingMessageIds.has(activeConversationId) : false

  const isClosed = activeConversation?.status === 'closed'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col'>
      {/* Page title bar */}
      <div className='flex h-12 shrink-0 items-center justify-between px-1 pb-3'>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Customer Support</h1>
          <p className='text-xs text-muted-foreground'>
            {conversations.length} conversations ·{' '}
            {conversations.filter((c) => c.status === 'open').length} open
          </p>
        </div>
        {/* Socket status indicator */}
        <div className='flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground'>
          <span
            className={`
              size-2 rounded-full
              ${socketConnected ? 'bg-emerald-500' : 'bg-amber-500'}
            `}
          />
          {socketConnected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      {/* Main chat layout */}
      <div className='flex min-h-0 flex-1 overflow-hidden rounded-2xl border bg-background shadow-sm'>
        {/* Left — conversation list */}
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          isLoading={isLoadingConversations}
          onSelect={handleSelectConversation}
        />

        {/* Right — active conversation */}
        <div className='flex min-w-0 flex-1 flex-col'>
          {!activeConversation ?
            <NoConversationSelected />
          : <>
              <ConversationHeader
                conversation={activeConversation}
                onClose={handleCloseTicket}
                isUpdating={isUpdatingStatus}
              />

              <MessagesArea
                messages={activeMessages}
                isLoading={isLoadingMessages}
                isTyping={!!typingIndicator}
                customerName={activeConversation.customer.name}
              />

              <ChatInput disabled={isClosed || isSending} onSend={handleSend} />

              {isClosed && (
                <div className='border-t bg-muted/30 py-2 text-center text-xs text-muted-foreground'>
                  This ticket is closed. Reopen it to send messages.
                </div>
              )}
            </>
          }
        </div>
      </div>
    </div>
  )
}
