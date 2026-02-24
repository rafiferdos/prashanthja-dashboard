'use client'

import { useEffect, useState } from 'react'

import { UsersTable } from '@/components/user-management/users-table'
import { MOCK_USERS } from '@/lib/mock-data'

export default function UserManagementPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: replace timeout with actual API call
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>User Management</h1>
        <p className='text-muted-foreground'>
          Manage all registered users — edit details, block access, or remove
          accounts.
        </p>
      </div>

      <UsersTable initialUsers={MOCK_USERS} isLoading={isLoading} />
    </div>
  )
}
