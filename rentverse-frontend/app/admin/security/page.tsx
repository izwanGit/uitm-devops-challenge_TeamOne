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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    const fetchSecurityStats = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true)

        try {
            const token = localStorage.getItem('authToken')
            if (!token) return

            const res = await fetch(`${API_URL}/api/admin/security-stats`, {
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
    }, [API_URL])

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
                    <span className="text-xs text-slate-400">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={() => fetchSecurityStats(true)}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors ${isRefreshing ? 'opacity-50' : ''}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Threat Level Alert Banner */}
            <div className={`${threatConfig.bg} ${threatConfig.border} border-2 rounded-2xl p-6`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 ${threatConfig.icon} rounded-2xl relative`}>
                            <AlertTriangle className={`w-8 h-8 ${threatConfig.iconColor}`} />
                            {threatConfig.pulse && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className={`text-2xl font-bold ${threatConfig.text}`}>
                                    Threat Level: {stats?.systemHealth.threatLevel || 'LOW'}
                                </h2>
                                {stats?.systemHealth.threatLevel === 'HIGH' && (
                                    <Zap className="w-5 h-5 text-red-500 animate-pulse" />
                                )}
                            </div>
                            <p className="text-slate-600 mt-1">{threatConfig.message}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Monitoring Period</p>
                        <p className="font-semibold">Last 24 hours</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <XCircle size={18} />
                        <span className="text-xs font-medium uppercase">Failed Logins</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.failedLogins || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <Lock size={18} />
                        <span className="text-xs font-medium uppercase">Blocked</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.blockedAttempts || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <Activity size={18} />
                        <span className="text-xs font-medium uppercase">Suspicious</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.suspiciousEvents || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <Lock size={18} />
                        <span className="text-xs font-medium uppercase">Locked</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.lockedAccounts || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <AlertTriangle size={18} />
                        <span className="text-xs font-medium uppercase">Critical</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.criticalEvents || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle size={18} />
                        <span className="text-xs font-medium uppercase">Active Sessions</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {stats?.realTimeStats.activeSessions || 0}
                    </p>
                </div>
            </div>

            {/* Recent Threats Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Recent Critical/Warning Events
                    </h3>
                    <Link
                        href="/admin/logs"
                        className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                    >
                        View All Logs <ExternalLink size={14} />
                    </Link>
                </div>

                {stats?.recentThreats && stats.recentThreats.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {stats.recentThreats.map((threat) => (
                            <div key={threat.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${threat.severity === 'CRITICAL'
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                        }`}>
                                        {threat.severity}
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-900">{threat.action}</p>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User size={12} />
                                                {threat.user?.email || 'Unknown'}
                                            </span>
                                            {threat.ipAddress && (
                                                <span className="flex items-center gap-1">
                                                    <Globe size={12} />
                                                    {threat.ipAddress}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400">
                                        {new Date(threat.createdAt).toLocaleTimeString()}
                                    </p>
                                    <p className="text-xs text-slate-300">
                                        {new Date(threat.createdAt).toLocaleDateString()}
                                    </p>
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
