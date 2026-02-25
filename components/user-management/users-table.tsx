'use client'

import {
  IconEdit,
  IconLock,
  IconLockOpen,
  IconTrash
} from '@tabler/icons-react'
import { useState } from 'react'

import { UserInfoDialog } from '@/components/dashboard/user-info-dialog'
import { TableSkeleton } from '@/components/shared/table-skeleton'
import { UserStatusBadge } from '@/components/shared/user-status-badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { User, UserRole } from '@/types/dashboard'
import { sileo } from 'sileo'

// ─── API stubs (swap with real calls) ────────────────────────────────────────
async function apiUpdateUser(user: User): Promise<User> {
  // TODO: replace with: return fetch(`/api/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) }).then(r => r.json())
  return user
}

async function apiDeleteUser(id: string): Promise<void> {
  // TODO: replace with: await fetch(`/api/users/${id}`, { method: 'DELETE' })
  void id
}

async function apiToggleBlock(user: User): Promise<User> {
  // TODO: replace with: return fetch(`/api/users/${user.id}/block`, { method: 'PATCH' }).then(r => r.json())
  return { ...user, status: user.status === 'Blocked' ? 'Active' : 'Blocked' }
}
// ─────────────────────────────────────────────────────────────────────────────

const ROLES: UserRole[] = ['Admin', 'Manager', 'Editor', 'User']
const PAGE_SIZE = 10

interface UsersTableProps {
  initialUsers: User[]
  isLoading?: boolean
}

export function UsersTable({
  initialUsers,
  isLoading = false
}: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [page, setPage] = useState(1)

  // ── dialog state ──
  const [viewTarget, setViewTarget] = useState<User | null>(null)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<Pick<
    User,
    'name' | 'email' | 'role'
  > | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [blockTarget, setBlockTarget] = useState<User | null>(null)

  // ── pagination ──
  const totalPages = Math.ceil(users.length / PAGE_SIZE)
  const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── actions ──
  function openEdit(user: User) {
    setEditTarget(user)
    setEditForm({ name: user.name, email: user.email, role: user.role })
  }

  async function handleEditSave() {
    if (!editTarget || !editForm) return
    const updated = await sileo.promise(
      apiUpdateUser({ ...editTarget, ...editForm }),
      {
        loading: {
          title: 'Saving changes…',
          description: `Updating ${editForm.name}'s profile.`
        },
        success: (u) => ({
          title: 'User updated',
          description: `${u.name}'s info has been saved.`
        }),
        error: {
          title: 'Update failed',
          description: 'Something went wrong. Please try again.'
        }
      }
    )
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setEditTarget(null)
    setEditForm(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const name = deleteTarget.name
    await sileo.promise(apiDeleteUser(deleteTarget.id), {
      loading: {
        title: 'Deleting user…',
        description: `Removing ${name} from the system.`
      },
      success: {
        title: 'User deleted',
        description: `${name} has been permanently removed.`
      },
      error: {
        title: 'Delete failed',
        description: 'Something went wrong. Please try again.'
      }
    })
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
    setDeleteTarget(null)
    if (paginatedUsers.length === 1 && page > 1) setPage((p) => p - 1)
  }

  async function handleToggleBlock() {
    if (!blockTarget) return
    const isBlocking = blockTarget.status !== 'Blocked'
    const updated = await sileo.promise(apiToggleBlock(blockTarget), {
      loading: {
        title: `${isBlocking ? 'Blocking' : 'Unblocking'} user…`,
        description: `Updating ${blockTarget.name}'s access.`
      },
      success: (u) => ({
        title: isBlocking ? 'User blocked' : 'User unblocked',
        description: `${u.name}'s access has been ${isBlocking ? 'revoked' : 'restored'}.`
      }),
      error: {
        title: 'Action failed',
        description: 'Something went wrong. Please try again.'
      }
    })
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setBlockTarget(null)
  }

  // ── pagination helper ──
  function buildPageNumbers(): (number | 'ellipsis')[] {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | 'ellipsis')[] = [1]
    if (page > 3) pages.push('ellipsis')
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }

  if (isLoading) {
    return <TableSkeleton rows={PAGE_SIZE} cols={6} showPagination />
  }

  return (
    <>
      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow
                key={user.id}
                className='cursor-pointer'
                onClick={() => setViewTarget(user)}
              >
                <TableCell className='font-medium'>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell>
                  {new Date(user.lastLogin).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    {/* Edit */}
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      aria-label='Edit user'
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(user)
                      }}
                    >
                      <IconEdit className='h-4 w-4' />
                    </Button>

                    {/* Block / Unblock */}
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      aria-label={
                        user.status === 'Blocked' ?
                          'Unblock user'
                        : 'Block user'
                      }
                      onClick={(e) => {
                        e.stopPropagation()
                        setBlockTarget(user)
                      }}
                    >
                      {user.status === 'Blocked' ?
                        <IconLockOpen className='h-4 w-4 text-emerald-500' />
                      : <IconLock className='h-4 w-4 text-amber-500' />}
                    </Button>

                    {/* Delete */}
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      aria-label='Delete user'
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(user)
                      }}
                    >
                      <IconTrash className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <span>
          Showing {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, users.length)} of {users.length} users
        </span>
        <Pagination className='mx-0 w-auto'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {buildPageNumbers().map((p, idx) =>
              p === 'ellipsis' ?
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              : <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* ── Edit Dialog ───────────────────────────────────────────────────── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          {editForm && (
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-name'>Name</Label>
                <Input
                  id='edit-name'
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => f && { ...f, name: e.target.value })
                  }
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='edit-email'>Email</Label>
                <Input
                  id='edit-email'
                  type='email'
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => f && { ...f, email: e.target.value })
                  }
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='edit-role'>Role</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(val) =>
                    setEditForm((f) => f && { ...f, role: val as UserRole })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className='font-medium text-foreground'>
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              render={<Button variant='destructive' />}
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Block / Unblock Confirm ───────────────────────────────────────── */}
      <AlertDialog
        open={!!blockTarget}
        onOpenChange={(open) => !open && setBlockTarget(null)}
      >
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockTarget?.status === 'Blocked' ?
                'Unblock User'
              : 'Block User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget?.status === 'Blocked' ?
                `Unblocking ${blockTarget?.name} will restore their access.`
              : `Blocking ${blockTarget?.name} will revoke their access immediately.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBlockTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              render={
                <Button
                  variant={
                    blockTarget?.status === 'Blocked' ?
                      'default'
                    : 'destructive'
                  }
                />
              }
              onClick={handleToggleBlock}
            >
              {blockTarget?.status === 'Blocked' ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── View User Info ─────────────────────────────────────────────────── */}
      <UserInfoDialog
        user={viewTarget}
        open={!!viewTarget}
        onOpenChange={(open) => !open && setViewTarget(null)}
      />
    </>
  )
}
