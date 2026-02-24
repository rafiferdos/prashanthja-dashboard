import { Badge } from '@/components/ui/badge'
import { UserStatus } from '@/types/dashboard'

const statusConfig: Record<
  UserStatus,
  {
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
    label: string
  }
> = {
  Active: { variant: 'default', label: 'Active' },
  Inactive: { variant: 'secondary', label: 'Inactive' },
  Pending: { variant: 'outline', label: 'Pending' },
  Blocked: { variant: 'destructive', label: 'Blocked' }
}

interface UserStatusBadgeProps {
  status: UserStatus
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const { variant, label } = statusConfig[status] ?? statusConfig.Active
  return <Badge variant={variant}>{label}</Badge>
}
