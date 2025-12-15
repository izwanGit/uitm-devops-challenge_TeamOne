'use client'

import { useState } from 'react'
import { AgreementsApiClient } from '@/utils/agreementsApiClient'
import { Loader2, Upload, CheckCircle, XCircle, FileText } from 'lucide-react'

interface VerificationResult {
    valid: boolean
    status?: string
    documentId?: string
    tenant?: string
    property?: string
    signedAt?: string
    message?: string
}

export default function VerifyPage() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<VerificationResult | null>(null)
    const [error, setError] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
            setError('')
        }
    }

    const handleVerify = async () => {
        if (!file) return
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const res = await AgreementsApiClient.verify(file)
            setResult(res)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Contract Verification Portal
                </h1>
                <p className="mt-4 text-lg text-gray-500">
                    Upload any RentVerse digital agreement to verify its cryptographic integrity.
                    This system uses SHA-256 hashing to detect any tampering.
                </p>
            </div>

            <div className="mt-10 max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border">

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition-colors">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <span className="text-blue-600 font-medium">Click to upload PDF</span>
                        <span className="text-gray-500 ml-1">or drag and drop</span>
                        {file && (
                            <div className="mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-800 py-2 px-4 rounded-full text-sm">
                                <FileText className="w-4 h-4" />
                                {file.name}
                            </div>
                        )}
                    </label>
                </div>

                <button
                    onClick={handleVerify}
                    disabled={!file || loading}
                    className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                    Verify Integrity
                </button>

                {error && (
                    <div className="mt-6 bg-red-50 p-4 rounded-md text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                {result && (
                    <div className={`mt-6 p-6 rounded-lg border-2 ${result.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            {result.valid ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-600" />
                            )}
                            <h3 className={`text-xl font-bold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                                {result.valid ? 'Valid Contract' : 'Verification Failed'}
                            </h3>
                        </div>

                        <div className="space-y-2 text-sm">
                            {result.valid ? (
                                <>
                                    <p><span className="font-bold">Status:</span> {result.status}</p>
                                    <p><span className="font-bold">Document ID:</span> {result.documentId}</p>
                                    {result.tenant && <p><span className="font-bold">Tenant:</span> {result.tenant}</p>}
                                    {result.property && <p><span className="font-bold">Property:</span> {result.property}</p>}
                                    {result.signedAt && <p><span className="font-bold">Signed At:</span> {new Date(result.signedAt).toLocaleString()}</p>}
                                </>
                            ) : (
                                <p className="text-red-700 font-medium">{result.message}</p>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
