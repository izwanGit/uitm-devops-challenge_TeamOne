'use client'

import {
    LayoutDashboard,
    MapPin,
    Image as ImageIcon,
    Home,
    DollarSign,
    Settings
} from 'lucide-react'
import clsx from 'clsx'

export type EditSection = 'basic' | 'details' | 'location' | 'photos' | 'pricing' | 'preview'

interface EditPropertySidebarProps {
    activeSection: EditSection
    onSectionChange: (section: EditSection) => void
}

const SECTIONS: { id: EditSection; label: string; icon: any }[] = [
    { id: 'basic', label: 'Basic Info', icon: Home },
    { id: 'details', label: 'Property Details', icon: LayoutDashboard },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    // { id: 'preview', label: 'Preview', icon: Eye }, // Maybe later
]

export default function EditPropertySidebar({
    activeSection,
    onSectionChange
}: EditPropertySidebarProps) {
    return (
        <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 h-fit">
            <div className="mb-6 px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Edit Property
                </h3>
            </div>

            <nav className="space-y-1">
                {SECTIONS.map((section) => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSectionChange(section.id)}
                            className={clsx(
                                'w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium',
                                isActive
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            <Icon size={18} className={isActive ? 'text-teal-600' : 'text-slate-400'} />
                            <span>{section.label}</span>
                        </button>
                    )
                })}
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-100 px-2">
                <div className="text-xs text-slate-400">
                    Last saved: Just now
                </div>
            </div>
        </div>
    )
}
