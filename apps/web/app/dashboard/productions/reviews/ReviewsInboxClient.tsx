'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Clock, Eye, FileText, Film, Image as ImageIcon } from 'lucide-react';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';

interface Review {
  id: string;
  projectId: string;
  assetId: string;
  status: ReviewStatus;
  comments: string | null;
  requestedAt: string;
  decidedAt: string | null;
  project: {
    id: string;
    name: string;
    status: string;
  };
  asset: {
    id: string;
    title: string;
    type: string;
    storageUrl: string;
    version: number;
  };
}

export default function ReviewsInboxClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [actionComments, setActionComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/productions/reviews?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReview) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/productions/reviews/${selectedReview.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: actionComments || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve review');
      }

      setShowApproveDialog(false);
      setActionComments('');
      setSelectedReview(null);
      await fetchReviews();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedReview) return;

    if (!actionComments.trim()) {
      alert('Please provide comments explaining what changes are needed');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/productions/reviews/${selectedReview.id}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: actionComments }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request changes');
      }

      setShowChangesDialog(false);
      setActionComments('');
      setSelectedReview(null);
      await fetchReviews();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'CHANGES_REQUESTED':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Changes Requested
          </Badge>
        );
    }
  };

  const getAssetIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Film className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const renderAssetPreview = (asset: Review['asset']) => {
    if (asset.type.startsWith('image/')) {
      return (
        <img
          src={asset.storageUrl}
          alt={asset.title}
          className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
        />
      );
    }

    if (asset.type.startsWith('video/')) {
      return (
        <video
          src={asset.storageUrl}
          controls
          className="w-full h-auto max-h-[70vh] rounded-lg"
        >
          Your browser does not support video playback.
        </video>
      );
    }

    if (asset.type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <FileText className="w-16 h-16 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">PDF Preview</p>
          <Button asChild variant="outline">
            <a href={asset.storageUrl} target="_blank" rel="noopener noreferrer">
              Open PDF
            </a>
          </Button>
        </div>
      );
    }

    // Text/copy content
    return (
      <div className="p-6 bg-muted/30 rounded-lg">
        <p className="text-sm whitespace-pre-wrap">{asset.title}</p>
        <Button asChild variant="outline" className="mt-4">
          <a href={asset.storageUrl} target="_blank" rel="noopener noreferrer">
            View Full Content
          </a>
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchReviews}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reviews Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve creative assets
          </p>
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="CHANGES_REQUESTED">Changes Requested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
          <p className="text-sm text-muted-foreground">
            {filterStatus === 'PENDING'
              ? 'All caught up! No pending reviews.'
              : `No ${filterStatus.toLowerCase().replace('_', ' ')} reviews.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedReview(review)}
            >
              {/* Asset Icon & Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getAssetIcon(review.asset.type)}
                  <span className="text-xs text-muted-foreground">
                    v{review.asset.version}
                  </span>
                </div>
                {getStatusBadge(review.status)}
              </div>

              {/* Asset Title */}
              <h3 className="font-semibold mb-1 line-clamp-2">{review.asset.title}</h3>

              {/* Project Name */}
              <p className="text-sm text-muted-foreground mb-3">{review.project.name}</p>

              {/* Timestamp */}
              <div className="text-xs text-muted-foreground">
                Requested {new Date(review.requestedAt).toLocaleDateString()}
              </div>

              {/* Comments Preview */}
              {review.comments && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {review.comments}
                  </p>
                </div>
              )}

              {/* Action Buttons for Pending */}
              {review.status === 'PENDING' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReview(review);
                      setShowApproveDialog(true);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReview(review);
                      setShowChangesDialog(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Changes
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!selectedReview && !showApproveDialog && !showChangesDialog} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getAssetIcon(selectedReview.asset.type)}
                  {selectedReview.asset.title}
                  <span className="text-sm font-normal text-muted-foreground">
                    v{selectedReview.asset.version}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {selectedReview.project.name} • Requested{' '}
                  {new Date(selectedReview.requestedAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status Badge */}
                <div>{getStatusBadge(selectedReview.status)}</div>

                {/* Asset Preview */}
                <div className="border rounded-lg overflow-hidden">
                  {renderAssetPreview(selectedReview.asset)}
                </div>

                {/* Comments */}
                {selectedReview.comments && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Comments</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedReview.comments}
                    </p>
                  </div>
                )}

                {/* Decision Timestamp */}
                {selectedReview.decidedAt && (
                  <p className="text-xs text-muted-foreground">
                    Decided on {new Date(selectedReview.decidedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Actions for Pending Reviews */}
              {selectedReview.status === 'PENDING' && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowChangesDialog(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setShowApproveDialog(true);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Review</DialogTitle>
            <DialogDescription>
              This will approve the asset and lock this version.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments (optional)</label>
              <Textarea
                placeholder="Add any approval comments..."
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setActionComments('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? 'Approving...' : 'Approve Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Explain what changes are needed for this asset.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Comments <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Describe the changes needed..."
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                Comments are required when requesting changes
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangesDialog(false);
                setActionComments('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRequestChanges}
              disabled={actionLoading || !actionComments.trim()}
            >
              {actionLoading ? 'Submitting...' : 'Request Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
