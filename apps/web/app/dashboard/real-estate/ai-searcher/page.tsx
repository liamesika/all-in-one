'use client';

/**
 * AI Property Searcher Page (Redesigned with Design System 2.0)
 * AI-powered property search with scoring and recommendations
 */

import { useState } from 'react';
import {
  Search,
  MapPin,
  Home,
  Ruler,
  DollarSign,
  Tag,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

// Import unified components
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  StatusBadge,
} from '@/components/shared';

interface SearchParams {
  location: string;
  minRooms: string;
  maxRooms: string;
  minSize: string;
  maxSize: string;
  minPrice: string;
  maxPrice: string;
  keywords: string;
  description: string;
}

interface JobStatus {
  id: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
  totalListings?: number;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rooms: number;
  size: number;
  aiScore: number;
  aiNotes: string;
  sourceUrl: string;
  imageUrls: string[];
}

export default function AISearcherPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: '',
    minRooms: '',
    maxRooms: '',
    minSize: '',
    maxSize: '',
    minPrice: '',
    maxPrice: '',
    keywords: '',
    description: ''
  });

  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCurrentJob(null);
    setListings([]);

    try {
      const body = {
        ...(searchParams.location && { location: searchParams.location }),
        ...(searchParams.minRooms && { minRooms: parseInt(searchParams.minRooms) }),
        ...(searchParams.maxRooms && { maxRooms: parseInt(searchParams.maxRooms) }),
        ...(searchParams.minSize && { minSize: parseInt(searchParams.minSize) }),
        ...(searchParams.maxSize && { maxSize: parseInt(searchParams.maxSize) }),
        ...(searchParams.minPrice && { minPrice: parseInt(searchParams.minPrice) }),
        ...(searchParams.maxPrice && { maxPrice: parseInt(searchParams.maxPrice) }),
        ...(searchParams.keywords && { keywords: searchParams.keywords.split(',').map(k => k.trim()) }),
        ...(searchParams.description && { description: searchParams.description })
      };

      const response = await fetch('/api/real-estate/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user' // TODO: Replace with actual user ID
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to start search job');
      }

      const result = await response.json();
      setCurrentJob({ id: result.jobId, status: 'QUEUED', progress: 0, createdAt: new Date().toISOString() });
      
      // Start polling for job status
      pollJobStatus(result.jobId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/real-estate/research/${jobId}/status`, {
          headers: {
            'x-user-id': 'test-user'
          }
        });

        if (response.ok) {
          const status: JobStatus = await response.json();
          setCurrentJob(status);

          if (status.status === 'COMPLETED') {
            fetchResults(jobId);
            return;
          } else if (status.status === 'FAILED') {
            setError(status.error || 'Job failed');
            return;
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }

      setTimeout(poll, 2000);
    };

    poll();
  };

  const fetchResults = async (jobId: string) => {
    try {
      const response = await fetch(`/api/real-estate/research/${jobId}/results`, {
        headers: {
          'x-user-id': 'test-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
              AI Property Searcher
            </h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Use AI to find and score properties based on your specific criteria
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UniversalButton
              variant="outline"
              size="md"
              leftIcon={<Sparkles className="w-5 h-5" />}
            >
              View Past Searches
            </UniversalButton>
          </div>
        </div>

        {/* Search Form */}
        <UniversalCard variant="default">
          <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[#2979FF]/10 rounded-lg">
                <Search className="w-5 h-5 text-[#2979FF]" />
              </div>
              <div>
                <h2 className="text-heading-4 text-gray-900 dark:text-white">
                  Search Criteria
                </h2>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                  Define your property requirements and let AI find the best matches
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="location" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={searchParams.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, location: e.target.value })}
                    placeholder="e.g., Tel Aviv, Ramat Aviv"
                    className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                  />
                </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label htmlFor="minRooms" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                    <Home className="w-4 h-4" />
                    Min Rooms
                  </label>
                  <input
                    id="minRooms"
                    type="number"
                    min="1"
                    max="10"
                    value={searchParams.minRooms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, minRooms: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxRooms" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                    <Home className="w-4 h-4" />
                    Max Rooms
                  </label>
                  <input
                    id="maxRooms"
                    type="number"
                    min="1"
                    max="10"
                    value={searchParams.maxRooms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, maxRooms: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label htmlFor="minSize" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                    <Ruler className="w-4 h-4" />
                    Min Size (m²)
                  </label>
                  <input
                    id="minSize"
                    type="number"
                    min="1"
                    value={searchParams.minSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, minSize: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxSize" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                    <Ruler className="w-4 h-4" />
                    Max Size (m²)
                  </label>
                  <input
                    id="maxSize"
                    type="number"
                    min="1"
                    value={searchParams.maxSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, maxSize: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label htmlFor="minPrice" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                    <DollarSign className="w-4 h-4" />
                    Min Price (₪)
                  </label>
                  <input
                    id="minPrice"
                    type="number"
                    min="0"
                    value={searchParams.minPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxPrice" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                    <DollarSign className="w-4 h-4" />
                    Max Price (₪)
                  </label>
                  <input
                    id="maxPrice"
                    type="number"
                    min="0"
                    value={searchParams.maxPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="keywords" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                  <Tag className="w-4 h-4" />
                  Keywords (comma-separated)
                </label>
                <input
                  id="keywords"
                  value={searchParams.keywords}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                  placeholder="e.g., parking, balcony, elevator, renovated"
                  className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="description" className="flex items-center gap-2 text-body-sm font-medium text-gray-900 dark:text-white">
                  <FileText className="w-4 h-4" />
                  Additional Requirements
                </label>
                <textarea
                  id="description"
                  value={searchParams.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSearchParams({ ...searchParams, description: e.target.value })}
                  placeholder="Describe any specific requirements or preferences..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                />
              </div>
            </div>

            <UniversalButton
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<Search className="w-5 h-5" />}
              disabled={isLoading || currentJob?.status === 'PROCESSING'}
              className="w-full"
            >
              {isLoading || currentJob?.status === 'PROCESSING' ? 'Searching...' : 'Start AI Search'}
            </UniversalButton>
          </form>
        </CardBody>
      </UniversalCard>

        {/* Job Status */}
        {currentJob && (
          <UniversalCard variant="default">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-heading-4 text-gray-900 dark:text-white">
                      Search Status
                    </h3>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400">
                      Job ID: {currentJob.id}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  status={
                    currentJob.status === 'COMPLETED' ? 'completed' :
                    currentJob.status === 'PROCESSING' ? 'active' :
                    currentJob.status === 'FAILED' ? 'failed' : 'pending'
                  }
                >
                  {currentJob.status}
                </StatusBadge>
              </div>

              {currentJob.status === 'PROCESSING' && (
                <div className="space-y-3">
                  <div className="relative w-full h-2 bg-gray-200 dark:bg-[#1A2F4B] rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#2979FF] to-purple-500 transition-all duration-500"
                      style={{ width: `${currentJob.progress}%` }}
                    />
                  </div>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">
                    Progress: {currentJob.progress}%
                  </p>
                </div>
              )}

              {currentJob.status === 'COMPLETED' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-body-base font-medium">
                    Found {currentJob.totalListings} properties
                  </span>
                </div>
              )}

              {currentJob.status === 'FAILED' && currentJob.error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-body-base">
                    {currentJob.error}
                  </span>
                </div>
              )}
            </CardBody>
          </UniversalCard>
        )}

        {/* Error Display */}
        {error && (
          <UniversalCard variant="outlined" className="border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-body-base text-red-800 dark:text-red-300">
                  {error}
                </span>
              </div>
            </CardBody>
          </UniversalCard>
        )}

        {/* Results */}
        {listings.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading-2 text-gray-900 dark:text-white">
                  Search Results ({listings.length})
                </h2>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                  Sorted by AI match score
                </p>
              </div>
              <UniversalButton
                variant="outline"
                size="md"
                leftIcon={<Download className="w-5 h-5" />}
              >
                Export CSV
              </UniversalButton>
            </div>

            <div className="grid gap-6">
              {listings
                .sort((a, b) => b.aiScore - a.aiScore)
                .map((listing) => (
                  <UniversalCard key={listing.id} variant="default" hoverable>
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between gap-6 mb-6">
                        <div className="flex-1">
                          <h3 className="text-heading-3 text-gray-900 dark:text-white mb-2">
                            {listing.title}
                          </h3>
                          <p className="text-body-base text-gray-600 dark:text-gray-400 mb-4">
                            {listing.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-body-sm mb-4">
                            <span className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                              <MapPin className="w-4 h-4 text-[#2979FF]" />
                              {listing.location}
                            </span>
                            <span className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              ₪{listing.price.toLocaleString()}/month
                            </span>
                            <span className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                              <Home className="w-4 h-4 text-purple-500" />
                              {listing.rooms} rooms
                            </span>
                            <span className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                              <Ruler className="w-4 h-4 text-orange-500" />
                              {listing.size}m²
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold ${
                              listing.aiScore >= 80
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : listing.aiScore >= 60
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                            {Math.round(listing.aiScore)}% Match
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-4 border border-purple-200 dark:border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="text-heading-5 text-gray-900 dark:text-white">
                            AI Analysis
                          </h4>
                        </div>
                        <p className="text-body-sm text-gray-700 dark:text-gray-300">
                          {listing.aiNotes}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <UniversalButton
                          variant="outline"
                          size="sm"
                          leftIcon={<ExternalLink className="w-4 h-4" />}
                          onClick={() => window.open(listing.sourceUrl, '_blank')}
                        >
                          View Original
                        </UniversalButton>
                      </div>
                    </CardBody>
                  </UniversalCard>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}