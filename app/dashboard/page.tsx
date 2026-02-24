import { IconCreditCard, IconEye, IconUsers } from '@tabler/icons-react'

import { RecentUsersTable } from '@/components/dashboard/recent-users-table'
import { StatCard } from '@/components/dashboard/stat-card'
import { ChartAreaStacked } from '@/components/ui/chart-area-stacked'
import { MOCK_USERS } from '@/lib/mock-data'

export default function DashboardPage() {
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
        <StatCard
          title='Total Views'
          value='2.4M'
          icon={IconEye}
          description='from last month'
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title='Total Users'
          value='14,231'
          icon={IconUsers}
          description='from last month'
          trend={{ value: 4.1, isPositive: true }}
        />
        <StatCard
          title='Total Sales'
          value='$45,231.89'
          icon={IconCreditCard}
          description='from last month'
          trend={{ value: 2.4, isPositive: false }}
        />
      </div>

      {/* Chart Section */}
      <div className='grid gap-4 md:grid-cols-1'>
        <ChartAreaStacked />
      </div>

      {/* Recent Users Table Section */}
      <div className='flex flex-col gap-4'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>Recent Users</h2>
          <p className='text-sm text-muted-foreground'>
            A list of users who recently joined or logged in.
          </p>
        </div>
        <RecentUsersTable users={MOCK_USERS} />
      </div>
    </div>
  )
}
