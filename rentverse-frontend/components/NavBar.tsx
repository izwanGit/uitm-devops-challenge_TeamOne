import React from 'react'
import NavBarTop from '@/components/NavBarTop'
import NavBarBottom from '@/components/NavBarBottom'

import type { SearchBoxType } from '@/types/searchbox'

interface NavBarProps {
  searchBoxType?: SearchBoxType
}

function NavBar({ searchBoxType = 'none' }: Readonly<NavBarProps>): React.ReactNode {
  return (
    <>
      <NavBarTop searchBoxType={searchBoxType} />
      <NavBarBottom />
    </>
  )
}

export default NavBar