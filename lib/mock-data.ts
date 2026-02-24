import { User } from '@/types/dashboard'

export const MOCK_USERS: User[] = [
  {
    id: 'usr_01',
    name: 'Alice Freeman',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2026-02-24T10:23:00Z'
  },
  {
    id: 'usr_02',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2026-02-20T14:15:00Z'
  },
  {
    id: 'usr_03',
    name: 'Charlie Davis',
    email: 'charlie.d@example.com',
    role: 'Editor',
    status: 'Active',
    lastLogin: '2026-02-23T09:45:00Z'
  },
  {
    id: 'usr_04',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    role: 'Manager',
    status: 'Pending',
    lastLogin: '2026-02-24T08:10:00Z'
  },
  {
    id: 'usr_05',
    name: 'Evan Wright',
    email: 'evan.w@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2026-02-22T16:30:00Z'
  }
]
