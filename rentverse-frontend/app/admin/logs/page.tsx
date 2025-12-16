'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    AlertTriangle,
    XCircle,
    Filter,
    Search,
    Shield,
    RefreshCw,
    Download,
    CheckCircle,
    Clock,
    User,
    Globe,
    Monitor,
    ArrowLeft,
} from 'lucide-react';

interface Log {
    id: string;
    action: string;
    status: string;
    severity: string;
    eventType: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    user?: {
        email: string;
        name: string;
        role: string;
    };
    details: Record<string, unknown>;
}

interface SecurityStats {
    realTimeStats: {
        failedLogins: number;
        criticalEvents: number;
        blockedAttempts: number;
        suspiciousEvents: number;
        lockedAccounts: number;
        activeSessions: number;
    };
    systemHealth: {
        totalUsers: number;
        threatLevel: string;
    };
}

export default function AdminLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [filterSeverity, setFilterSeverity] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchLogs = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);
        else setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/auth');
                return;
            }

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '25',
                ...(filterSeverity && { severity: filterSeverity }),
                ...(filterType && { eventType: filterType }),
                ...(filterAction && { action: filterAction }),
            });

            const res = await fetch(
                `${API_URL}/api/admin/logs?${queryParams}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`API Error: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            if (data.success) {
                setLogs(data.data.logs);
                setTotalPages(data.data.pagination.pages);
                setTotalLogs(data.data.pagination.total);
            } else {
                throw new Error(data.message || 'Failed to fetch logs');
            }
        } catch (error: unknown) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchSecurityStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const res = await fetch(`${API_URL}/api/admin/security-stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setSecurityStats(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch security stats', error);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchSecurityStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterSeverity, filterType, filterAction]);

    // Auto refresh every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLogs(true);
            fetchSecurityStats();
        }, 30000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterSeverity, filterType, filterAction]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
            case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'SUCCESS') return <CheckCircle className="w-4 h-4 text-green-600" />;
        if (status === 'FAILURE') return <XCircle className="w-4 h-4 text-red-600" />;
        return <Clock className="w-4 h-4 text-yellow-600" />;
    };

    const getActionColor = (action: string) => {
        if (action.includes('FAILED') || action.includes('BLOCKED')) return 'text-red-700 bg-red-50';
        if (action.includes('SUCCESS')) return 'text-green-700 bg-green-50';
        if (action.includes('CHANGED') || action.includes('ENABLED')) return 'text-blue-700 bg-blue-50';
        return 'text-slate-700 bg-slate-50';
    };

    const exportLogs = () => {
        const csv = [
            ['Timestamp', 'Severity', 'Action', 'User', 'IP Address', 'Status', 'Details'],
            ...logs.map(log => [
                new Date(log.createdAt).toISOString(),
                log.severity,
                log.action,
                log.user?.email || 'System',
                log.ipAddress || '-',
                log.status,
                JSON.stringify(log.details),
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredLogs = searchQuery
        ? logs.filter(log =>
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.ipAddress?.includes(searchQuery)
        )
        : logs;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin"
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-red-600" />
                                    Security Audit Logs
                                </h1>
                                <p className="text-sm text-slate-500">Real-time security event monitoring</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchLogs(true)}
                                disabled={isRefreshing}
                                className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${isRefreshing ? 'opacity-50' : ''}`}
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={exportLogs}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Cards */}
                {securityStats && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                        <div className={`p-4 rounded-xl border-2 ${securityStats.systemHealth.threatLevel === 'HIGH'
                            ? 'bg-red-50 border-red-200'
                            : securityStats.systemHealth.threatLevel === 'MEDIUM'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-green-50 border-green-200'
                            }`}>
                            <p className="text-xs font-medium text-slate-600 uppercase">Threat Level</p>
                            <p className={`text-xl font-bold ${securityStats.systemHealth.threatLevel === 'HIGH'
                                ? 'text-red-700'
                                : securityStats.systemHealth.threatLevel === 'MEDIUM'
                                    ? 'text-yellow-700'
                                    : 'text-green-700'
                                }`}>{securityStats.systemHealth.threatLevel}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-medium text-slate-600 uppercase">Failed Logins</p>
                            <p className="text-xl font-bold text-red-600">{securityStats.realTimeStats.failedLogins}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-medium text-slate-600 uppercase">Blocked</p>
                            <p className="text-xl font-bold text-orange-600">{securityStats.realTimeStats.blockedAttempts}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-medium text-slate-600 uppercase">Suspicious</p>
                            <p className="text-xl font-bold text-yellow-600">{securityStats.realTimeStats.suspiciousEvents}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-medium text-slate-600 uppercase">Locked</p>
                            <p className="text-xl font-bold text-purple-600">{securityStats.realTimeStats.lockedAccounts}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-medium text-slate-600 uppercase">Total Events</p>
                            <p className="text-xl font-bold text-slate-900">{totalLogs}</p>
                        </div>
                    </div>
                )}

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Filter className="w-5 h-5" />
                            <span className="font-medium">Filters:</span>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by email, action, or IP..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            />
                        </div>

                        <select
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            value={filterSeverity}
                            onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }}
                        >
                            <option value="">All Severities</option>
                            <option value="INFO">✅ Info</option>
                            <option value="WARNING">⚠️ Warning</option>
                            <option value="CRITICAL">🚨 Critical</option>
                        </select>

                        <select
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                        >
                            <option value="">All Types</option>
                            <option value="AUTH">🔐 Auth</option>
                            <option value="DATA">📊 Data Access</option>
                            <option value="SYSTEM">⚙️ System</option>
                        </select>

                        <select
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            value={filterAction}
                            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN_SUCCESS">Login Success</option>
                            <option value="LOGIN_FAILED">Login Failed</option>
                            <option value="PASSWORD_CHANGED">Password Changed</option>
                            <option value="MFA_ENABLED">MFA Enabled</option>
                            <option value="MFA_FAILED">MFA Failed</option>
                        </select>

                        {(filterSeverity || filterType || filterAction || searchQuery) && (
                            <button
                                onClick={() => { setFilterSeverity(''); setFilterType(''); setFilterAction(''); setSearchQuery(''); setPage(1); }}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                            <p className="text-slate-500">Loading security logs...</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Timestamp</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Severity</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">IP / Device</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredLogs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${log.severity === 'CRITICAL' ? 'bg-red-50/50' : ''
                                                    }`}
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900">
                                                        {new Date(log.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {new Date(log.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityColor(log.severity)}`}>
                                                        {log.severity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {log.user ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                                <User className="w-4 h-4 text-slate-500" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-slate-900">{log.user.email}</div>
                                                                <div className="text-xs text-slate-400">{log.user.role}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">System/Guest</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                                        <Globe className="w-3 h-3" />
                                                        <span className="font-mono">{log.ipAddress || '-'}</span>
                                                    </div>
                                                    {log.userAgent && (
                                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                            <Monitor className="w-3 h-3" />
                                                            <span className="truncate max-w-[150px]">{log.userAgent.substring(0, 30)}...</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(log.status)}
                                                        <span className="text-sm text-slate-600">{log.status}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredLogs.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                    No logs found matching criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Showing <span className="font-medium">{(page - 1) * 25 + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(page * 25, totalLogs)}</span> of{' '}
                                    <span className="font-medium">{totalLogs}</span> events
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                        className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-white"
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-white"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-medium">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-white"
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                        className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-white"
                                    >
                                        Last
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Event Details</h3>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <XCircle className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Event ID</p>
                                    <p className="font-mono text-sm text-slate-900">{selectedLog.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Timestamp</p>
                                    <p className="text-sm text-slate-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Severity</p>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(selectedLog.severity)}`}>
                                        {selectedLog.severity}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Status</p>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(selectedLog.status)}
                                        <span className="text-sm">{selectedLog.status}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Action</p>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                                        {selectedLog.action}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Event Type</p>
                                    <p className="text-sm text-slate-900">{selectedLog.eventType}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">User</p>
                                    <p className="text-sm text-slate-900">{selectedLog.user?.email || 'System/Guest'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">IP Address</p>
                                    <p className="font-mono text-sm text-slate-900">{selectedLog.ipAddress || '-'}</p>
                                </div>
                            </div>
                            {selectedLog.userAgent && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">User Agent</p>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded font-mono text-xs break-all">
                                        {selectedLog.userAgent}
                                    </p>
                                </div>
                            )}
                            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Additional Details</p>
                                    <pre className="text-sm text-slate-600 bg-slate-50 p-3 rounded font-mono text-xs overflow-x-auto">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
