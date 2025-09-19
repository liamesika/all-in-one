'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Textarea, Badge, Progress, Alert, AlertDescription } from '@/components/ui';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Property Searcher</h1>
        <p className="text-gray-600">
          Use AI to find and score properties based on your specific criteria
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
          <CardDescription>
            Define your property requirements and let AI find the best matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={searchParams.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, location: e.target.value })}
                  placeholder="e.g., Tel Aviv, Ramat Aviv"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minRooms">Min Rooms</Label>
                  <Input
                    id="minRooms"
                    type="number"
                    min="1"
                    max="10"
                    value={searchParams.minRooms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, minRooms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxRooms">Max Rooms</Label>
                  <Input
                    id="maxRooms"
                    type="number"
                    min="1"
                    max="10"
                    value={searchParams.maxRooms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, maxRooms: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minSize">Min Size (m²)</Label>
                  <Input
                    id="minSize"
                    type="number"
                    min="1"
                    value={searchParams.minSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, minSize: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxSize">Max Size (m²)</Label>
                  <Input
                    id="maxSize"
                    type="number"
                    min="1"
                    value={searchParams.maxSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, maxSize: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minPrice">Min Price (₪)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    min="0"
                    value={searchParams.minPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price (₪)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    min="0"
                    value={searchParams.maxPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={searchParams.keywords}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                  placeholder="e.g., parking, balcony, elevator, renovated"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Additional Requirements</Label>
                <Textarea
                  id="description"
                  value={searchParams.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSearchParams({ ...searchParams, description: e.target.value })}
                  placeholder="Describe any specific requirements or preferences..."
                  rows={3}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || currentJob?.status === 'PROCESSING'}
              className="w-full"
            >
              🔍 {isLoading || currentJob?.status === 'PROCESSING' ? 'Searching...' : 'Start AI Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Job Status */}
      {currentJob && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Search Status</h3>
                <p className="text-sm text-gray-600">Job ID: {currentJob.id}</p>
              </div>
              <Badge variant={currentJob.status === 'COMPLETED' ? 'default' : 'secondary'}>
                {currentJob.status}
              </Badge>
            </div>
            
            {currentJob.status === 'PROCESSING' && (
              <div className="space-y-2">
                <Progress value={currentJob.progress} className="w-full" />
                <p className="text-sm text-gray-600">Progress: {currentJob.progress}%</p>
              </div>
            )}
            
            {currentJob.status === 'COMPLETED' && (
              <p className="text-green-600">
                ✓ Found {currentJob.totalListings} properties
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="mb-8" variant="destructive">
          <AlertDescription>⚠️ {error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {listings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Search Results ({listings.length})</h2>
            <Button variant="outline" size="sm">
              📥 Export CSV
            </Button>
          </div>

          <div className="grid gap-6">
            {listings
              .sort((a, b) => b.aiScore - a.aiScore)
              .map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                      <p className="text-gray-600 mb-4">{listing.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <span className="font-medium">{listing.location}</span>
                        <span>₪{listing.price.toLocaleString()}/month</span>
                        <span>{listing.rooms} rooms</span>
                        <span>{listing.size}m²</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${getScoreColor(listing.aiScore)}`}>
                        {Math.round(listing.aiScore)}% Match
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <p className="text-sm text-gray-700">{listing.aiNotes}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        🔗 View Original
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}