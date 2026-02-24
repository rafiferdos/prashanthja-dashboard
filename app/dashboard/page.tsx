'use client'

import { IconCreditCard, IconEye, IconUsers } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { RecentUsersTable } from '@/components/dashboard/recent-users-table'
import { StatCard } from '@/components/dashboard/stat-card'
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton'
import { TableSkeleton } from '@/components/shared/table-skeleton'
import { ChartAreaStacked } from '@/components/ui/chart-area-stacked'
import { MOCK_USERS } from '@/lib/mock-data'

const RECENT_USER_COUNT = 5

const statCards = [
  {
    title: 'Total Views',
    value: '2.4M',
    icon: IconEye,
    description: 'from last month',
    trend: { value: 12.5, isPositive: true }
  },
  {
    title: 'Total Users',
    value: '14,231',
    icon: IconUsers,
    description: 'from last month',
    trend: { value: 4.1, isPositive: true }
  },
  {
    title: 'Total Sales',
    value: '$45,231.89',
    icon: IconCreditCard,
    description: 'from last month',
    trend: { value: 2.4, isPositive: false }
  }
]

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: replace timeout with actual API call
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const recentUsers = MOCK_USERS.slice(0, RECENT_USER_COUNT)

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Overview of your platform's performance and recent activity.
        </p>
      </div>

      {/* Stats Row */}
      <div className='grid gap-4 md:grid-cols-3'>
        {isLoading ?
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        : statCards.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Chart Section */}
      {isLoading ?
        <ChartSkeleton />
      : <ChartAreaStacked />}

      {/* Recent Users Table Section */}
      <div className='flex flex-col gap-4'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>Recent Users</h2>
          <p className='text-sm text-muted-foreground'>
            A list of users who recently joined or logged in.
          </p>
        </div>
        {isLoading ?
          <TableSkeleton rows={RECENT_USER_COUNT} cols={5} />
        : <RecentUsersTable users={recentUsers} />}
      </div>
    </div>
  )
}
