'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertTriangle,
    XCircle,
    Filter,
} from 'lucide-react';

interface Log {
    id: string;
    action: string;
    status: string;
    severity: string;
    eventType: string;
    ipAddress: string;
    createdAt: string;
    user?: {
        email: string;
        role: string;
    };
    details: Record<string, unknown>;
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
    const [stats, setStats] = useState({
        failedLogins: 0,
        criticalEvents: 0,
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/auth');
                return;
            }

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(filterSeverity && { severity: filterSeverity }),
                ...(filterType && { eventType: filterType }),
            });

            // Use direct URL to bypass Next.js rewrites that might point to AI service (8000/8001)
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

                // Simple client-side stats calculation for demo purposes
                // ideally backend provides this endpoint
                const failed = data.data.logs.filter((l: Log) => l.action.includes('FAILED')).length;
                const critical = data.data.logs.filter((l: Log) => l.severity === 'CRITICAL' || l.severity === 'WARNING').length;
                setStats({ failedLogins: failed, criticalEvents: critical });
            } else {
                throw new Error(data.message || 'Failed to fetch logs');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Failed to fetch logs', error);
            alert(`Debug Error: ${errorMessage}`); // Temporary alert to see the error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterSeverity, filterType]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            case 'WARNING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Security Audit Logs</h1>
                        <p className="text-gray-500 mt-1">Real-time monitoring of security events</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Critical/Warnings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.criticalEvents}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-full">
                                <XCircle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Failed Actions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.failedLogins}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">Filters:</span>
                    </div>
                    <select
                        className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                    >
                        <option value="">All Severities</option>
                        <option value="INFO">Info</option>
                        <option value="WARNING">Warning</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                    <select
                        className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="AUTH">Auth</option>
                        <option value="DATA">Data Access</option>
                        <option value="SYSTEM">System</option>
                    </select>
                    <button
                        onClick={() => { setFilterSeverity(''); setFilterType(''); }}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* LOGS TABLE */}
                <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading logs...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.map((log) => (
                                        <tr key={log.id} className={log.severity === 'CRITICAL' ? 'bg-red-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                                                    {log.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.action}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.user ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900">{log.user.email}</div>
                                                        <div className="text-xs text-gray-400">{log.user.role}</div>
                                                    </div>
                                                ) : 'System/Guest'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.ipAddress || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {JSON.stringify(log.details)}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No logs found matching criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
                            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, totalLogs)}</span> of <span className="font-medium">{totalLogs}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => setPage(1)} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">First</button>
                                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">Previous</button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Page {page} of {totalPages}</span>
                                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">Next</button>
                                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Last</button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
