import React from 'react'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'

import type { SearchBoxType } from '@/types/searchbox'
import clsx from 'clsx'

interface ContentWrapperProps {
  children: React.ReactNode
  withFooter?: boolean
  hideFooterOnMobile?: boolean
  searchBoxType?: SearchBoxType
}

function ContentWrapper({
  children,
  withFooter = true,
  hideFooterOnMobile = false,
  searchBoxType = 'none'
}: ContentWrapperProps): React.ReactNode {
  return (
    <>
      <NavBar searchBoxType={searchBoxType} />
      <div className={clsx([
        'relative',
        searchBoxType === 'full' ? 'pt-48' : 'pt-24',
        'pb-20 md:pb-0' // Add space for bottom nav on mobile
      ])}>
        {children}
      </div>
      {withFooter && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
    </>
  )
}

export default ContentWrapper
