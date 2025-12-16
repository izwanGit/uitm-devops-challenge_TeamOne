'use client'

import Link from "next/link"
import { Search, Heart, User } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { useSettingsSafe } from '@/contexts/SettingsContext'

type NavItem = 'explore' | 'wishlists' | 'login'

function NavBarBottom() {
  const [activeTab, setActiveTab] = useState<NavItem>('explore')
  const { t } = useSettingsSafe()

  const handleTabClick = (tab: NavItem) => {
    setActiveTab(tab)
  }

  return (
    <nav className={clsx([
      'fixed z-50',
      'block md:hidden',
      'bottom-0 left-0 right-0 bg-white border-t border-slate-200'
    ])}>
      <ul className="flex items-center justify-around py-3 px-4">
        <li>
          <Link
            href='/'
            onClick={() => handleTabClick('explore')}
            className="flex flex-col items-center space-y-1 group"
          >
            <Search
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
              {t('nav.explore')}
            </span>
          </Link>
        </li>
        <li>
          <Link
            href='/'
            onClick={() => handleTabClick('wishlists')}
            className="flex flex-col items-center space-y-1 group"
          >
            <Heart
              size={24}
              className={`transition-colors duration-200 ${activeTab === 'wishlists'
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                }`}
            />
            <span
              className={`text-xs font-medium transition-colors duration-200 ${activeTab === 'wishlists'
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                }`}
            >
              {t('nav.wishlist')}
            </span>
          </Link>
        </li>
        <li>
          <Link
            href='/'
            onClick={() => handleTabClick('login')}
            className="flex flex-col items-center space-y-1 group"
          >
            <User
              size={24}
              className={`transition-colors duration-200 ${activeTab === 'login'
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                }`}
            />
            <span
              className={`text-xs font-medium transition-colors duration-200 ${activeTab === 'login'
                  ? 'text-teal-600'
                  : 'text-slate-400 group-hover:text-slate-600'
                }`}
            >
              {t('nav.login')}
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default NavBarBottom