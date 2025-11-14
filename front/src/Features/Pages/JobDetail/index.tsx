import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import ApplyForm from '../../Components/ApplyForm'
import { useAuth } from '../../../Context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'

const JobDetail = () => {
    const { id } = useParams() as { id?: string }
    const [job, setJob] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [applyFormOpen, setApplyFormOpen] = useState(false)
    const auth = useAuth()

    useEffect(() => {
        if (!id) return
        const fetchJob = async () => {
            setLoading(true)
            setError(null)
            try {
                const params = new URLSearchParams()
                params.append('populate[0]', 'location')
                params.append('populate[1]', 'level')
                params.append('populate[2]', 'field')
                params.append('populate[3]', 'Logo')

                const url = `${API_URL}/api/jobs/${id}?${params.toString()}`
                console.log('Fetching job detail from', url)
                const res = await fetch(url)

                if (!res.ok) {
                    const text = await res.text().catch(() => '')
                    console.error('Job detail fetch failed', res.status, text)

                    // If 404, try a fallback: fetch jobs list and try to find by several identifiers
                    if (res.status === 404) {
                        try {
                            console.log('Attempting fallback: fetch all jobs to locate by id/documentId')
                            const listUrl = `${API_URL}/api/jobs?${params.toString()}`
                            const listRes = await fetch(listUrl)
                            const listJson = await listRes.json()
                            const items = listJson?.data ?? []

                            const found = (items || []).find((it: any) => {
                                const raw = it?.data ?? it
                                const idNum = raw?.id ?? raw?.id
                                const docId = raw?.documentId ?? raw?.documentId ?? raw?.documentId
                                // match numeric id or documentId string
                                if (String(idNum) === String(id)) return true
                                if (docId && String(docId) === String(id)) return true
                                // also match by Title or JobTitle
                                const attrs = raw?.attributes ? { ...raw.attributes } : raw
                                const title = attrs?.Title ?? attrs?.JobTitle ?? attrs?.title
                                if (title && String(title).toLowerCase().includes(String(id).toLowerCase())) return true
                                return false
                            })

                            if (found) {
                                console.log('Found job in list fallback', found)
                                let jobRaw: any = found.data ?? found
                                jobRaw = jobRaw?.data ?? jobRaw

                                const normalize = (raw: any) => {
                                    if (!raw) return null
                                    const source = raw.attributes ? { id: raw.id, ...raw.attributes } : raw
                                    const pick = {
                                        id: source.id,
                                        Title: source.Title ?? source.JobTitle ?? source.title,
                                        Company: source.Company,
                                        Description: source.Description ?? source.description,
                                        Logo: (() => {
                                            const l = source.Logo ?? source.logo
                                            if (!l) return undefined
                                            const ld = l.data ?? l
                                            return { url: ld?.url }
                                        })(),
                                        location: (() => {
                                            const loc = source.location ?? source.Location ?? source.location
                                            const ld = loc?.data ?? loc
                                            if (!ld) return undefined
                                            return { Location: ld?.Location ?? ld?.name ?? ld }
                                        })(),
                                        level: (() => {
                                            const lvl = source.level ?? source.Level
                                            const ld = lvl?.data ?? lvl
                                            if (!ld) return undefined
                                            return { Level: ld?.Level ?? ld?.name ?? ld }
                                        })(),
                                        field: (() => {
                                            const fld = source.field ?? source.Field
                                            const ld = fld?.data ?? fld
                                            if (!ld) return undefined
                                            return { Field: ld?.Field ?? ld?.name ?? ld }
                                        })(),
                                    }
                                    return pick
                                }

                                const jobObj = normalize(jobRaw)
                                setJob(jobObj)
                                return
                            }
                        } catch (fallbackErr) {
                            console.error('Fallback lookup failed', fallbackErr)
                        }
                    }

                    throw new Error(`Failed to load job: ${res.status} ${text}`)
                }

                const data = await res.json()
                console.log('Raw job response', data)

                // Normalize several possible Strapi shapes into a flat job object
                let jobRaw: any = data?.data ?? data
                // If nested data again (sometimes returned as { data: { data: { ... }}} )
                jobRaw = jobRaw?.data ?? jobRaw

                const normalize = (raw: any) => {
                    if (!raw) return null
                    // If Strapi returns attributes wrapper
                    const source = raw.attributes ? { id: raw.id, ...raw.attributes } : raw

                    const pick = {
                        id: source.id,
                        Title: source.Title ?? source.JobTitle ?? source.title,
                        Company: source.Company,
                        Description: source.Description ?? source.description,
                        Logo: (() => {
                            const l = source.Logo ?? source.logo
                            if (!l) return undefined
                            // media field may be { data: { attributes... } } or direct
                            const ld = l.data ?? l
                            return { url: ld?.url }
                        })(),
                        location: (() => {
                            const loc = source.location ?? source.Location ?? source.location
                            const ld = loc?.data ?? loc
                            if (!ld) return undefined
                            return { Location: ld?.Location ?? ld?.name ?? ld }
                        })(),
                        level: (() => {
                            const lvl = source.level ?? source.Level
                            const ld = lvl?.data ?? lvl
                            if (!ld) return undefined
                            return { Level: ld?.Level ?? ld?.name ?? ld }
                        })(),
                        field: (() => {
                            const fld = source.field ?? source.Field
                            const ld = fld?.data ?? fld
                            if (!ld) return undefined
                            return { Field: ld?.Field ?? ld?.name ?? ld }
                        })(),
                    }

                    return pick
                }

                const jobObj = normalize(jobRaw)
                console.log('Normalized job:', jobObj)
                if (!jobObj) throw new Error('Job not found')
                setJob(jobObj)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
                console.error('Job fetch error', err)
            } finally {
                setLoading(false)
            }
        }
        fetchJob()
    }, [id])

    if (loading) return <div className="p-8 text-center">Loading job...</div>
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>
    if (!job) return <div className="p-8 text-center">Job not found</div>

    const logoUrl = job?.Logo?.url ? `${API_URL}${job.Logo.url}` : null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Company Logo */}
                        {logoUrl && (
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl shadow-lg border border-gray-100">
                                        <img
                                            src={logoUrl}
                                            alt={job.Company}
                                            className="w-24 h-24 object-contain"
                                        />
                                    </div>
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-2xl opacity-20"></div>
                                </div>
                            </div>
                        )}

                        {/* Job Info */}
                        <div className="flex-1">
                            {/* Job Title */}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                                {job.Title}
                            </h1>

                            {/* Company Name */}
                            {job.Company && (
                                <div className="flex items-center gap-2 mb-6">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="text-xl text-gray-700 font-semibold">{job.Company}</span>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-3">
                                {job.location && (
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 text-blue-700 px-5 py-2.5 rounded-full font-semibold shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {job.location.Location}
                                    </div>
                                )}
                                {job.level && (
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 text-purple-700 px-5 py-2.5 rounded-full font-semibold shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        {job.level.Level}
                                    </div>
                                )}
                                {job.field && (
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-300 text-pink-700 px-5 py-2.5 rounded-full font-semibold shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {job.field.Field}
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-green-700 px-5 py-2.5 rounded-full font-bold shadow-sm">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                    Actively Hiring
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons - Desktop */}
                        <div className="hidden md:flex flex-col gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    const { isAuthenticated, openLogin } = auth
                                    if (!isAuthenticated) return openLogin()
                                    setApplyFormOpen(true)
                                }}
                                className="group relative overflow-hidden bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-2 whitespace-nowrap">
                                <span className="relative z-10">Apply Now</span>
                                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                Save Job
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Job Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Job Description Card */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">Job Description</h2>
                            </div>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                                    {job.Description}
                                </p>
                            </div>
                        </div>

                        {/* Key Information Card */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Posted Date</p>
                                        <p className="text-gray-900 font-semibold">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Job Type</p>
                                        <p className="text-gray-900 font-semibold">Full-time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Apply Card */}
                        <div className="bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white sticky top-30">
                            <h3 className="text-2xl font-bold mb-4">Ready to Apply?</h3>
                            <p className="text-blue-100 mb-6">
                                Join our team and start your journey with us today!
                            </p>
                            <button
                                onClick={() => {
                                    const { isAuthenticated, openLogin } = auth
                                    if (!isAuthenticated) return openLogin()
                                    setApplyFormOpen(true)
                                }}
                                className="group w-full bg-white hover:bg-gray-100 text-gray-900 font-bold px-6 py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 mb-4">
                                <span>Apply for this Position</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share Job
                            </button>
                        </div>

                        {/* Company Info Card */}
                        {job.Company && (
                            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">About the Company</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    {logoUrl && (
                                        <img src={logoUrl} alt={job.Company} className="w-12 h-12 object-contain" />
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900">{job.Company}</p>
                                        <p className="text-sm text-gray-500">Technology Company</p>
                                    </div>
                                </div>
                                <button className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-3 rounded-xl transition-all duration-300">
                                    View Company Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Navigation - Mobile */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
                    <div className="flex gap-3">
                        <Link to="/" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 text-gray-700 font-bold rounded-xl transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </Link>
                        <button
                            onClick={() => {
                                const { isAuthenticated, openLogin } = auth
                                if (!isAuthenticated) return openLogin()
                                setApplyFormOpen(true)
                            }}
                            className="flex-1 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-lg">
                            Apply Now
                        </button>
                    </div>
                </div>

                {/* Back Button - Desktop */}
                <div className="hidden md:block mt-12">
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Jobs
                    </Link>
                </div>
            </div>

            {/* Apply Form Modal */}
            {applyFormOpen && job && (
                <ApplyForm
                    jobId={job.id}
                    jobTitle={job.Title}
                    onClose={() => setApplyFormOpen(false)}
                    onSuccess={() => {
                        console.log('Application submitted successfully')
                        setApplyFormOpen(false)
                    }}
                />
            )}
        </div>
    )
}

export default JobDetail
