'use client'

import { Globe, ChevronDown, Check } from 'lucide-react'
import { useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' },
]

function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const { language, setLanguage } = useSettings()

    const handleSelect = (code: string) => {
        setLanguage(code)
        setIsOpen(false)
    }

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors duration-200 p-2 rounded-lg hover:bg-slate-50"
            >
                <Globe size={16} />
                <span>{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full bg-white border border-slate-200 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors duration-200 flex items-center justify-between"
                        >
                            <span>{lang.flag} {lang.name}</span>
                            {language === lang.code && (
                                <Check size={16} className="text-teal-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default LanguageSelector
