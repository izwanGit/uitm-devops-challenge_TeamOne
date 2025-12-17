'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, ExternalLink, CheckCircle, XCircle, X } from 'lucide-react'

import { usePropertyListingStore } from '@/stores/propertyListingStore'
import { createApiUrl } from '@/utils/apiConfig'
import useAuthStore from '@/stores/authStore'
import ContentWrapper from '@/components/ContentWrapper'

// Import new dashboard components
import EditPropertySidebar, { EditSection } from '@/components/edit-property/EditPropertySidebar'
import EditBasic from '@/components/edit-property/sections/EditBasic'
import EditDetails from '@/components/edit-property/sections/EditDetails'
import EditLocation from '@/components/edit-property/sections/EditLocation'
import EditPhotos from '@/components/edit-property/sections/EditPhotos'
import EditPricing from '@/components/edit-property/sections/EditPricing'

function ModifyPropertyPageContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const router = useRouter()
    const { user, isLoggedIn } = useAuthStore()
    const [isInitializing, setIsInitializing] = useState(true)
    const [initError, setInitError] = useState<string | null>(null)

    // Dashboard state
    const [activeSection, setActiveSection] = useState<EditSection>('basic')
    const [isSaving, setIsSaving] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState<'success' | 'error'>('success')
    const [modalMessage, setModalMessage] = useState('')

    const {
        data,
        loadPropertyData,
        updateProperty,
        isDirty
    } = usePropertyListingStore()

    // 1. Fetch Property Data
    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) {
                setInitError('Property ID is missing')
                setIsInitializing(false)
                return
            }

            try {
                const token = localStorage.getItem('authToken')
                if (!token) {
                    setInitError('Authentication required')
                    setIsInitializing(false)
                    return
                }

                const res = await fetch(createApiUrl(`properties/${id}`), {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (!res.ok) throw new Error('Failed to fetch property details')

                const responseData = await res.json()
                const property = responseData.data.property

                // 2. Permission Check (Owner or Admin)
                const isOwner = property.ownerId === user?.id
                const isAdmin = user?.role === 'ADMIN'

                if (!isOwner && !isAdmin) {
                    setInitError('You do not have permission to edit this property')
                    setIsInitializing(false)
                    return
                }

                // 3. Load Data into Store
                loadPropertyData(property)
                setIsInitializing(false)

            } catch (err) {
                console.error(err)
                setInitError('Failed to load property data')
                setIsInitializing(false)
            }
        }

        if (isLoggedIn && user) {
            fetchProperty()
        } else if (!isLoggedIn) {
            // Wait a bit for auth checks or redirect
            // setTimeout(() => router.push('/auth/login'), 1000)
        }
    }, [id, user, isLoggedIn, loadPropertyData])

    // Custom Submit Handler for Update
    const handleSave = async () => {
        if (!id) return
        setIsSaving(true)
        try {
            await updateProperty(id as string)
            setModalType('success')
            setModalMessage('Changes saved successfully!')
            setShowModal(true)
        } catch (error) {
            setModalType('error')
            setModalMessage('Failed to update property: ' + (error instanceof Error ? error.message : 'Unknown error'))
            setShowModal(true)
        } finally {
            setIsSaving(false)
        }
    }

    // Render Section Helper
    const renderSection = () => {
        switch (activeSection) {
            case 'basic': return <EditBasic />
            case 'details': return <EditDetails />
            case 'location': return <EditLocation />
            case 'photos': return <EditPhotos />
            case 'pricing': return <EditPricing />
            default: return <EditBasic />
        }
    }

    if (isInitializing) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-slate-600 font-medium">Loading property editor...</span>
            </div>
        )
    }

    if (initError) {
        return (
            <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-slate-50">
                <p className="text-red-600 font-medium">{initError}</p>
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </button>
            </div>
        )
    }

    return (
        <ContentWrapper>
            <div className="min-h-[80vh] bg-slate-50 pb-20">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="h-16 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                                    title="Back"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="h-6 w-px bg-slate-200" />
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 leading-tight">
                                        {data.title || 'Untitled Property'}
                                    </h1>
                                    <p className="text-xs text-slate-500">
                                        {isDirty ? 'Unsaved changes' : 'All changes saved'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Link
                                    href={`/property/view?id=${id}`}
                                    target="_blank"
                                    className="hidden sm:flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <ExternalLink size={16} />
                                    <span>Preview</span>
                                </Link>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center space-x-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl shadow-sm hover:shadow transition-all font-medium"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-grow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row gap-8 mt-8">
                            {/* Sidebar */}
                            <aside className="flex-shrink-0">
                                <div className="sticky top-24">
                                    <EditPropertySidebar
                                        activeSection={activeSection}
                                        onSectionChange={setActiveSection}
                                    />
                                </div>
                            </aside>

                            {/* Form Area */}
                            <main className="flex-1 min-w-0">
                                {renderSection()}
                            </main>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success/Error Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center space-x-4">
                                {modalType === 'success' ? (
                                    <div className="flex-shrink-0">
                                        <CheckCircle size={48} className="text-green-500" />
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0">
                                        <XCircle size={48} className="text-red-500" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                        {modalType === 'success' ? 'Success!' : 'Error'}
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {modalMessage}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${modalType === 'success'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                    }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ContentWrapper>
    )
}

export default function ModifyPropertyPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-slate-600 font-medium">Loading property editor...</span>
            </div>
        }>
            <ModifyPropertyPageContent />
        </Suspense>
    )
}
