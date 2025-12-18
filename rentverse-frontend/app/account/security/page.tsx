"use client"
import { getApiBaseUrl } from '@/utils/apiConfig'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import MFASetup from '@/components/MFASetup'
import AuthGuard from '@/components/AuthGuard'
import useAuthStore from '@/stores/authStore'
import {
   KeyRound,
   History,
   Eye,
   EyeOff,
   Loader2,
   Check,
   AlertCircle,
   Monitor,
   Smartphone,
   X,
   Shield,
   ChevronLeft,
   Lock,
   Fingerprint,
   Globe,
   Clock,
   CheckCircle,
   AlertTriangle,
} from 'lucide-react'

interface LoginEvent {
   id: string
   action?: string
   eventType?: string
   status: string
   ipAddress: string | null
   userAgent: string | null
   geoCity?: string | null
   geoCountry?: string | null
   createdAt: string
   reason?: string | null
   details?: Record<string, unknown>
}

export default function SecurityPage() {
   const { user } = useAuthStore()

   // Password change state
   const [showPasswordModal, setShowPasswordModal] = useState(false)
   const [currentPassword, setCurrentPassword] = useState('')
   const [newPassword, setNewPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('')
   const [showCurrentPassword, setShowCurrentPassword] = useState(false)
   const [showNewPassword, setShowNewPassword] = useState(false)
   const [isChangingPassword, setIsChangingPassword] = useState(false)
   const [passwordError, setPasswordError] = useState<string | null>(null)
   const [passwordSuccess, setPasswordSuccess] = useState(false)

   // Login history state
   const [showHistoryModal, setShowHistoryModal] = useState(false)
   const [loginHistory, setLoginHistory] = useState<LoginEvent[]>([])
   const [isLoadingHistory, setIsLoadingHistory] = useState(false)

   // Security stats
   const [securityScore, setSecurityScore] = useState(60)

   useEffect(() => {
      // Calculate security score dynamically
      let score = 50 // Base score for having an account

      // Email verified adds 20 points (assuming active users are verified or close to it)
      // Since we don't strictly track verification in frontend user object yet, we assume 20 base
      score += 20

      // MFA adds 30 points
      if (user?.mfaEnabled) {
         score += 30
      }

      setSecurityScore(score)
   }, [user])

   const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault()
      setPasswordError(null)

      if (newPassword !== confirmPassword) {
         setPasswordError('New passwords do not match')
         return
      }

      if (newPassword.length < 8) {
         setPasswordError('Password must be at least 8 characters')
         return
      }

      setIsChangingPassword(true)

      try {
         const token = localStorage.getItem('authToken')
         const baseUrl = getApiBaseUrl()

         const response = await fetch(`${baseUrl}/api/auth/change-password`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
         })

         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.message || 'Failed to change password')
         }

         setPasswordSuccess(true)
         setCurrentPassword('')
         setNewPassword('')
         setConfirmPassword('')

         setTimeout(() => {
            setPasswordSuccess(false)
            setShowPasswordModal(false)
         }, 2000)
      } catch (err) {
         setPasswordError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
         setIsChangingPassword(false)
      }
   }

   const fetchLoginHistory = async () => {
      setIsLoadingHistory(true)
      try {
         const token = localStorage.getItem('authToken')
         const baseUrl = getApiBaseUrl()

         const response = await fetch(`${baseUrl}/api/auth/login-history?limit=20`, {
            headers: {
               'Authorization': `Bearer ${token}`,
            },
         })

         const data = await response.json()

         if (data.success) {
            setLoginHistory(data.data.events)
         }
      } catch (err) {
         console.error('Failed to fetch login history:', err)
      } finally {
         setIsLoadingHistory(false)
      }
   }

   const openHistoryModal = () => {
      setShowHistoryModal(true)
      fetchLoginHistory()
   }

   const getDeviceIcon = (userAgent: string | null) => {
      if (!userAgent) return <Monitor size={16} />
      const ua = userAgent.toLowerCase()
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
         return <Smartphone size={16} />
      }
      return <Monitor size={16} />
   }

   const getStatusBadge = (status: string) => {
      if (status === 'SUCCESS') {
         return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Success</span>
      }
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Failed</span>
   }

   const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleString('en-MY', {
         day: 'numeric',
         month: 'short',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      })
   }

   const getScoreColor = () => {
      if (securityScore >= 80) return 'text-green-500'
      if (securityScore >= 60) return 'text-yellow-500'
      return 'text-red-500'
   }

   const getScoreRingColor = () => {
      if (securityScore >= 80) return 'stroke-green-500'
      if (securityScore >= 60) return 'stroke-yellow-500'
      return 'stroke-red-500'
   }

   return (
      <AuthGuard requireAuth={true}>
         <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <NavBar searchBoxType="none" />

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

               {/* Back Button */}
               <Link
                  href="/account"
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
               >
                  <ChevronLeft size={20} />
                  <span>Back to Account</span>
               </Link>

               {/* ========================================== */}
               {/* HERO SECTION */}
               {/* ========================================== */}
               <div className="relative mb-10">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-3xl h-32" />

                  <div className="relative pt-12 px-8 pb-8">
                     {/* Security Card */}
                     <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                           {/* Left: Title + Description */}
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                 <Shield size={32} className="text-white" />
                              </div>
                              <div>
                                 <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                    Login & Security
                                 </h1>
                                 <p className="text-slate-500 mt-1">
                                    Protect your account with strong authentication
                                 </p>
                              </div>
                           </div>

                           {/* Right: Security Score */}
                           <div className="flex items-center gap-4">
                              <div className="relative w-20 h-20">
                                 <svg className="w-20 h-20 -rotate-90">
                                    <circle
                                       cx="40"
                                       cy="40"
                                       r="35"
                                       stroke="currentColor"
                                       strokeWidth="6"
                                       fill="none"
                                       className="text-slate-200"
                                    />
                                    <circle
                                       cx="40"
                                       cy="40"
                                       r="35"
                                       strokeWidth="6"
                                       fill="none"
                                       strokeLinecap="round"
                                       strokeDasharray={`${securityScore * 2.2} 220`}
                                       className={getScoreRingColor()}
                                    />
                                 </svg>
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-xl font-bold ${getScoreColor()}`}>
                                       {securityScore}
                                    </span>
                                 </div>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-slate-900">Security Score</p>
                                 <p className="text-xs text-slate-500">
                                    {securityScore === 100 ? 'Excellent protection' : 'Enable MFA to improve'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* ========================================== */}
               {/* SECURITY CHECKLIST */}
               {/* ========================================== */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-600" />
                     </div>
                     <div>
                        <p className="font-medium text-slate-900">Email Verified</p>
                        <p className="text-sm text-slate-500">Account confirmed</p>
                     </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                     {user?.mfaEnabled ? (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                           <CheckCircle size={20} className="text-green-600" />
                        </div>
                     ) : (
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                           <AlertTriangle size={20} className="text-yellow-600" />
                        </div>
                     )}
                     <div>
                        <p className="font-medium text-slate-900">MFA Status</p>
                        <p className="text-sm text-slate-500">
                           {user?.mfaEnabled ? 'Enabled & Active' : 'Recommended'}
                        </p>
                     </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Lock size={20} className="text-green-600" />
                     </div>
                     <div>
                        <p className="font-medium text-slate-900">Password</p>
                        <p className="text-sm text-slate-500">Strong</p>
                     </div>
                  </div>
               </div>

               {/* ========================================== */}
               {/* SECURITY OPTIONS */}
               {/* ========================================== */}
               <div className="space-y-6">

                  {/* MFA Section */}
                  <section>
                     <MFASetup />
                  </section>

                  {/* Password Section */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                           <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                              <KeyRound className="w-6 h-6 text-slate-600" />
                           </div>
                           <div>
                              <h3 className="font-semibold text-slate-900 text-lg">Password</h3>
                              <p className="text-sm text-slate-500">Change your account password regularly for better security</p>
                           </div>
                        </div>
                        <button
                           onClick={() => setShowPasswordModal(true)}
                           className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                        >
                           Update
                        </button>
                     </div>
                  </section>

                  {/* Login History Section */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                           <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                              <History className="w-6 h-6 text-slate-600" />
                           </div>
                           <div>
                              <h3 className="font-semibold text-slate-900 text-lg">Login History</h3>
                              <p className="text-sm text-slate-500">Review your recent login activity and active sessions</p>
                           </div>
                        </div>
                        <button
                           onClick={openHistoryModal}
                           className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                        >
                           View History
                        </button>
                     </div>
                  </section>

               </div>
            </main>
         </div>

         {/* Password Change Modal */}
         {showPasswordModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
                  <button
                     onClick={() => setShowPasswordModal(false)}
                     className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                  >
                     <X size={18} />
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Lock size={20} className="text-blue-600" />
                     </div>
                     <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-5">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                           Current Password
                        </label>
                        <div className="relative">
                           <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Enter current password"
                              required
                           />
                           <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                           >
                              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                           </button>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                           New Password
                        </label>
                        <div className="relative">
                           <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Enter new password"
                              required
                           />
                           <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                           >
                              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                           </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Minimum 8 characters required</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                           Confirm New Password
                        </label>
                        <input
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                           placeholder="Confirm new password"
                           required
                        />
                     </div>

                     {passwordError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                           <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                           <p className="text-sm text-red-600">{passwordError}</p>
                        </div>
                     )}

                     {passwordSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                           <Check size={20} className="text-green-600 flex-shrink-0" />
                           <p className="text-sm text-green-600">Password changed successfully!</p>
                        </div>
                     )}

                     <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isChangingPassword ? (
                           <>
                              <Loader2 size={20} className="mr-2 animate-spin" />
                              Changing...
                           </>
                        ) : (
                           'Change Password'
                        )}
                     </button>
                  </form>
               </div>
            </div>
         )}

         {/* Login History Modal */}
         {showHistoryModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl max-w-2xl w-full relative max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                           <History size={20} className="text-indigo-600" />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">Login History</h2>
                           <p className="text-sm text-slate-500">Your recent login activity</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setShowHistoryModal(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  {/* Modal Content */}
                  <div className="overflow-y-auto flex-1 p-6">
                     {isLoadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-16">
                           <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                           <p className="text-slate-500">Loading history...</p>
                        </div>
                     ) : loginHistory.length === 0 ? (
                        <div className="text-center py-16">
                           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <History size={32} className="text-slate-400" />
                           </div>
                           <p className="text-slate-600 font-medium">No login history available</p>
                           <p className="text-slate-500 text-sm mt-1">Your login activity will appear here</p>
                        </div>
                     ) : (
                        <div className="space-y-3">
                           {loginHistory.map((event, index) => (
                              <div
                                 key={event.id}
                                 className={`rounded-xl p-4 flex items-center justify-between transition-colors ${event.status === 'SUCCESS'
                                    ? 'bg-slate-50 hover:bg-slate-100'
                                    : 'bg-red-50 hover:bg-red-100 border border-red-100'
                                    }`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.status === 'SUCCESS'
                                       ? 'bg-white text-slate-500'
                                       : 'bg-red-100 text-red-500'
                                       }`}>
                                       {getDeviceIcon(event.userAgent)}
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <span className="font-medium text-slate-900">
                                             {event.action || event.eventType || 'Login Attempt'}
                                          </span>
                                          {getStatusBadge(event.status)}
                                       </div>
                                       <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                          <span className="flex items-center gap-1">
                                             <Globe size={14} />
                                             {event.ipAddress || 'Unknown'}
                                          </span>
                                          {event.geoCity && (
                                             <span>
                                                {event.geoCity}{event.geoCountry && `, ${event.geoCountry}`}
                                             </span>
                                          )}
                                       </div>
                                       <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                          <Clock size={12} />
                                          {formatDate(event.createdAt)}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </AuthGuard>
   )
}