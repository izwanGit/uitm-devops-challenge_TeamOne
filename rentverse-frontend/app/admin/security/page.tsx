'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    Shield,
    AlertTriangle,
    Lock,
    Activity,
    RefreshCw,
    CheckCircle,
    XCircle,
    Globe,
    User,
    ExternalLink,
    Zap
} from 'lucide-react'
import { createApiUrl } from '@/utils/apiConfig'

interface SecurityStats {
    realTimeStats: {
        failedLogins: number
        criticalEvents: number
        blockedAttempts: number
        suspiciousEvents: number
        lockedAccounts: number
        activeSessions: number
    }
    systemHealth: {
        totalUsers: number
        threatLevel: string
    }
    recentThreats: Array<{
        id: string
        action: string
        severity: string
        status: string
        createdAt: string
        ipAddress?: string
        user?: { email: string; name: string }
    }>
}

export default function AdminSecurityPage() {
    const [stats, setStats] = useState<SecurityStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    const fetchSecurityStats = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true)

        try {
            const token = localStorage.getItem('authToken')
            if (!token) return

            const res = await fetch(createApiUrl('admin/security-stats'), {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setStats(data.data)
                    setLastUpdated(new Date())
                }
            }
        } catch (err) {
            console.error('Failed to fetch security stats', err)
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchSecurityStats()

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => fetchSecurityStats(), 30000)
        return () => clearInterval(interval)
    }, [fetchSecurityStats])

    const getThreatLevelConfig = (level: string) => {
        if (level === 'HIGH') return {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: 'bg-red-100',
            iconColor: 'text-red-600',
            text: 'text-red-700',
            message: 'Critical security threats detected. Immediate action required.',
            pulse: true
        }
        if (level === 'MEDIUM') return {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            text: 'text-yellow-700',
            message: 'Suspicious activity detected. Monitor closely.',
            pulse: false
        }
        return {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: 'bg-green-100',
            iconColor: 'text-green-600',
            text: 'text-green-700',
            message: 'All systems operating normally. No threats detected.',
            pulse: false
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading security data...</p>
                </div>
            </div>
        )
    }

    const threatConfig = getThreatLevelConfig(stats?.systemHealth.threatLevel || 'LOW')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-7 h-7 text-red-600" />
                        Security Operations Center
                    </h1>
                    <p className="text-slate-500 mt-1">Real-time security monitoring and threat detection</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden md:inline text-xs text-slate-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={() => fetchSecurityStats(true)}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm ${isRefreshing ? 'opacity-50' : ''}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Threat Level Alert Banner */}
            <div className={`${threatConfig.bg} ${threatConfig.border} border-2 rounded-xl md:rounded-2xl p-4 md:p-6`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className={`p-2.5 md:p-4 ${threatConfig.icon} rounded-xl md:rounded-2xl relative flex-shrink-0`}>
                            <AlertTriangle className={`w-5 h-5 md:w-8 md:h-8 ${threatConfig.iconColor}`} />
                            {threatConfig.pulse && (
                                <span className="absolute top-0 right-0 w-2 md:w-3 h-2 md:h-3 bg-red-500 rounded-full animate-ping"></span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className={`text-lg md:text-2xl font-bold ${threatConfig.text}`}>
                                    {stats?.systemHealth.threatLevel || 'LOW'}
                                </h2>
                                {stats?.systemHealth.threatLevel === 'HIGH' && (
                                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-red-500 animate-pulse" />
                                )}
                            </div>
                            <p className="text-xs md:text-base text-slate-600 mt-0.5 md:mt-1">{threatConfig.message}</p>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-[10px] md:text-sm text-slate-500">Monitoring</p>
                        <p className="text-xs md:text-base font-semibold">24 hours</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1 md:gap-2 text-red-600 mb-1 md:mb-2">
                        <XCircle size={14} className="md:w-[18px] md:h-[18px]" />
                        <span className="text-[10px] md:text-xs font-medium uppercase">Failed</span>
                    </div>
                    <p className="text-xl md:text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.failedLogins || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1 md:gap-2 text-orange-600 mb-1 md:mb-2">
                        <Lock size={14} className="md:w-[18px] md:h-[18px]" />
                        <span className="text-[10px] md:text-xs font-medium uppercase">Blocked</span>
                    </div>
                    <p className="text-xl md:text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.blockedAttempts || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1 md:gap-2 text-yellow-600 mb-1 md:mb-2">
                        <Activity size={14} className="md:w-[18px] md:h-[18px]" />
                        <span className="text-[10px] md:text-xs font-medium uppercase">Suspicious</span>
                    </div>
                    <p className="text-xl md:text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.suspiciousEvents || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1 md:gap-2 text-purple-600 mb-1 md:mb-2">
                        <Lock size={14} className="md:w-[18px] md:h-[18px]" />
                        <span className="text-[10px] md:text-xs font-medium uppercase">Locked</span>
                    </div>
                    <p className="text-xl md:text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.lockedAccounts || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1 md:gap-2 text-blue-600 mb-1 md:mb-2">
                        <AlertTriangle size={14} className="md:w-[18px] md:h-[18px]" />
                        <span className="text-[10px] md:text-xs font-medium uppercase">Critical</span>
                    </div>
                    <p className="text-xl md:text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.criticalEvents || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1 md:gap-2 text-green-600 mb-1 md:mb-2">
                        <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" />
                        <span className="text-[10px] md:text-xs font-medium uppercase">Sessions</span>
                    </div>
                    <p className="text-xl md:text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.activeSessions || 0}
                    </p>
                </div>
            </div>

            {/* Recent Threats Table */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-sm md:text-base text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                        Recent Events
                    </h3>
                    <Link
                        href="/admin/logs"
                        className="flex items-center gap-1 text-xs md:text-sm text-teal-600 hover:text-teal-700"
                    >
                        View All <ExternalLink size={12} className="md:w-[14px] md:h-[14px]" />
                    </Link>
                </div>

                {stats?.recentThreats && stats.recentThreats.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {stats.recentThreats.map((threat) => (
                            <div key={threat.id} className="px-4 md:px-6 py-4 md:py-5 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${threat.severity === 'CRITICAL'
                                                ? 'bg-red-100 text-red-700 border border-red-200'
                                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                }`}>
                                                {threat.severity}
                                            </span>
                                            <p className="font-semibold text-sm md:text-base text-slate-900">{threat.action}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <User size={14} />
                                                {threat.user?.email || 'Unknown'}
                                            </span>
                                            {threat.ipAddress && (
                                                <span className="flex items-center gap-1.5">
                                                    <Globe size={14} />
                                                    {threat.ipAddress}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-medium text-slate-600">
                                            {new Date(threat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(threat.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                        <p className="font-medium text-slate-900">All Clear</p>
                        <p className="text-sm text-slate-500">No critical or warning events in the last 24 hours</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/logs" className="block">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-teal-200 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                <Activity className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">View Audit Logs</h4>
                                <p className="text-sm text-slate-500">Full security event history</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">Security Score</h4>
                            <p className="text-sm text-slate-500">System health: <span className="text-green-600 font-medium">Good</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">Slack Alerts</h4>
                            <p className="text-sm text-slate-500">Real-time notifications active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
