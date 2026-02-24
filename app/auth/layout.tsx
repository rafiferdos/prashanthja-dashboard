import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auth'
}

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen w-full bg-muted/40 flex items-center justify-center px-4 py-12'>
      {children}
    </div>
  )
}
