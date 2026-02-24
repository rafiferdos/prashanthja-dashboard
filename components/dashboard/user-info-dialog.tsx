'use client'

import { UserStatusBadge } from '@/components/shared/user-status-badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { User } from '@/types/dashboard'

interface UserInfoDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserInfoDialog({
  user,
  open,
  onOpenChange
}: UserInfoDialogProps) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-y-3 gap-x-4 text-sm'>
          <span className='text-muted-foreground'>Role</span>
          <span className='font-medium'>{user.role}</span>

          <span className='text-muted-foreground'>Status</span>
          <span>
            <UserStatusBadge status={user.status} />
          </span>

          <span className='text-muted-foreground'>Last Login</span>
          <span className='font-medium'>
            {new Date(user.lastLogin).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          <span className='text-muted-foreground'>User ID</span>
          <span className='font-mono text-xs text-muted-foreground'>
            {user.id}
          </span>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
