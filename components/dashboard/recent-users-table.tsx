import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { User } from '@/types/dashboard'

interface RecentUsersTableProps {
  users: User[]
}

export function RecentUsersTable({ users }: RecentUsersTableProps) {
  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return 'default'
      case 'Inactive':
        return 'secondary'
      case 'Pending':
        return 'outline'
      default:
        return 'default'
    }
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Last Login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className='font-medium'>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(user.status)}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className='text-right'>
                {new Date(user.lastLogin).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
