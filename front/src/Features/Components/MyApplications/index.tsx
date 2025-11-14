import { useEffect, useState } from 'react';

interface Application {
    id: number;
    Name: string;
    Email: string;
    Phone: string | number | null;
    ApplicationStatus: 'Pending' | 'Accepted' | 'Rejected';
    job: {
        id: number;
        Title: string;
        Company: string;
        Description: string;
        location?: {
            Location: string;
        };
        level?: {
            Level: string;
        };
        field?: {
            Field: string;
        };
    };
    createdAt: string;
}

interface MyApplicationsProps {
    isOpen: boolean;
    onClose: () => void;
}

const MyApplications = ({ isOpen, onClose }: MyApplicationsProps) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchApplications();
        }
    }, [isOpen]);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

            // Build populate query for Strapi v5
            const params = new URLSearchParams();
            params.append('populate[0]', 'job');
            params.append('populate[1]', 'job.location');
            params.append('populate[2]', 'job.level');
            params.append('populate[3]', 'job.field');
            params.append('populate[4]', 'job.Logo');

            const response = await fetch(`${API_URL}/api/applications?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch applications: ${response.statusText}`);
            }

            const data = await response.json();
            const applicationsData = data.data || [];

            console.log('Raw API response:', applicationsData);

            // Transform the data to match our interface
            const transformedApplications: Application[] = applicationsData.map((app: any) => {
                // Handle Strapi v5 data structure - relations come as objects with data property
                const jobData = app.job?.data || app.job;
                const locationData = jobData?.location?.data || jobData?.location;
                const levelData = jobData?.level?.data || jobData?.level;
                const fieldData = jobData?.field?.data || jobData?.field;

                console.log('App details:', { app, jobData, locationData, levelData, fieldData });

                return {
                    id: app.id,
                    Name: app.Name,
                    Email: app.Email,
                    Phone: app.Phone,
                    ApplicationStatus: app.ApplicationStatus,
                    job: {
                        id: jobData?.id || 0,
                        Title: jobData?.Title || 'N/A',
                        Company: jobData?.Company || 'N/A',
                        Description: jobData?.Description || '',
                        location: locationData ? { Location: locationData.Location } : undefined,
                        level: levelData ? { Level: levelData.Level } : undefined,
                        field: fieldData ? { Field: fieldData.Field } : undefined,
                    },
                    createdAt: app.createdAt,
                };
            });

            console.log('Transformed applications:', transformedApplications);
            setApplications(transformedApplications);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Accepted':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-bold">My Applications</h2>
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
                <div className="overflow-y-auto flex-1 p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin">
                                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg">
                            <p className="font-semibold">Error Loading Applications</p>
                            <p>{error}</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-semibold">No applications yet</p>
                            <p className="text-sm">Start applying to jobs to see your applications here!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <div
                                    key={app.id}
                                    className="border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition bg-white"
                                >
                                    {/* Application Header with Status */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800">{app.job.Title}</h3>
                                            <p className="text-sm text-gray-600">{app.job.Company}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold border-2 whitespace-nowrap ml-4 ${getStatusBadgeColor(
                                                app.ApplicationStatus
                                            )}`}
                                        >
                                            {app.ApplicationStatus}
                                        </span>
                                    </div>

                                    {/* Job Details */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                        <p className="text-gray-700 text-sm mb-2">{app.job.Description}</p>
                                        <div className="flex flex-wrap gap-3 text-xs">
                                            {app.job.field && (
                                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                                                    <span className="font-semibold text-gray-600">Field:</span>
                                                    <span className="text-gray-800">{app.job.field.Field}</span>
                                                </div>
                                            )}
                                            {app.job.level && (
                                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                                                    <span className="font-semibold text-gray-600">Level:</span>
                                                    <span className="text-gray-800">{app.job.level.Level}</span>
                                                </div>
                                            )}
                                            {app.job.location && (
                                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                                                    <span className="font-semibold text-gray-600">Location:</span>
                                                    <span className="text-gray-800">{app.job.location.Location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Your Application Info */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-600 font-semibold">Your Name</p>
                                            <p className="text-gray-800">{app.Name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 font-semibold">Your Email</p>
                                            <p className="text-gray-800">{app.Email}</p>
                                        </div>
                                        {app.Phone && (
                                            <div>
                                                <p className="text-xs text-gray-600 font-semibold">Your Phone</p>
                                                <p className="text-gray-800">{app.Phone}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submitted Date */}
                                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                                        Applied on {formatDate(app.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyApplications;
