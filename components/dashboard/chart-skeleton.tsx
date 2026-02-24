import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-5 w-40 mb-1' />
        <Skeleton className='h-4 w-64' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-75 w-full rounded-lg' />
      </CardContent>
    </Card>
  )
}
