'use client'

import clsx from 'clsx'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import TextAction from '@/components/TextAction'
import SignUpButton from '@/components/SignUpButton'
import Avatar from '@/components/Avatar'
import UserDropdown from '@/components/UserDropdown'
import LanguageSelector from '@/components/LanguageSelector'
import SearchBoxProperty from '@/components/SearchBoxProperty'
import SearchBoxPropertyMini from '@/components/SearchBoxPropertyMini'
import useCurrentUser from '@/hooks/useCurrentUser'
import { usePropertyListingStore } from '@/stores/propertyListingStore'
import { useSettingsSafe } from '@/contexts/SettingsContext'

import type { SearchBoxType } from '@/types/searchbox'
import ButtonSecondary from '@/components/ButtonSecondary'

interface NavBarTopProps {
  searchBoxType?: SearchBoxType
  isQuestionnaire?: boolean
}

function NavBarTop({ searchBoxType = 'none', isQuestionnaire = false }: Readonly<NavBarTopProps>): React.ReactNode {
  const { user, isAuthenticated } = useCurrentUser()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  const { clearTemporaryData, isDirty } = usePropertyListingStore()
  const { t } = useSettingsSafe()

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
  }

  const handleExit = () => {
    if (isDirty) {
      const confirmExit = window.confirm(
        'You have unsaved changes. Are you sure you want to exit? This will delete all your progress.'
      )
      if (confirmExit) {
        clearTemporaryData()
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }
  return (
    <div className={clsx([
      'w-full fixed z-50',
      'px-6 py-4 bg-white top-0 list-none border-b border-slate-200',
    ])}>
      <div className={clsx([
        'w-full flex items-center justify-between relative',
        searchBoxType === 'full' && 'mb-8',
      ])}>
        <Link href="/">
          <Image
            src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758183655/rentverse-base/logo-nav_j8pl7d.png"
            alt="Logo Rentverse"
            className="w-auto h-12"
            width={150}
            height={48} />
        </Link>

        {(searchBoxType === 'compact' && !isQuestionnaire) &&
          <SearchBoxPropertyMini className="hidden lg:block absolute ml-[16%]" />}

        {!isQuestionnaire && (
          <nav className="hidden md:flex items-center space-x-8">
            <li>
              <TextAction href={'/property/new'} text={t('nav.listProperty')} />
            </li>
            <li>
              <LanguageSelector />
            </li>
            <li className="relative">
              {isAuthenticated && user ? (
                <>
                  <Avatar
                    user={user}
                    onClick={toggleDropdown}
                    className="cursor-pointer"
                  />
                  <UserDropdown
                    isOpen={isDropdownOpen}
                    onClose={closeDropdown}
                  />
                </>
              ) : (
                <SignUpButton />
              )}
            </li>
          </nav>)}
        {isQuestionnaire && <ButtonSecondary label="Exit" onClick={handleExit} />}
      </div>
      {(searchBoxType === 'full' && !isQuestionnaire) && <SearchBoxProperty className="hidden lg:block" />}
    </div>
  )
}

export default NavBarTop