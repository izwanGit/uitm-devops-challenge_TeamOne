'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Shield,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { createApiUrl } from '@/utils/apiConfig'

interface DashboardStats {
  security: {
    threatLevel: string
    failedLogins: number
    criticalEvents: number
  }
  properties: {
    pending: number
    total: number
  }
  users: {
    total: number
    active: number
  }
  logs: {
    today: number
  }
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { isLoggedIn } = useAuthStore()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isLoggedIn) {
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        // Check if admin
        const userRes = await fetch(createApiUrl('auth/me'), {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.success && userData.data.user.role === 'ADMIN') {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
            setLoading(false)
            return
          }
        }

        // Fetch security stats
        const securityRes = await fetch(createApiUrl('admin/security-stats'), {
          headers: { Authorization: `Bearer ${token}` }
        })

        // Fetch pending properties
        const propertiesRes = await fetch(createApiUrl('properties/pending-approval'), {
          headers: { Authorization: `Bearer ${token}` }
        })

        let securityData = { threatLevel: 'LOW', failedLogins: 0, criticalEvents: 0 }
        let propertiesData = { pending: 0, total: 0 }

        if (securityRes.ok) {
          const data = await securityRes.json()
          if (data.success) {
            securityData = {
              threatLevel: data.data.systemHealth.threatLevel,
              failedLogins: data.data.realTimeStats.failedLogins,
              criticalEvents: data.data.realTimeStats.criticalEvents,
            }
          }
        }

        if (propertiesRes.ok) {
          const data = await propertiesRes.json()
          if (data.success) {
            propertiesData = {
              pending: data.data.approvals?.length || 0,
              total: data.data.pagination?.total || 0,
            }
          }
        }

        setStats({
          security: securityData,
          properties: propertiesData,
          users: { total: 0, active: 0 },
          logs: { today: 0 },
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isLoggedIn])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield className="w-16 h-16 text-red-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-4">You don&apos;t have permission to access the admin panel.</p>
        <Link href="/" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          Go to Home
        </Link>
      </div>
    )
  }

  const getThreatLevelColor = (level: string) => {
    if (level === 'HIGH') return 'from-red-500 to-red-600'
    if (level === 'MEDIUM') return 'from-yellow-500 to-orange-500'
    return 'from-green-500 to-teal-500'
  }

  const getThreatIcon = (level: string) => {
    if (level === 'HIGH') return <AlertTriangle className="w-8 h-8" />
    if (level === 'MEDIUM') return <Activity className="w-8 h-8" />
    return <CheckCircle className="w-8 h-8" />
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-lg md:text-2xl font-bold text-slate-900">Welcome back, Admin</h1>
        <p className="text-sm md:text-base text-slate-500 mt-0.5 md:mt-1">Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Threat Level Card */}
        <Link href="/admin/security" className="group">
          <div className={`relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br ${getThreatLevelColor(stats?.security.threatLevel || 'LOW')} p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="absolute top-0 right-0 opacity-20 transform translate-x-4 -translate-y-4">
              <Shield className="w-20 md:w-32 h-20 md:h-32" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-6 h-6 md:w-8 md:h-8">
                  {getThreatIcon(stats?.security.threatLevel || 'LOW')}
                </div>
                <span className="text-xs md:text-sm font-medium opacity-90">Threat</span>
              </div>
              <p className="text-xl md:text-3xl font-bold">{stats?.security.threatLevel || 'LOW'}</p>
              <p className="text-[10px] md:text-sm opacity-75 mt-1 md:mt-2">
                {stats?.security.failedLogins || 0} failed logins
              </p>
            </div>
            <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
        </Link>

        {/* Pending Properties */}
        <Link href="/admin/properties" className="group">
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-orange-100 rounded-lg md:rounded-xl">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
              <span className={`px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${(stats?.properties.pending || 0) > 0
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
                }`}>
                {(stats?.properties.pending || 0) > 0 ? 'Action' : 'Clear'}
              </span>
            </div>
            <p className="text-xl md:text-3xl font-bold text-slate-900">{stats?.properties.pending || 0}</p>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">Pending</p>
          </div>
        </Link>

        {/* Critical Events */}
        <Link href="/admin/security" className="group">
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-red-100 rounded-lg md:rounded-xl">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
              </div>
              <span className={`px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${(stats?.security.criticalEvents || 0) > 0
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
                }`}>
                {(stats?.security.criticalEvents || 0) > 0 ? 'Alert' : 'OK'}
              </span>
            </div>
            <p className="text-xl md:text-3xl font-bold text-slate-900">{stats?.security.criticalEvents || 0}</p>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">Critical (24h)</p>
          </div>
        </Link>

        {/* Audit Logs */}
        <Link href="/admin/logs" className="group">
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg md:rounded-xl">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] md:text-xs font-medium">Live</span>
              </div>
            </div>
            <p className="text-xl md:text-3xl font-bold text-slate-900">Logs</p>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">Audit Trail</p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Security Overview</h3>
            <Link href="/admin/security" className="text-sm text-teal-600 hover:text-teal-700">
              View Details →
            </Link>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{stats?.security.failedLogins || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Failed Logins</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-orange-600">{stats?.security.criticalEvents || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Critical Events</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">Active</p>
                <p className="text-xs text-slate-500 mt-1">Monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Property Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Property Queue</h3>
            <Link href="/admin/properties" className="text-sm text-teal-600 hover:text-teal-700">
              Review All →
            </Link>
          </div>
          <div className="p-6">
            {(stats?.properties.pending || 0) > 0 ? (
              <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {stats?.properties.pending} properties awaiting review
                  </p>
                  <p className="text-sm text-slate-500">Click to review and approve</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">All caught up!</p>
                  <p className="text-sm text-slate-500">No properties pending review</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}