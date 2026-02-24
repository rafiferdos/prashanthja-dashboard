/**
 * Customer Support API Service
 *
 * All functions are mock-implemented and ready to be replaced with real HTTP
 * calls.  Signatures, return types, and error shapes will NOT change — only
 * swap the body for your real `fetch` / `axios` calls.
 *
 * Real-world base path:  /api/support
 */

import type { ApiResponse } from '@/types/api'
import type {
  ChatMessage,
  Conversation,
  GetMessagesPayload,
  SendMessagePayload,
  UpdateConversationStatusPayload
} from '@/types/chat'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const now = new Date()
const ts = (minutesAgo: number) =>
  new Date(now.getTime() - minutesAgo * 60_000).toISOString()

const ADMIN_ID = 'admin_001'

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_001',
    customer: {
      id: 'usr_101',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatarUrl: null
    },
    status: 'open',
    subject: 'Cannot access my account',
    lastMessage: 'I still cannot log in, any update?',
    lastMessageAt: ts(3),
    unreadCount: 2,
    createdAt: ts(60)
  },
  {
    id: 'conv_002',
    customer: {
      id: 'usr_102',
      name: 'Bob Martinez',
      email: 'bob@example.com',
      avatarUrl: null
    },
    status: 'open',
    subject: 'Payment failed twice',
    lastMessage: 'The charge keeps failing on my Visa.',
    lastMessageAt: ts(15),
    unreadCount: 1,
    createdAt: ts(90)
  },
  {
    id: 'conv_003',
    customer: {
      id: 'usr_103',
      name: 'Carol White',
      email: 'carol@example.com',
      avatarUrl: null
    },
    status: 'pending',
    subject: 'Feature request: dark mode',
    lastMessage: 'Any ETA on this?',
    lastMessageAt: ts(45),
    unreadCount: 0,
    createdAt: ts(180)
  },
  {
    id: 'conv_004',
    customer: {
      id: 'usr_104',
      name: 'David Kim',
      email: 'david@example.com',
      avatarUrl: null
    },
    status: 'open',
    subject: 'Profile photo not uploading',
    lastMessage: 'Still getting a 413 error.',
    lastMessageAt: ts(120),
    unreadCount: 3,
    createdAt: ts(200)
  },
  {
    id: 'conv_005',
    customer: {
      id: 'usr_105',
      name: 'Emma Davis',
      email: 'emma@example.com',
      avatarUrl: null
    },
    status: 'closed',
    subject: 'How to export data?',
    lastMessage: 'Got it, thanks for the help!',
    lastMessageAt: ts(300),
    unreadCount: 0,
    createdAt: ts(600)
  },
  {
    id: 'conv_006',
    customer: {
      id: 'usr_106',
      name: 'Frank Lee',
      email: 'frank@example.com',
      avatarUrl: null
    },
    status: 'open',
    subject: 'App crashes on startup',
    lastMessage: 'Confirmed on iOS 17 as well.',
    lastMessageAt: ts(8),
    unreadCount: 1,
    createdAt: ts(30)
  },
  {
    id: 'conv_007',
    customer: {
      id: 'usr_107',
      name: 'Grace Chen',
      email: 'grace@example.com',
      avatarUrl: null
    },
    status: 'pending',
    subject: 'Notification emails not arriving',
    lastMessage: "Checked spam folder, they're not there.",
    lastMessageAt: ts(55),
    unreadCount: 0,
    createdAt: ts(400)
  },
  {
    id: 'conv_008',
    customer: {
      id: 'usr_108',
      name: 'Harry Brown',
      email: 'harry@example.com',
      avatarUrl: null
    },
    status: 'closed',
    subject: 'Billing cycle question',
    lastMessage: 'Perfect, that makes sense. Thanks!',
    lastMessageAt: ts(1440),
    unreadCount: 0,
    createdAt: ts(2880)
  }
]

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  conv_001: [
    {
      id: 'msg_001',
      conversationId: 'conv_001',
      sender: 'customer',
      senderId: 'usr_101',
      content: 'Hi, I cannot log in to my account since this morning.',
      timestamp: ts(60),
      status: 'read'
    },
    {
      id: 'msg_002',
      conversationId: 'conv_001',
      sender: 'admin',
      senderId: ADMIN_ID,
      content:
        'Hi Alice! Sorry to hear that. Can you tell me what error message you see?',
      timestamp: ts(55),
      status: 'read'
    },
    {
      id: 'msg_003',
      conversationId: 'conv_001',
      sender: 'customer',
      senderId: 'usr_101',
      content: 'It says "Invalid credentials" but I know my password is right.',
      timestamp: ts(50),
      status: 'read'
    },
    {
      id: 'msg_004',
      conversationId: 'conv_001',
      sender: 'admin',
      senderId: ADMIN_ID,
      content: 'Let me check your account status right now.',
      timestamp: ts(48),
      status: 'read'
    },
    {
      id: 'msg_005',
      conversationId: 'conv_001',
      sender: 'admin',
      senderId: ADMIN_ID,
      content:
        "I see your account was temporarily locked after too many failed attempts. I've unlocked it now — please try again.",
      timestamp: ts(45),
      status: 'read'
    },
    {
      id: 'msg_006',
      conversationId: 'conv_001',
      sender: 'customer',
      senderId: 'usr_101',
      content: "Still the same error, it's still not working.",
      timestamp: ts(10),
      status: 'delivered'
    },
    {
      id: 'msg_007',
      conversationId: 'conv_001',
      sender: 'customer',
      senderId: 'usr_101',
      content: 'I still cannot log in, any update?',
      timestamp: ts(3),
      status: 'delivered'
    }
  ],
  conv_002: [
    {
      id: 'msg_010',
      conversationId: 'conv_002',
      sender: 'customer',
      senderId: 'usr_102',
      content: 'My payment keeps failing even though the card has funds.',
      timestamp: ts(90),
      status: 'read'
    },
    {
      id: 'msg_011',
      conversationId: 'conv_002',
      sender: 'admin',
      senderId: ADMIN_ID,
      content:
        'Hi Bob! Could you share the last 4 digits of the card being charged?',
      timestamp: ts(80),
      status: 'read'
    },
    {
      id: 'msg_012',
      conversationId: 'conv_002',
      sender: 'customer',
      senderId: 'usr_102',
      content: 'It ends in 4242. Tried twice now.',
      timestamp: ts(70),
      status: 'read'
    },
    {
      id: 'msg_013',
      conversationId: 'conv_002',
      sender: 'admin',
      senderId: ADMIN_ID,
      content:
        "I can see two declined transactions. Our payment processor flagged them as suspicious — I'll whitelist your account.",
      timestamp: ts(60),
      status: 'read'
    },
    {
      id: 'msg_014',
      conversationId: 'conv_002',
      sender: 'customer',
      senderId: 'usr_102',
      content: 'The charge keeps failing on my Visa.',
      timestamp: ts(15),
      status: 'delivered'
    }
  ],
  conv_003: [
    {
      id: 'msg_020',
      conversationId: 'conv_003',
      sender: 'customer',
      senderId: 'usr_103',
      content: 'Would love to see a dark mode option!',
      timestamp: ts(180),
      status: 'read'
    },
    {
      id: 'msg_021',
      conversationId: 'conv_003',
      sender: 'admin',
      senderId: ADMIN_ID,
      content:
        "Thanks for the request Carol! I've logged this as a feature request for our product team.",
      timestamp: ts(160),
      status: 'read'
    },
    {
      id: 'msg_022',
      conversationId: 'conv_003',
      sender: 'customer',
      senderId: 'usr_103',
      content: 'Any ETA on this?',
      timestamp: ts(45),
      status: 'delivered'
    }
  ],
  conv_004: [
    {
      id: 'msg_030',
      conversationId: 'conv_004',
      sender: 'customer',
      senderId: 'usr_104',
      content: "I can't upload my profile photo — it just errors out.",
      timestamp: ts(200),
      status: 'read'
    },
    {
      id: 'msg_031',
      conversationId: 'conv_004',
      sender: 'admin',
      senderId: ADMIN_ID,
      content: 'Hi David! What file size/format are you trying to upload?',
      timestamp: ts(195),
      status: 'read'
    },
    {
      id: 'msg_032',
      conversationId: 'conv_004',
      sender: 'customer',
      senderId: 'usr_104',
      content: "It's a 6MB JPEG.",
      timestamp: ts(190),
      status: 'read'
    },
    {
      id: 'msg_033',
      conversationId: 'conv_004',
      sender: 'admin',
      senderId: ADMIN_ID,
      content: 'The limit is 5MB. Please compress the image and try again.',
      timestamp: ts(185),
      status: 'read'
    },
    {
      id: 'msg_034',
      conversationId: 'conv_004',
      sender: 'customer',
      senderId: 'usr_104',
      content: 'Compressed it to 4.8MB but still getting a 413 error.',
      timestamp: ts(130),
      status: 'delivered'
    },
    {
      id: 'msg_035',
      conversationId: 'conv_004',
      sender: 'customer',
      senderId: 'usr_104',
      content: 'Still getting a 413 error.',
      timestamp: ts(120),
      status: 'delivered'
    },
    {
      id: 'msg_036',
      conversationId: 'conv_004',
      sender: 'customer',
      senderId: 'usr_104',
      content: 'Hello? Is anyone there?',
      timestamp: ts(60),
      status: 'delivered'
    }
  ],
  conv_006: [
    {
      id: 'msg_050',
      conversationId: 'conv_006',
      sender: 'customer',
      senderId: 'usr_106',
      content: 'App crashes immediately on open since the last update.',
      timestamp: ts(30),
      status: 'read'
    },
    {
      id: 'msg_051',
      conversationId: 'conv_006',
      sender: 'admin',
      senderId: ADMIN_ID,
      content: 'Hi Frank! Which device and OS version are you on?',
      timestamp: ts(25),
      status: 'read'
    },
    {
      id: 'msg_052',
      conversationId: 'conv_006',
      sender: 'customer',
      senderId: 'usr_106',
      content: 'iPhone 15 Pro, iOS 17.3.',
      timestamp: ts(20),
      status: 'read'
    },
    {
      id: 'msg_053',
      conversationId: 'conv_006',
      sender: 'customer',
      senderId: 'usr_106',
      content: 'Confirmed on iOS 17 as well.',
      timestamp: ts(8),
      status: 'delivered'
    }
  ]
}

// Ensure every conversation has an (optionally empty) message array
MOCK_CONVERSATIONS.forEach((c) => {
  if (!MOCK_MESSAGES[c.id]) MOCK_MESSAGES[c.id] = []
})

// In-memory mutable copies
let _conversations = MOCK_CONVERSATIONS.map((c) => ({ ...c }))
const _messages: Record<string, ChatMessage[]> = Object.fromEntries(
  Object.entries(MOCK_MESSAGES).map(([k, v]) => [k, v.map((m) => ({ ...m }))])
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ─── API functions ────────────────────────────────────────────────────────────

/** Fetch all conversations, sorted by most recent activity. */
export async function getConversations(): Promise<Conversation[]> {
  // TODO: GET /api/support/conversations
  await delay(600)
  return [..._conversations].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )
}

/** Fetch messages for a single conversation (newest last). */
export async function getMessages(
  payload: GetMessagesPayload
): Promise<ChatMessage[]> {
  // TODO: GET /api/support/conversations/:id/messages?before=&limit=
  await delay(400)
  const msgs = _messages[payload.conversationId] ?? []
  if (!payload.before) return msgs.slice(-(payload.limit ?? 50))

  const idx = msgs.findIndex((m) => m.id === payload.before)
  const end = idx === -1 ? msgs.length : idx
  return msgs.slice(Math.max(0, end - (payload.limit ?? 30)), end)
}

/** Send a new message from the admin side. */
export async function sendMessage(
  payload: SendMessagePayload
): Promise<ApiResponse<ChatMessage>> {
  // TODO: POST /api/support/conversations/:id/messages
  await delay(300)
  const message: ChatMessage = {
    id: generateId('msg'),
    conversationId: payload.conversationId,
    sender: 'admin',
    senderId: ADMIN_ID,
    content: payload.content,
    timestamp: new Date().toISOString(),
    status: 'sent'
  }

  if (!_messages[payload.conversationId]) {
    _messages[payload.conversationId] = []
  }
  _messages[payload.conversationId].push(message)

  // Update conversation's last message
  _conversations = _conversations.map((c) =>
    c.id === payload.conversationId ?
      { ...c, lastMessage: payload.content, lastMessageAt: message.timestamp }
    : c
  )

  return { success: true, data: message }
}

/** Mark all unread messages in a conversation as read. */
export async function markConversationAsRead(
  conversationId: string
): Promise<ApiResponse<void>> {
  // TODO: PATCH /api/support/conversations/:id/read
  await delay(200)
  _conversations = _conversations.map((c) =>
    c.id === conversationId ? { ...c, unreadCount: 0 } : c
  )
  return { success: true }
}

/** Change a conversation's status (open / pending / closed). */
export async function updateConversationStatus(
  payload: UpdateConversationStatusPayload
): Promise<ApiResponse<Conversation>> {
  // TODO: PATCH /api/support/conversations/:id/status
  await delay(300)
  let updated: Conversation | undefined
  _conversations = _conversations.map((c) => {
    if (c.id === payload.conversationId) {
      updated = { ...c, status: payload.status }
      return updated
    }
    return c
  })
  if (!updated) return { success: false, error: 'Conversation not found' }
  return { success: true, data: updated }
}
