'use client';

import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useLanguage } from '@/lib/language-context';
import { Pagination } from '@/components/ui/pagination';
import { LazyImage, LoadingSpinner } from './lazy-loading';

interface Property {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  rooms?: number | null;
  size?: number | null;
  price?: number | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  slug?: string | null;
  agentName?: string | null;
  agentPhone?: string | null;
  provider?: "MANUAL" | "YAD2" | "MADLAN" | null;
  externalUrl?: string | null;
  photos?: { url: string }[];
  createdAt?: string;
  updatedAt?: string;
}

interface PropertiesTableProps {
  properties: Property[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPropertyClick?: (property: Property) => void;
  onPropertyEdit?: (property: Property) => void;
  onPropertySync?: (property: Property) => void;
  onPropertyExport?: (property: Property) => void;
  onPropertyShare?: (property: Property) => void;
  virtualScrolling?: boolean;
  itemHeight?: number;
  maxHeight?: number;
}

// Memoized property row component
const PropertyRow = memo(function PropertyRow({
  property,
  style,
  index,
  onPropertyClick,
  onPropertyEdit,
  onPropertySync,
  onPropertyExport,
  onPropertyShare,
}: {
  property: Property;
  style?: React.CSSProperties;
  index: number;
  onPropertyClick?: (property: Property) => void;
  onPropertyEdit?: (property: Property) => void;
  onPropertySync?: (property: Property) => void;
  onPropertyExport?: (property: Property) => void;
  onPropertyShare?: (property: Property) => void;
}) {
  const { language } = useLanguage();

  const handleClick = useCallback(() => {
    onPropertyClick?.(property);
  }, [onPropertyClick, property]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPropertyEdit?.(property);
  }, [onPropertyEdit, property]);

  const handleSync = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPropertySync?.(property);
  }, [onPropertySync, property]);

  const handleExport = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPropertyExport?.(property);
  }, [onPropertyExport, property]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPropertyShare?.(property);
  }, [onPropertyShare, property]);

  const statusBadge = useMemo(() => {
    const statusColors = {
      PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
      DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const statusText = {
      PUBLISHED: language === 'he' ? 'פורסם' : 'Published',
      DRAFT: language === 'he' ? 'טיוטה' : 'Draft',
      ARCHIVED: language === 'he' ? 'ארכיון' : 'Archived'
    };

    const status = property.status || 'DRAFT';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}>
        {statusText[status]}
      </span>
    );
  }, [property.status, language]);

  const providerBadge = useMemo(() => {
    if (!property.provider || property.provider === 'MANUAL') return null;
    
    const colors = {
      YAD2: 'bg-orange-100 text-orange-800 border-orange-200',
      MADLAN: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[property.provider]}`}>
        {property.provider}
      </span>
    );
  }, [property.provider]);

  const primaryImage = property.photos?.[0]?.url;

  return (
    <tr
      className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
      }`}
      style={style}
      onClick={handleClick}
    >
      {/* Property Info */}
      <td className="p-4">
        <div className="flex items-center space-x-3">
          {primaryImage && (
            <LazyImage
              src={primaryImage}
              alt={property.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {property.name}
              </h3>
              {providerBadge}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {property.address || (language === 'he' ? 'אין כתובת' : 'No address')}
            </p>
            {property.externalUrl && (
              <a
                href={property.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {language === 'he' ? 'לינק מקורי' : 'Original link'} →
              </a>
            )}
          </div>
        </div>
      </td>

      {/* Location */}
      <td className="p-4">
        <div className="text-sm text-gray-900">{property.city || '-'}</div>
        {property.agentPhone && (
          <div className="text-xs text-gray-500 font-mono">{property.agentPhone}</div>
        )}
      </td>

      {/* Details */}
      <td className="p-4">
        <div className="flex flex-col gap-1">
          {property.rooms && (
            <span className="text-sm text-gray-600">
              {property.rooms} {language === 'he' ? 'חדרים' : 'rooms'}
            </span>
          )}
          {property.size && (
            <span className="text-sm text-gray-600">
              {property.size}{language === 'he' ? 'מ"ר' : 'm²'}
            </span>
          )}
        </div>
      </td>

      {/* Price */}
      <td className="p-4">
        {property.price ? (
          <div className="text-sm font-semibold text-blue-600">
            ₪{property.price.toLocaleString()}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>

      {/* Status */}
      <td className="p-4">
        {statusBadge}
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={handleEdit}
            className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title={language === 'he' ? 'ערוך' : 'Edit'}
          >
            {language === 'he' ? 'ערוך' : 'Edit'}
          </button>
          
          {property.externalUrl && (
            <button
              onClick={handleSync}
              className="px-2 py-1 text-xs rounded bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
              title={language === 'he' ? 'סנכרן' : 'Sync'}
            >
              🔄
            </button>
          )}
          
          <button
            onClick={handleExport}
            className="px-2 py-1 text-xs rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            title={language === 'he' ? 'ייצא HTML' : 'Export HTML'}
          >
            📄
          </button>
          
          <button
            onClick={handleShare}
            className="px-2 py-1 text-xs rounded bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            title={language === 'he' ? 'שתף' : 'Share'}
          >
            📤
          </button>
        </div>
      </td>
    </tr>
  );
});

// Virtual list row renderer
const VirtualRow = memo(function VirtualRow({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: any 
}) {
  const { properties, ...handlers } = data;
  const property = properties[index];

  if (!property) return null;

  return (
    <div style={style}>
      <PropertyRow
        property={property}
        index={index}
        {...handlers}
      />
    </div>
  );
});

// Main optimized table component
export const OptimizedPropertiesTable = memo(function OptimizedPropertiesTable({
  properties,
  total,
  currentPage,
  totalPages,
  loading = false,
  onPageChange,
  onPropertyClick,
  onPropertyEdit,
  onPropertySync,
  onPropertyExport,
  onPropertyShare,
  virtualScrolling = true,
  itemHeight = 80,
  maxHeight = 600,
}: PropertiesTableProps) {
  const { language } = useLanguage();

  const tableHeaders = useMemo(() => [
    language === 'he' ? 'נכס' : 'Property',
    language === 'he' ? 'מיקום' : 'Location',
    language === 'he' ? 'פרטים' : 'Details',
    language === 'he' ? 'מחיר' : 'Price',
    language === 'he' ? 'סטטוס' : 'Status',
    language === 'he' ? 'פעולות' : 'Actions'
  ], [language]);

  const virtualListData = useMemo(() => ({
    properties,
    onPropertyClick,
    onPropertyEdit,
    onPropertySync,
    onPropertyExport,
    onPropertyShare,
  }), [properties, onPropertyClick, onPropertyEdit, onPropertySync, onPropertyExport, onPropertyShare]);

  if (loading && properties.length === 0) {
    return (
      <div className="rounded-2xl border bg-white shadow-xl overflow-hidden">
        <div className="p-8">
          <LoadingSpinner 
            message={language === 'he' ? 'טוען נכסים...' : 'Loading properties...'} 
            size="large" 
          />
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border bg-white shadow-xl overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'he' ? 'אין נכסים' : 'No properties found'}
          </h3>
          <p className="text-gray-600">
            {language === 'he' ? 'התחל על ידי הוספת נכס חדש' : 'Start by adding a new property'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <span>
            {language === 'he' ? 'רשימת נכסים' : 'Properties List'} 
            ({total} {language === 'he' ? 'נכסים' : 'properties'})
          </span>
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              <span>{language === 'he' ? 'מעדכן...' : 'Updating...'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          {virtualScrolling && properties.length > 10 ? (
            <tbody>
              <tr>
                <td colSpan={6} className="p-0">
                  <List
                    height={Math.min(maxHeight, properties.length * itemHeight)}
                    itemCount={properties.length}
                    itemSize={itemHeight}
                    itemData={virtualListData}
                  >
                    {VirtualRow}
                  </List>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {properties.map((property, index) => (
                <PropertyRow
                  key={property.id}
                  property={property}
                  index={index}
                  onPropertyClick={onPropertyClick}
                  onPropertyEdit={onPropertyEdit}
                  onPropertySync={onPropertySync}
                  onPropertyExport={onPropertyExport}
                  onPropertyShare={onPropertyShare}
                />
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
});