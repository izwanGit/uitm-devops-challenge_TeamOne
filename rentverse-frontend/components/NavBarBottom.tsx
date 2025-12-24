'use client'

import React from 'react'
import Link from "next/link"
import { Search, Heart, User, LogIn, Calendar, Home, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useSettingsSafe } from '@/contexts/SettingsContext'
import useCurrentUser from '@/hooks/useCurrentUser'
import { useRouter, usePathname } from 'next/navigation'

type NavItem = 'explore' | 'rents' | 'login' | 'profile' | 'wishlists'

import MobileUserMenu from '@/components/MobileUserMenu'

function NavBarBottom() {
  const [activeTab, setActiveTab] = useState<NavItem>('explore')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useSettingsSafe()
  const { user, isAuthenticated } = useCurrentUser()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/') setActiveTab('explore')
    else if (pathname === '/rents') setActiveTab('rents')
    else if (pathname === '/wishlist') setActiveTab('wishlists')
    else if (pathname === '/auth') setActiveTab('login')
    else if (pathname.startsWith('/account')) setActiveTab('profile')
  }, [pathname])

  // Hide on admin pages (admin has its own navigation)
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <nav className={clsx([
        'fixed z-[9999]',
        'block md:hidden',
        'bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe'
      ])}>
        <ul className="flex items-center justify-around py-3 px-4">
          <li>
            <Link
              href='/'
              className="flex flex-col items-center space-y-1 group"
            >
              <Home
                size={24}
                className={`transition-colors duration-200 ${activeTab === 'explore'
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                  }`}
              />
              <span
                className={`text-xs font-medium transition-colors duration-200 ${activeTab === 'explore'
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                  }`}
              >
                Home
              </span>
            </Link>
          </li>
          <li>
            <Link
              href={isAuthenticated ? '/rents' : '/auth'}
              className="flex flex-col items-center space-y-1 group"
            >
              <Calendar
                size={24}
                className={`transition-colors duration-200 ${activeTab === 'rents'
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                  }`}
              />
              <span
                className={`text-xs font-medium transition-colors duration-200 ${activeTab === 'rents'
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                  }`}
              >
                My Rents
              </span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => isAuthenticated ? setIsMenuOpen(true) : router.push('/auth')}
              className="flex flex-col items-center space-y-1 group"
            >
              {isAuthenticated ? (
                <Menu
                  size={24}
                  className={`transition-colors duration-200 ${activeTab === 'profile' || isMenuOpen
                    ? 'text-teal-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                />
              ) : (
                <LogIn
                  size={24}
                  className={`transition-colors duration-200 ${activeTab === 'login'
                    ? 'text-teal-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                />
              )}

              <span
                className={`text-xs font-medium transition-colors duration-200 ${activeTab === 'login' || activeTab === 'profile' || isMenuOpen
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                  }`}
              >
                {isAuthenticated ? 'Menu' : t('nav.login')}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile User Menu */}
      <MobileUserMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}

export default NavBarBottom
