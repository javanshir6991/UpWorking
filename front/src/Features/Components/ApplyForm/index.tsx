import { useState } from 'react'
import { useAuth } from '../../../Context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'

interface ApplyFormProps {
    jobId: number
    jobTitle?: string
    onClose: () => void
    onSuccess?: (res: any) => void
}

export default function ApplyForm({ jobId, jobTitle, onClose, onSuccess }: ApplyFormProps) {
    const [Name, setName] = useState('')
    const [Email, setEmail] = useState('')
    const [Phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const { token, openLogin, isAuthenticated } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!isAuthenticated) {
            setLoading(false)
            openLogin()
            return
        }

        try {
            // Match your Strapi Application schema exactly
            const payload = {
                data: {
                    Name: Name.trim(),
                    Email: Email.trim(),
                    Phone: Phone ? parseInt(Phone, 10) : null,
                    ApplicationStatus: 'Pending',
                    job: jobId,
                }
            }

            console.log('Submitting payload:', payload)

            const res = await fetch(`${API_URL}/api/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload)
            })

            const responseText = await res.text()
            console.log('Response status:', res.status)
            console.log('Response body:', responseText)

            if (!res.ok) {
                throw new Error(`Failed to submit application: ${res.status} - ${responseText}`)
            }

            const json = JSON.parse(responseText)
            console.log('Application submitted:', json)
            setSuccess(true)
            setLoading(false)

            // Close form after 2 seconds
            setTimeout(() => {
                onSuccess?.(json)
                onClose()
            }, 1500)
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setError(message)
            setLoading(false)
            console.error('Application submission error:', err)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold">Apply for Job</h3>
                        {jobTitle && <p className="text-sm opacity-90">{jobTitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {success ? (
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
                            <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-700 font-semibold">Application submitted successfully! 🎉</p>
                            <p className="text-sm text-green-600 mt-1">We'll review your application soon.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    <p className="font-semibold">Error</p>
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                                <input
                                    required
                                    type="text"
                                    value={Name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                                <input
                                    required
                                    type="email"
                                    value={Email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone (optional)</label>
                                <input
                                    type="tel"
                                    value={Phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Your phone number"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Submit Application
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}
