'use client'

import React, { useState, useEffect } from 'react'
import ContentWrapper from '@/components/ContentWrapper'
import MFASetup from '@/components/MFASetup'
import { KeyRound, History, Eye, EyeOff, Loader2, Check, AlertCircle, Monitor, Smartphone, X } from 'lucide-react'

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
         const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

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
         const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

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

   return (
      <ContentWrapper>
         <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Page Header */}
            <div className="mb-8">
               <h1 className="text-3xl font-serif font-bold text-slate-900">Login & Security</h1>
               <p className="text-slate-600 mt-2">Manage your password and security settings.</p>
            </div>

            <div className="grid gap-8">

               {/* MFA Section (The Star of Module 1) */}
               <section>
                  <MFASetup />
               </section>

               {/* Password Section */}
               <section className="bg-white border border-slate-200 rounded-2xl p-8">
                  <div className="flex justify-between items-center">
                     <div className="flex gap-4">
                        <div className="p-3 bg-slate-100 rounded-xl">
                           <KeyRound className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">Password</h3>
                           <p className="text-sm text-slate-500">Change your account password</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setShowPasswordModal(true)}
                        className="text-teal-600 font-medium hover:underline"
                     >
                        Update
                     </button>
                  </div>
               </section>

               {/* Activity Section */}
               <section className="bg-white border border-slate-200 rounded-2xl p-8">
                  <div className="flex justify-between items-center">
                     <div className="flex gap-4">
                        <div className="p-3 bg-slate-100 rounded-xl">
                           <History className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">Login History</h3>
                           <p className="text-sm text-slate-500">Review your recent sessions</p>
                        </div>
                     </div>
                     <button
                        onClick={openHistoryModal}
                        className="text-teal-600 font-medium hover:underline"
                     >
                        View
                     </button>
                  </div>
               </section>

            </div>
         </div>

         {/* Password Change Modal */}
         {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                  <button
                     onClick={() => setShowPasswordModal(false)}
                     className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                  >
                     <X size={24} />
                  </button>

                  <h2 className="text-xl font-bold text-slate-900 mb-6">Change Password</h2>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                           Current Password
                        </label>
                        <div className="relative">
                           <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              required
                           />
                           <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                              className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              required
                           />
                           <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                           >
                              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                           </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                           Confirm New Password
                        </label>
                        <input
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                           required
                        />
                     </div>

                     {passwordError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                           <AlertCircle size={18} className="text-red-600" />
                           <p className="text-sm text-red-600">{passwordError}</p>
                        </div>
                     )}

                     {passwordSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                           <Check size={18} className="text-green-600" />
                           <p className="text-sm text-green-600">Password changed successfully!</p>
                        </div>
                     )}

                     <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 transition-all disabled:opacity-50"
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative max-h-[80vh] overflow-hidden flex flex-col">
                  <button
                     onClick={() => setShowHistoryModal(false)}
                     className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                  >
                     <X size={24} />
                  </button>

                  <h2 className="text-xl font-bold text-slate-900 mb-6">Login History</h2>

                  <div className="overflow-y-auto flex-1">
                     {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-12">
                           <Loader2 size={32} className="animate-spin text-teal-600" />
                        </div>
                     ) : loginHistory.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                           No login history available
                        </div>
                     ) : (
                        <div className="space-y-3">
                           {loginHistory.map((event) => (
                              <div
                                 key={event.id}
                                 className="bg-slate-50 rounded-lg p-4 flex items-center justify-between"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-slate-500">
                                       {getDeviceIcon(event.userAgent)}
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <span className="font-medium text-slate-900">
                                             {event.action || event.eventType || 'Login'}
                                          </span>
                                          {getStatusBadge(event.status)}
                                       </div>
                                       <div className="text-sm text-slate-500 mt-1">
                                          {event.ipAddress || 'Unknown IP'}
                                          {event.geoCity && ` • ${event.geoCity}`}
                                          {event.geoCountry && `, ${event.geoCountry}`}
                                       </div>
                                       <div className="text-xs text-slate-400 mt-1">
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
      </ContentWrapper>
   )
}