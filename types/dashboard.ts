export interface StatCardData {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
}

export type UserRole = 'Admin' | 'User' | 'Editor' | 'Manager'
export type UserStatus = 'Active' | 'Inactive' | 'Pending'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: string
  avatarUrl?: string
}
