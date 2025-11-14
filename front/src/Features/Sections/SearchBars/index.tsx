import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Filter } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'

type Filters = {
    level?: string
    location?: string
    field?: string
}

interface SearchBarsProps {
    onSearch: (query: string, filters: Filters) => void
}

const SearchBars = ({ onSearch }: SearchBarsProps) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [levels, setLevels] = useState<string[]>([])
    const [locations, setLocations] = useState<string[]>([])
    const [fields, setFields] = useState<string[]>([])
    const [filters, setFilters] = useState<Filters>({})
    const [showFilters, setShowFilters] = useState(false)

    const extractName = (item: any, key: string) =>
        item?.[key] ??
        item?.attributes?.[key] ??
        item?.attributes?.[key.toLowerCase()] ??
        item?.[key.toLowerCase()] ??
        null

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [lv, loc, fd] = await Promise.all([
                    fetch(`${API_URL}/api/levels`),
                    fetch(`${API_URL}/api/locations`),
                    fetch(`${API_URL}/api/fields`),
                ])
                const [lvJson, locJson, fdJson] = await Promise.all([
                    lv.json(),
                    loc.json(),
                    fd.json(),
                ])
                setLevels((lvJson?.data ?? []).map((it: any) => extractName(it, 'Level')).filter(Boolean))
                setLocations((locJson?.data ?? []).map((it: any) => extractName(it, 'Location')).filter(Boolean))
                setFields((fdJson?.data ?? []).map((it: any) => extractName(it, 'Field')).filter(Boolean))
            } catch (e) {
                console.error('Failed to load filter options', e)
            }
        }
        fetchOptions()
    }, [])

    useEffect(() => {
        onSearch(searchQuery, filters)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value
        setSearchQuery(query)
        onSearch(query, filters)
    }

    const handleClear = () => {
        setSearchQuery('')
        setFilters({})
        onSearch('', {})
    }

    return (
        <section className="relative py-12 px-6 md:px-10">
            {/* Background glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-purple-600/10 blur-3xl opacity-60 rounded-3xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl"
            >
                <h2 className="text-center text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent mb-8">
                    Discover Opportunities
                </h2>

                {/* Search input bar */}
                <div className="relative flex items-center rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-blue-50/70 via-white/80 to-blue-50/70 focus-within:ring-4 focus-within:ring-blue-400/30 transition-all">
                    <Search className="absolute left-4 text-blue-500 w-6 h-6" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder="Search job title, company or keyword..."
                        className="w-full pl-14 pr-24 py-4 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none font-medium text-lg"
                    />

                    <div className="absolute right-3 flex items-center gap-2">
                        {searchQuery && (
                            <button
                                onClick={handleClear}
                                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters((v) => !v)}
                            className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Animated Filter Dropdown */}
                <motion.div
                    initial={false}
                    animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`overflow-hidden mt-6`}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select
                            value={filters.level ?? ''}
                            onChange={(e) => setFilters((s) => ({ ...s, level: e.target.value || undefined }))}
                            className="w-full py-3 px-4 rounded-xl bg-white/80 border border-blue-100 text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-200/40"
                        >
                            <option value="">All Levels</option>
                            {levels.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.location ?? ''}
                            onChange={(e) => setFilters((s) => ({ ...s, location: e.target.value || undefined }))}
                            className="w-full py-3 px-4 rounded-xl bg-white/80 border border-blue-100 text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-200/40"
                        >
                            <option value="">All Locations</option>
                            {locations.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.field ?? ''}
                            onChange={(e) => setFilters((s) => ({ ...s, field: e.target.value || undefined }))}
                            className="w-full py-3 px-4 rounded-xl bg-white/80 border border-blue-100 text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-200/40"
                        >
                            <option value="">All Fields</option>
                            {fields.map((f) => (
                                <option key={f} value={f}>
                                    {f}
                                </option>
                            ))}
                        </select>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}

export default SearchBars
