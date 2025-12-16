'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { User, Settings, Home, Heart, Search, LogOut, Calendar, Shield } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useCurrentUser from '@/hooks/useCurrentUser'
import { useSettingsSafe } from '@/contexts/SettingsContext'

interface UserDropdownProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

function UserDropdown({ isOpen, onClose, className }: Readonly<UserDropdownProps>): React.ReactNode {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useCurrentUser()
  const { logout } = useAuthStore()
  const { t } = useSettingsSafe()

  // Generate initials from first and last name
  const getInitials = (firstName: string, lastName: string): string => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || ''
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || ''

    // If we have both, use both. If only one, use that one. If none, use email first letter
    if (firstInitial && lastInitial) {
      return firstInitial + lastInitial
    } else if (firstInitial) {
      return firstInitial
    } else if (lastInitial) {
      return lastInitial
    } else {
      return user?.email?.charAt(0)?.toUpperCase() || 'U'
    }
  }

  // Get full name
  const getFullName = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    } else if (user?.name) {
      return user.name
    } else if (user?.firstName) {
      return user.firstName
    } else if (user?.lastName) {
      return user.lastName
    }
    return 'User'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle ESC key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleLogout = () => {
    logout()
    onClose()
    // Redirect to home
    window.location.href = '/'
  }

  if (!isOpen) return null

  const fullName = getFullName()
  const initials = getInitials(user?.firstName || '', user?.lastName || '')

  return (
    <div
      ref={dropdownRef}
      className={clsx([
        'absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg',
        'border border-slate-200 py-3 z-50',
        className
      ])}
    >
      {/* Welcome Header with Profile Photo */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          {/* Profile Photo/Initials */}
          <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-semibold flex items-center justify-center text-lg">
            {initials}
          </div>

          {/* Welcome Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-600 mb-1">
              Welcome,
            </p>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-slate-900 truncate">
                {fullName}
              </p>
              {user?.role === 'ADMIN' && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="mt-3">
          <p className="text-sm text-slate-500 truncate">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {/* Customer Mode */}
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Mode</p>
        </div>

        <Link
          href="/property"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
        >
          <Search size={18} className="mr-3 text-slate-400" />
          <span className="font-medium">{t('nav.explore')}</span>
        </Link>

        <Link
          href="/rents"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
        >
          <Calendar size={18} className="mr-3 text-slate-400" />
          <span className="font-medium">{t('nav.myRents')}</span>
        </Link>

        <Link
          href="/wishlist"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
        >
          <Heart size={18} className="mr-3 text-slate-400" />
          <span className="font-medium">{t('nav.wishlist')}</span>
        </Link>

        {/* Separator */}
        <div className="border-t border-slate-100 my-2"></div>

        {/* Seller Mode */}
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seller Mode</p>
        </div>

        <Link
          href="/property/all"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
        >
          <Home size={18} className="mr-3 text-slate-400" />
          <span className="font-medium">{t('nav.myListings')}</span>
        </Link>

        {/* Admin Portal - Only show for admin users */}
        {user?.role === 'ADMIN' && (
          <>
            {/* Separator */}
            <div className="border-t border-slate-100 my-2"></div>

            {/* Admin Mode */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Admin Portal</p>
            </div>

            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center mx-2 px-3 py-3 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors duration-200 border border-teal-100"
            >
              <Shield size={18} className="mr-3 text-teal-600" />
              <span className="font-medium">{t('nav.admin')}</span>
              <span className="ml-auto text-teal-400">→</span>
            </Link>
          </>
        )}

        {/* Separator */}
        <div className="border-t border-slate-100 my-2"></div>

        {/* Account Settings */}
        <Link
          href="/account"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
        >
          <User size={18} className="mr-3 text-slate-400" />
          <span className="font-medium">{t('nav.account')}</span>
        </Link>

        <Link
          href="/account/settings"
          onClick={onClose}
          className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
        >
          <Settings size={18} className="mr-3 text-slate-400" />
          <span className="font-medium">{t('nav.settings')}</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="border-t border-slate-100 py-2">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut size={18} className="mr-3 text-red-500" />
          <span className="font-medium">{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  )
}

export default UserDropdown