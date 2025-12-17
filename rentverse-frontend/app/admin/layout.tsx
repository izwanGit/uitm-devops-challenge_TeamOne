'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    Shield,
    Building2,
    FileText,
    Menu,
    X,
    Home,
    ChevronRight
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
    description: string
}

const navigation: NavItem[] = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard, description: 'Dashboard summary' },
    { name: 'Security', href: '/admin/security', icon: Shield, description: 'Security monitoring' },
    { name: 'Properties', href: '/admin/properties', icon: Building2, description: 'Property moderation' },
    { name: 'Audit Logs', href: '/admin/logs', icon: FileText, description: 'Activity logs' },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
    const { isLoggedIn } = useAuthStore()

    useEffect(() => {
        const checkUser = async () => {
            if (!isLoggedIn) return

            try {
                const token = localStorage.getItem('authToken')
                if (!token) return

                const res = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.success) {
                        setUser(data.data.user)
                    }
                }
            } catch (err) {
                console.error('Failed to fetch user', err)
            }
        }

        checkUser()
    }, [isLoggedIn])

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin'
        }
        return pathname.startsWith(href)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="https://res.cloudinary.com/dqhuvu22u/image/upload/f_webp/v1758183655/rentverse-base/logo-nav_j8pl7d.png"
                            alt="RentVerse"
                            width={120}
                            height={40}
                            className="h-8 w-auto"
                        />
                    </Link>
                    <button
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Admin Badge */}
                <div className="px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 rounded-xl border border-teal-100">
                        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-teal-900">Admin Portal</p>
                            <p className="text-xs text-teal-600">Management Console</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-4 py-4 space-y-1">
                    <p className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Menu
                    </p>
                    {navigation.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                                    ${active
                                        ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }
                                `}
                            >
                                <item.icon size={20} className={active ? 'text-white' : 'text-slate-400'} />
                                <div className="flex-1">
                                    <span>{item.name}</span>
                                    {!active && (
                                        <p className="text-xs text-slate-400 font-normal">{item.description}</p>
                                    )}
                                </div>
                                {active && <ChevronRight size={16} className="opacity-70" />}
                            </Link>
                        )
                    })}
                </nav>

                {/* Back to Site Link */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white">
                    {user && (
                        <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {user.name?.charAt(0) || user.email?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {user.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        <Home size={16} />
                        Back to RentVerse
                    </Link>
                </div>
            </aside>

            {/* Main content area */}
            <div className="lg:pl-72">
                {/* Top header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 pt-4 lg:pt-0">
                    <div className="flex items-center justify-between h-14 lg:h-16 px-4 sm:px-6">
                        <div className="flex items-center gap-3 lg:gap-4">
                            <button
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <h1 className="text-base lg:text-lg font-semibold text-slate-900">
                                    {navigation.find(n => isActive(n.href))?.name || 'Admin'}
                                </h1>
                                <p className="text-[10px] lg:text-xs text-slate-500 hidden sm:block">
                                    {navigation.find(n => isActive(n.href))?.description || 'RentVerse Administration'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-[10px] lg:text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                ● Online
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-3 sm:p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
