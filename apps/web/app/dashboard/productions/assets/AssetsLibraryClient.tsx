'use client';

/**
 * Creative Productions - Assets Library Client
 * Grid/list view with filters, tags, and bulk selection
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ViewMode = 'grid' | 'list';

interface Asset {
  id: string;
  title: string;
  type: string;
  storageUrl: string;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  tags: string[];
  version: number;
  createdByUid: string;
  createdAt: string;
  project?: {
    id: string;
    name: string;
  } | null;
  reviews?: {
    id: string;
    status: string;
  }[];
}

export default function AssetsLibraryClient() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssets();
  }, [filterType]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (filterType !== 'all') {
        params.set('type', filterType);
      }

      const res = await fetch(`/api/productions/assets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch assets');

      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedAssets(new Set(filteredAssets.map(a => a.id)));
  };

  const deselectAll = () => {
    setSelectedAssets(new Set());
  };

  const filteredAssets = assets.filter(asset => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        asset.title.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return '🎬';
      case 'IMAGE':
        return '🖼️';
      case 'AUDIO':
        return '🎵';
      case 'PDF':
        return '📄';
      case 'COPY':
        return '📝';
      case 'AD_PACK':
        return '📦';
      default:
        return '📁';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-10 bg-[#1A2F4B] rounded w-48 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-48 bg-[#1A2F4B] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchAssets}
            className="px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1A2B] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <button
              onClick={() => router.push('/dashboard/productions')}
              className="text-gray-400 hover:text-white mb-2 transition-colors inline-flex items-center gap-2 text-sm"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white">Assets Library</h1>
            <p className="text-gray-400 mt-1">{filteredAssets.length} assets</p>
          </div>
          <button
            className="px-6 py-3 bg-[#2979FF] hover:bg-[#1E5FCC] text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(41,121,255,0.4)] focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
          >
            + Upload Assets
          </button>
        </div>

        {/* Filters & View Toggle */}
        <div className="bg-[#1A2F4B] rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="search"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-[#0E1A2B] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-[#0E1A2B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            >
              <option value="all">All Types</option>
              <option value="VIDEO">Video</option>
              <option value="IMAGE">Image</option>
              <option value="AUDIO">Audio</option>
              <option value="PDF">PDF</option>
              <option value="COPY">Copy</option>
              <option value="AD_PACK">Ad Pack</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#2979FF] text-white'
                    : 'bg-[#0E1A2B] text-gray-400 hover:text-white'
                }`}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#2979FF] text-white'
                    : 'bg-[#0E1A2B] text-gray-400 hover:text-white'
                }`}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedAssets.size > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {selectedAssets.size} selected
              </span>
              <button
                onClick={deselectAll}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Deselect all
              </button>
              <button className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                Delete
              </button>
              <button className="px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white text-sm rounded-lg transition-colors">
                Export Pack
              </button>
            </div>
          )}
        </div>

        {/* Assets Display */}
        {filteredAssets.length === 0 ? (
          <div className="bg-[#1A2F4B] rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-4">
              {searchQuery ? 'No assets found matching your search' : 'No assets uploaded yet'}
            </p>
            {!searchQuery && (
              <button className="text-[#2979FF] hover:text-[#1E5FCC] font-medium">
                Upload your first asset →
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map(asset => (
              <AssetGridCard
                key={asset.id}
                asset={asset}
                selected={selectedAssets.has(asset.id)}
                onSelect={() => toggleSelectAsset(asset.id)}
                getIcon={getAssetIcon}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map(asset => (
              <AssetListItem
                key={asset.id}
                asset={asset}
                selected={selectedAssets.has(asset.id)}
                onSelect={() => toggleSelectAsset(asset.id)}
                getIcon={getAssetIcon}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AssetGridCardProps {
  asset: Asset;
  selected: boolean;
  onSelect: () => void;
  getIcon: (type: string) => string;
  formatFileSize: (bytes?: number | null) => string;
}

function AssetGridCard({ asset, selected, onSelect, getIcon, formatFileSize }: AssetGridCardProps) {
  return (
    <div
      className={`bg-[#1A2F4B] rounded-xl overflow-hidden transition-all hover:scale-105 cursor-pointer ${
        selected ? 'ring-2 ring-[#2979FF]' : ''
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-[#0E1A2B] flex items-center justify-center text-6xl relative">
        {getIcon(asset.type)}
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-[#2979FF] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-white truncate mb-1">{asset.title}</h3>
        <p className="text-xs text-gray-400 mb-2">{asset.type}</p>
        {asset.project && (
          <p className="text-xs text-[#2979FF] truncate mb-2">📁 {asset.project.name}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(asset.size)}</span>
          <span>v{asset.version}</span>
        </div>
        {asset.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {asset.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-xs bg-[#0E1A2B] text-gray-400 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {asset.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{asset.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface AssetListItemProps {
  asset: Asset;
  selected: boolean;
  onSelect: () => void;
  getIcon: (type: string) => string;
  formatFileSize: (bytes?: number | null) => string;
}

function AssetListItem({ asset, selected, onSelect, getIcon, formatFileSize }: AssetListItemProps) {
  return (
    <div
      className={`bg-[#1A2F4B] rounded-lg p-4 flex items-center gap-4 hover:bg-[#234060] transition-colors cursor-pointer ${
        selected ? 'ring-2 ring-[#2979FF]' : ''
      }`}
      onClick={onSelect}
    >
      {/* Icon */}
      <div className="w-16 h-16 bg-[#0E1A2B] rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
        {getIcon(asset.type)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate mb-1">{asset.title}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{asset.type}</span>
          <span>•</span>
          <span>{formatFileSize(asset.size)}</span>
          <span>•</span>
          <span>v{asset.version}</span>
          {asset.project && (
            <>
              <span>•</span>
              <span className="text-[#2979FF]">{asset.project.name}</span>
            </>
          )}
        </div>
        {asset.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {asset.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-[#0E1A2B] text-gray-400 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {selected && (
          <div className="w-6 h-6 bg-[#2979FF] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
