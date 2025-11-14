import React from 'react'
import JobCard from '../../Components/JobCard'

type Filters = {
    level?: string
    location?: string
    field?: string
}

interface FeaturedJobsProps {
    searchQuery?: string
    filters?: Filters
}

const FeaturedJobs = ({ searchQuery = '', filters = {} }: FeaturedJobsProps) => {
    return (
        <section className="py-12 px-4 md:px-8 md:mx-30">
            <h1 className="text-3xl font-bold mb-8">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Jobs'}
            </h1>
            <JobCard searchQuery={searchQuery} filters={filters} />
        </section>
    )
}

export default FeaturedJobs