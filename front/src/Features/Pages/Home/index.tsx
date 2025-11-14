import { useState } from "react"
import SearchBars from "../../Sections/SearchBars"
import TechJobsHero from "../../Sections/TechJobsHero"
import FeaturedJobs from "../../Sections/FeaturedJobs"

type Filters = {
    level?: string
    location?: string
    field?: string
}

const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState<Filters>({})

    const handleSearch = (query: string, newFilters: Filters) => {
        setSearchQuery(query)
        setFilters(newFilters)
    }

    return (
        <>
            <TechJobsHero />
            <SearchBars onSearch={handleSearch} />
            <FeaturedJobs searchQuery={searchQuery} filters={filters} />
        </>
    )
}

export default HomePage