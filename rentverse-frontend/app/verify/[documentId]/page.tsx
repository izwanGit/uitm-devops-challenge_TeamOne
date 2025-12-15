'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

export default function VerifyPage() {
    const params = useParams();
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<{ verified: boolean; message: string; details?: { status: string; signedAt?: string } } | null>(null);
    const [loading, setLoading] = useState(false);

    const check = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('document', file);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/agreements/verify/${params.documentId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setResult({ verified: false, message: error.response?.data?.error || "Verification Request Failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Document Verification</h1>
                    <p className="text-slate-500 mt-2">RentVerse Blockchain-like Integrity Check</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-sm text-center">
                    Verifying Document ID: <br />
                    <code className="block mt-2 font-mono bg-white p-2 rounded border border-slate-200 select-all">{params.documentId}</code>
                </div>

                {!result ? (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="text-blue-600 font-medium break-all">{file.name}</div>
                            ) : (
                                <div className="text-slate-400">
                                    <span className="text-blue-500 font-medium">Click to upload</span> or drag and drop<br />original PDF here
                                </div>
                            )}
                        </div>

                        <button
                            onClick={check}
                            disabled={loading || !file}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? 'Analyzing Hash...' : 'Verify Integrity'}
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in-up">
                        <div className={`p-6 rounded-lg text-center border-2 ${result.verified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="text-4xl mb-3">{result.verified ? '✅' : '❌'}</div>
                            <h3 className={`text-lg font-bold ${result.verified ? 'text-green-800' : 'text-red-800'}`}>{result.message}</h3>
                            {result.details && (
                                <div className="mt-4 text-xs text-left bg-white/50 p-2 rounded">
                                    <div><strong>Status:</strong> {result.details.status}</div>
                                    {result.details.signedAt && <div><strong>Signed:</strong> {result.details.signedAt}</div>}
                                </div>
                            )}
                        </div>
                        <button onClick={() => { setResult(null); setFile(null); }} className="mt-4 w-full text-slate-500 hover:text-slate-800 text-sm">
                            Verify Another Document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
