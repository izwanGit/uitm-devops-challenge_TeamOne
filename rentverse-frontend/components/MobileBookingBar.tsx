'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ButtonFilled from '@/components/ButtonFilled'
import { getLocaledPrice } from '@/utils/property'
import useBookingStore from '@/stores/bookingStore'
import useAuthStore from '@/stores/authStore'

interface MobileBookingBarProps {
    price: number
    propertyId: string
    ownerId?: string
}

function MobileBookingBar({ price, propertyId, ownerId }: MobileBookingBarProps) {
    const router = useRouter()
    const { setPropertyId } = useBookingStore()
    const { user, isLoggedIn } = useAuthStore()
    const formattedPrice = getLocaledPrice(price)

    const isOwner = isLoggedIn && user && ((ownerId && user.id === ownerId) || user.role === 'ADMIN')

    const handleBookingClick = () => {
        setPropertyId(propertyId)
        router.push(`/property/book?id=${propertyId}`)
    }

    const handleEditClick = () => {
        router.push(`/property/modify?id=${propertyId}`)
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-8 z-50 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-teal-600">{formattedPrice.replace('/mo', '')}</span>
                    <span className="text-sm text-slate-500">/ month</span>
                </div>
            </div>

            <div className="w-40">
                {isOwner ? (
                    <ButtonFilled onClick={handleEditClick} size="small">
                        Edit
                    </ButtonFilled>
                ) : (
                    <ButtonFilled onClick={handleBookingClick} size="small">
                        Reserve
                    </ButtonFilled>
                )}
            </div>
        </div>
    )
}

export default MobileBookingBar
