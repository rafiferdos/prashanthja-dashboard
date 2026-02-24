/**
 * Left-side brand panel shared across all auth pages.
 * Hidden on mobile (the logo appears in the form side instead).
 */

import Image from 'next/image'

interface AuthBrandPanelProps {
  quote?: string
  author?: string
}

export function AuthBrandPanel({
  quote = 'The platform that puts your team first.',
  author = 'SparkTech Admin Suite'
}: AuthBrandPanelProps) {
  return (
    <div
      className='
        relative hidden lg:flex lg:flex-col
        h-full w-full overflow-hidden
        bg-linear-to-br from-[#0f4c5c] via-[#1F889E] to-[#20B482]
        px-12 py-10 text-white
      '
    >
      {/* Decorative circles */}
      <span className='pointer-events-none absolute -top-24 -right-24 size-105 rounded-full bg-white/5' />
      <span className='pointer-events-none absolute -bottom-32 -left-32 size-125 rounded-full bg-white/5' />
      <span className='pointer-events-none absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/3' />

      {/* Logo */}
      <div className='relative z-10 flex items-center gap-3'>
        <Image
          src='/assets/logo.svg'
          alt='SparkTech'
          width={36}
          height={36}
          className='invert'
          priority
        />
        <span className='text-lg font-bold tracking-tight'>SparkTech</span>
      </div>

      {/* Center content */}
      <div className='relative z-10 mt-auto mb-auto flex flex-col gap-6'>
        {/* Big decorative quote mark */}
        <span className='text-[80px] leading-none text-white/20 select-none'>
          &ldquo;
        </span>

        <p className='text-3xl font-semibold leading-snug tracking-tight max-w-sm -mt-10'>
          {quote}
        </p>
        <p className='text-sm text-white/60'>{author}</p>
      </div>

      {/* Footer stats */}
      <div className='relative z-10 mt-auto grid grid-cols-3 gap-4 border-t border-white/15 pt-8'>
        {[
          { value: '10K+', label: 'Active Users' },
          { value: '500+', label: 'Events Managed' },
          { value: '99.9%', label: 'Uptime' }
        ].map((stat) => (
          <div key={stat.label} className='flex flex-col gap-0.5'>
            <span className='text-xl font-bold'>{stat.value}</span>
            <span className='text-xs text-white/60'>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
