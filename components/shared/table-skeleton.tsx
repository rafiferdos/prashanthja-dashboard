import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface TableSkeletonProps {
  /** number of skeleton rows to render */
  rows?: number
  /** number of columns */
  cols?: number
  /** whether to show a pagination skeleton below the table */
  showPagination?: boolean
}

export function TableSkeleton({
  rows = 5,
  cols = 5,
  showPagination = false
}: TableSkeletonProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: cols }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className='h-4 w-20' />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton
                      className='h-4'
                      style={{ width: `${60 + ((rowIdx * 3 + colIdx * 7) % 35)}%` }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-40' />
          <div className='flex items-center gap-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-9 w-9 rounded-md' />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
