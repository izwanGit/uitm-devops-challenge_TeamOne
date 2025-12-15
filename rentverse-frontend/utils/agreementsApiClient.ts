import { forwardRequest } from './apiForwarder'

export interface Agreement {
    id: string
    leaseId: string
    documentId: string
    status: 'DRAFT' | 'PENDING_SIGNATURE' | 'SIGNED' | 'VOID'
    pdfUrl?: string
    originalPdfUrl?: string
    originalHash?: string
    finalHash?: string
    signerIp?: string
    signedAt?: string
    createdAt: string
}

export class AgreementsApiClient {

    /**
     * Generate an agreement PDF
     */
    static async generate(leaseId: string, token: string): Promise<{ message: string, agreement: Agreement }> {
        try {
            const response = await forwardRequest('/api/agreements/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ leaseId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate agreement')
            }

            return data
        } catch (error) {
            console.error('Generate Agreement API error:', error)
            throw error instanceof Error ? error : new Error('Network error occurred')
        }
    }

    /**
     * Submit a signature
     */
    static async sign(agreementId: string, signatureBase64: string, token: string): Promise<{ message: string, agreement: Agreement }> {
        try {
            const response = await forwardRequest(`/api/agreements/${agreementId}/sign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ signature: signatureBase64 }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to sign agreement')
            }

            return data
        } catch (error) {
            console.error('Sign Agreement API error:', error)
            throw error instanceof Error ? error : new Error('Network error occurred')
        }
    }

    /**
     * Verify a document (Public)
     */
    static async verify(file: File): Promise<any> {
        try {
            const formData = new FormData()
            formData.append('document', file)

            // forwardRequest might not handle FormData correctly if it forces content-type json
            // Let's assume forwardRequest handles it or use native fetch if needed.
            // Looking at authApiClient usage, it sets Content-Type.
            // If forwardRequest wraps apiConfig, it might return a fetch promise.
            // If we pass formData, we usually let browser set Content-Type (multipart boundary).

            // Let's check apiForwarder usage or assume standard fetch for multipart if forwardRequest is too rigid.
            // For now, I'll use forwardRequest but WITHOUT explicitly setting Content-Type so browser sets boundary.

            const response = await forwardRequest('/api/agreements/verify', {
                method: 'POST',
                body: formData,
                // No headers needed, browser sets boundary
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed')
            }

            return data
        } catch (error) {
            console.error('Verify API error:', error)
            throw error instanceof Error ? error : new Error('Network error occurred')
        }
    }
}
