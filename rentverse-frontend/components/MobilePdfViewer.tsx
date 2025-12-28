'use client'

import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

// Set up the worker source using a stable CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Styling for the PDF viewer
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface MobilePdfViewerProps {
    url: string
    className?: string
}

export default function MobilePdfViewer({ url, className = '' }: MobilePdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [scale, setScale] = useState<number>(1.0)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [containerWidth, setContainerWidth] = useState<number>(0)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
        setLoading(false)
        setError(null)
    }

    function onDocumentLoadError(err: Error) {
        console.error('PDF Load Error:', err)
        setLoading(false)
        setError('Failed to load document. ' + err.message)
    }

    // Adjust scale based on container width
    const onResize = (width: number) => {
        if (width) {
            // Subtract padding
            const newScale = (width - 32) / 600 // roughly standard A4 width base
            if (newScale > 0) setScale(Math.max(0.6, Math.min(newScale, 2.0)))
        }
    }

    return (
        <div className={`flex flex-col h-full bg-slate-100 ${className}`}>
            {/* Controls */}
            <div className="flex items-center justify-between p-2 bg-white border-b border-slate-200 shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        disabled={pageNumber <= 1}
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-xs font-medium text-slate-600">
                        {pageNumber} / {numPages || '--'}
                    </span>
                    <button
                        onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                        disabled={pageNumber >= numPages}
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                        className="p-1 rounded hover:bg-slate-100"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-xs text-slate-500 w-8 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={() => setScale(s => Math.min(3.0, s + 0.1))}
                        className="p-1 rounded hover:bg-slate-100"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>
            </div>

            {/* Viewer */}
            <div
                className="flex-1 overflow-auto relative flex justify-center p-4 min-h-[400px]"
                ref={(el) => {
                    if (el && el.clientWidth !== containerWidth) {
                        setContainerWidth(el.clientWidth)
                        // Simple responsive initial scale logic
                        if (pageNumber === 1 && scale === 1.0) {
                            const newScale = (el.clientWidth - 32) / 600
                            if (newScale > 0) setScale(newScale)
                        }
                    }
                }}
            >
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-0">
                        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-2" />
                        <p className="text-xs text-slate-500">Loading Document...</p>
                    </div>
                )}

                {error ? (
                    <div className="flex flex-col items-center justify-center text-red-500 p-4 text-center">
                        <p className="font-semibold text-sm mb-1">Error Loading PDF</p>
                        <p className="text-xs max-w-xs">{error}</p>
                    </div>
                ) : (
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={null}
                        className="shadow-lg"
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="bg-white"
                            loading={null}
                        />
                    </Document>
                )}
            </div>
        </div>
    )
}
