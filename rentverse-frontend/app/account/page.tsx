'use client'

import React from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Avatar from '@/components/Avatar'
import useCurrentUser from '@/hooks/useCurrentUser'
import AuthGuard from '@/components/AuthGuard'
import {
  Shield,
  Calendar,
  Home,
  Heart,
  Settings,
  ChevronRight,
  User
} from 'lucide-react'

export default function AccountPage() {
  const { user } = useCurrentUser()

  const menuItems = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: User,
      href: '/account/profile',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Login & Security',
      description: 'Update password and secure your account',
      icon: Shield,
      href: '/account/security',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'My Rents',
      description: 'View and manage your bookings',
      icon: Calendar,
      href: '/rents',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'My Listings',
      description: 'Manage your properties and listings',
      icon: Home,
      href: '/property/all',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Wishlists',
      description: 'View your saved properties',
      icon: Heart,
      href: '/wishlist',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      title: 'Settings',
      description: 'Manage your preferences',
      icon: Settings,
      href: '/account/settings',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50'
    },
  ]

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-slate-50">
        <NavBar searchBoxType="compact" />

        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Account</h1>
            <p className="mt-2 text-slate-600">
              Manage your profile, security, and preferences.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 flex items-center space-x-6">
            <div className="flex-shrink-0">
              {user && <Avatar user={user} className="w-20 h-20 text-2xl" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {user?.name || 'User'}
              </h2>
              <p className="text-slate-500">{user?.email}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium">
                <User size={14} className="mr-2" />
                Member
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${item.bgColor} ${item.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={24} />
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-teal-500 transition-colors" size={20} />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {item.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}