'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

interface ButtonFilledProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  size?: 'small' | 'medium' | 'large'
}

function ButtonFilled({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  size = 'medium',
}: ButtonFilledProps) {
  const sizeClasses = {
    small: 'py-2 px-3 text-sm',
    medium: 'py-3 px-4',
    large: 'py-4 px-6 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx([
        'w-full bg-teal-600 text-white font-medium rounded-full cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
        'hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed',
        'transition-colors duration-200',
        sizeClasses[size],
        className,
      ])}
    >
      {children}
    </button>
  )
}

export default ButtonFilled
