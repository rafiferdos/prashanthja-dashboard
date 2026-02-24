/**
 * Minimal card wrapper for auth forms.
 * Shows the logo at top then the children.
 */

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AuthFormPanelProps {
  children: React.ReactNode
  className?: string
}

export function AuthFormPanel({ children, className }: AuthFormPanelProps) {
  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-2xl border bg-background px-8 py-10 shadow-lg',
        className
      )}
    >
      {/* Logo */}
      <div className='mb-8 flex justify-center'>
        <Image
          src='/assets/logo.svg'
          alt='Logo'
          width={140}
          height={32}
          priority
          className='h-8 w-auto object-contain dark:invert'
        />
      </div>

      {children}
    </div>
  )
}
