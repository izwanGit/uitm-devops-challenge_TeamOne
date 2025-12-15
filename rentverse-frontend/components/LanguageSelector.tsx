'use client'

import { Globe, ChevronDown, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

const LANGUAGES = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'MY', name: 'Bahasa Malaysia', flag: '🇲🇾' },
    { code: 'ZH', name: '中文', flag: '🇨🇳' },
]

function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedLang, setSelectedLang] = useState('EN')

    // Load saved language on mount
    useEffect(() => {
        const saved = localStorage.getItem('language')
        if (saved) {
            setSelectedLang(saved)
        }
    }, [])

    const handleSelect = (code: string) => {
        setSelectedLang(code)
        localStorage.setItem('language', code)
        setIsOpen(false)
        // Could trigger a re-render or context update here for full i18n
    }

    const currentLang = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0]

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
                <span>{currentLang.flag} {currentLang.code}</span>
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
                            {selectedLang === lang.code && (
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
