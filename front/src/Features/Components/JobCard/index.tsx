import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import ApplyForm from '../ApplyForm'
import { useAuth } from '../../../Context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'

interface Location {
    id: number
    documentId?: string
    Location?: string
}

interface Level {
    id: number
    documentId?: string
    Level?: string
}

interface Field {
    id: number
    documentId?: string
    Field?: string
}

type Filters = {
    level?: string
    location?: string
    field?: string
}

interface Job {
    id: number
    documentId: string
    Title: string
    Company?: string
    Description?: string
    Logo?: {
        id: number
        name?: string
        url: string
        formats?: {
            thumbnail?: { url: string }
            small?: { url: string }
        }
    }
    field?: Field
    level?: Level
    location?: Location
    createdAt: string
    publishedAt?: string
}

interface JobsResponse {
    data: Job[] | Job
    meta?: any
}

const fetchJobs = async (): Promise<JobsResponse> => {
    // Build URL with populate parameters for relations
    const baseUrl = `${API_URL}/api/jobs`
    const params = new URLSearchParams()
    params.append('populate[0]', 'location')
    params.append('populate[1]', 'level')
    params.append('populate[2]', 'field')
    params.append('populate[3]', 'Logo')

    const url = `${baseUrl}?${params.toString()}`
    console.log('Fetching from:', url)

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('API Error Response:', response.status, errorText)
            throw new Error(`Failed to fetch jobs: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log('Jobs data received:', data)
        return data
    } catch (error) {
        console.error('Fetch error:', error)
        throw error
    }
}

const JobCard = ({ searchQuery = '', filters = {} }: { searchQuery?: string, filters?: Filters }) => {
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
    const [applyFormOpen, setApplyFormOpen] = useState(false)
    const { isAuthenticated, openLogin } = useAuth()

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['jobs'],
        queryFn: fetchJobs,
        retry: 2,
    })

    if (isLoading) {
        return <div className="text-center py-8">Loading jobs...</div>
    }

    if (isError) {
        return (
            <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-semibold mb-2">Error loading jobs</p>
                <p className="text-red-500 text-sm">{error?.message}</p>
                <p className="text-gray-600 text-xs mt-4">
                    Make sure Strapi backend is running at: <code className="bg-gray-100 px-2 py-1">{API_URL}</code>
                </p>
                <p className="text-gray-600 text-xs mt-2">
                    Check browser console for more details.
                </p>
            </div>
        )
    }

    if (!data?.data || (Array.isArray(data.data) && data.data.length === 0)) {
        return <div className="text-center py-8">No jobs found</div>
    }

    let jobs = Array.isArray(data.data) ? data.data : [data.data]

    // Filter jobs by search query
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        jobs = jobs.filter((job: Job) =>
            job.Title.toLowerCase().includes(query) ||
            job.Company?.toLowerCase().includes(query) ||
            job.Description?.toLowerCase().includes(query) ||
            job.location?.Location?.toLowerCase().includes(query) ||
            job.field?.Field?.toLowerCase().includes(query)
        )
    }

    // Apply relation filters
    if (filters) {
        if (filters.level) {
            const lvl = filters.level.toLowerCase()
            jobs = jobs.filter((job: Job) => (job.level?.Level ?? '').toLowerCase() === lvl)
        }
        if (filters.location) {
            const loc = filters.location.toLowerCase()
            jobs = jobs.filter((job: Job) => (job.location?.Location ?? '').toLowerCase() === loc)
        }
        if (filters.field) {
            const fld = filters.field.toLowerCase()
            jobs = jobs.filter((job: Job) => (job.field?.Field ?? '').toLowerCase() === fld)
        }
    }

    if (jobs.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-semibold">No jobs match your search</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 " >
                {
                    jobs.map((job: Job) => (
                        <div
                            key={job.id}
                            className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all shadow-lg duration-500 hover:-translate-y-2"
                        >
                            {/* Animated Gradient Border */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[2px] rounded-3xl">
                                <div className="absolute inset-[2px] bg-white rounded-3xl"></div>
                            </div>

                            {/* Inner Content */}
                            <div className="relative bg-white rounded-3xl p-8 h-full border-2 border-gray-100 group-hover:border-transparent transition-colors duration-500">
                                {/* Decorative Top Gradient */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-800 via-indigo-700 to-blue-600"></div>

                                {/* Top Section */}
                                <div className="flex items-start justify-between mb-6">
                                    {/* Company Logo */}
                                    {job.Logo && (
                                        <div className="relative">
                                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                                <img
                                                    src={`${API_URL}${job.Logo.url}`}
                                                    alt={job.Company || 'Company logo'}
                                                    className="h-14 w-14 object-contain"
                                                />
                                            </div>
                                            {/* Floating glow */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-700 text-xs font-bold px-4 py-2 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                                        HIRING
                                    </div>
                                </div>

                                {/* Job Title */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                    {job.Title}
                                </h3>

                                {/* Company Name */}
                                {job.Company && (
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="p-1.5 bg-gray-100 rounded-lg">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700 font-semibold text-lg">{job.Company}</span>
                                    </div>
                                )}



                                {/* Info Cards Grid */}
                                <div className="space-y-3 mb-6">
                                    {/* Location */}
                                    {job.location && (
                                        <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 rounded-2xl p-4 group-hover:shadow-md transition-shadow">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Location</p>
                                                <p className="text-gray-900 font-bold text-base">{job.location.Location || 'Remote'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Level & Field Row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Level */}
                                        {job.level && (
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-100 rounded-2xl p-4 group-hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Level</p>
                                                </div>
                                                <p className="text-gray-900 font-bold text-sm">{job.level.Level || 'N/A'}</p>
                                            </div>
                                        )}

                                        {/* Field */}
                                        {job.field && (
                                            <div className="bg-gradient-to-br from-pink-50 to-pink-50/50 border border-pink-100 rounded-2xl p-4 group-hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md shadow-pink-500/30">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Field</p>
                                                </div>
                                                <p className="text-gray-900 font-bold text-sm">{job.field.Field || 'N/A'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium">
                                            {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            to={`/jobs/${job.id}`}
                                            className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 hover:from-black hover:via-gray-900 hover:to-gray-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-600/30 hover:scale-105"
                                        >
                                            Info
                                        </Link>

                                        <button
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    openLogin()
                                                    return
                                                }
                                                setSelectedJobId(job.id)
                                                setApplyFormOpen(true)
                                            }}
                                            className="group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-2"
                                        >
                                            <span className="relative z-10">Apply Now</span>
                                            <svg className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                            {/* Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Corner Elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 -z-10"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-100 via-purple-100 to-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 -z-10"></div>
                        </div>
                    ))
                }
            </div>
            {applyFormOpen && selectedJobId && (
                <ApplyForm
                    jobId={selectedJobId}
                    jobTitle={jobs.find((j: Job) => j.id === selectedJobId)?.Title}
                    onClose={() => setApplyFormOpen(false)}
                    onSuccess={() => {
                        console.log('Application submitted successfully')
                    }}
                />
            )}
        </>
    )
}

export default JobCard