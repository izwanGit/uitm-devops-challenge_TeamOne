'use client'

import clsx from 'clsx'
import React, { useState, useEffect } from 'react'
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
                {/* Hide logo on all mobile screens to match App experience */}
                <div className="hidden md:block">
                    <Link href="/">
                        <Image
                            src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758183655/rentverse-base/logo-nav_j8pl7d.png"
                            alt="Logo Rentverse"
                            className="w-[150px] h-[48px]"
                            width={150}
                            height={48}
                            loading="eager"
                            priority
                        />
                    </Link>
                </div>

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
                        <li>
                            <a
                                href="https://github.com/izwanGit/uitm-devops-challenge_TeamOne/raw/main/releases/rentverse-android.apk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-full hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md"
                                title="Download Android App"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.523 15.3414C17.523 15.2194 17.6356 15.1194 17.7685 15.1194C17.9015 15.1194 18.014 15.2194 18.014 15.3414C18.014 15.4634 17.9015 15.5634 17.7685 15.5634C17.6356 15.5634 17.523 15.4634 17.523 15.3414ZM5.986 15.3414C5.986 15.2194 6.0985 15.1194 6.2315 15.1194C6.3644 15.1194 6.477 15.2194 6.477 15.3414C6.477 15.4634 6.3644 15.5634 6.2315 15.5634C6.0985 15.5634 5.986 15.4634 5.986 15.3414ZM17.815 11.2134L19.4505 8.4084C19.542 8.2524 19.488 8.0564 19.329 7.9654C19.1715 7.8754 18.972 7.9294 18.8805 8.0854L17.226 10.9234C15.6885 10.2214 13.908 9.8174 12 9.8174C10.092 9.8174 8.3115 10.2214 6.774 10.9234L5.1195 8.0854C5.028 7.9294 4.8285 7.8754 4.671 7.9654C4.512 8.0564 4.458 8.2524 4.5495 8.4084L6.185 11.2134C3.8385 12.4414 2.1465 14.4564 1.8 16.8274H22.2C21.8535 14.4564 20.1615 12.4414 17.815 11.2134Z" />
                                </svg>
                                <span className="hidden xl:inline">Get App</span>
                            </a>
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