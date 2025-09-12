"use client";

import { useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

type ImportType = 'single-url' | 'bulk-urls' | 'csv';

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  duplicates: number;
  errors: number;
  details: ImportDetail[];
}

interface ImportDetail {
  url?: string;
  externalId?: string;
  status: 'imported' | 'updated' | 'duplicate' | 'error';
  message?: string;
  propertyId?: string;
  property?: any;
}

interface ImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

// EFFINITY Brand Colors
const brand = { 
  primary: "#1e3a8a", 
  hover: "#1d4ed8",
  light: "#3b82f6",
  gradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
};

export function PropertyImport({ isOpen, onClose, onImportComplete }: ImportProps) {
  const { t, language } = useLanguage();
  const [importType, setImportType] = useState<ImportType>('single-url');
  const [isImporting, setIsImporting] = useState(false);
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [updateExisting, setUpdateExisting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'import' | 'results'>('import');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(async () => {
    setIsImporting(true);
    setError(null);
    setResult(null);

    try {
      let response: ImportResult;

      if (importType === 'single-url') {
        if (!singleUrl.trim()) {
          throw new Error(language === 'he' ? 'נדרש לינק' : 'URL is required');
        }
        response = await apiFetch('/real-estate/properties/import/single-url', {
          method: 'POST',
          body: JSON.stringify({ url: singleUrl.trim() })
        });
      } else if (importType === 'bulk-urls') {
        const urls = bulkUrls.split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0);
        
        if (urls.length === 0) {
          throw new Error(language === 'he' ? 'נדרש לפחות לינק אחד' : 'At least one URL is required');
        }

        response = await apiFetch('/real-estate/properties/import/bulk-urls', {
          method: 'POST',
          body: JSON.stringify({ urls, updateExisting })
        });
      } else if (importType === 'csv') {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
          throw new Error(language === 'he' ? 'נדרש קובץ CSV' : 'CSV file is required');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('updateExisting', updateExisting.toString());

        response = await apiFetch('/real-estate/properties/import/csv', {
          method: 'POST',
          body: formData
        });
      } else {
        throw new Error(language === 'he' ? 'סוג יבוא לא חוקי' : 'Invalid import type');
      }

      setResult(response);
      setCurrentTab('results');
      
      // Call onImportComplete to refresh the properties list
      onImportComplete();

    } catch (err: any) {
      setError(err.message || (language === 'he' ? 'שגיאה בייבוא' : 'Import failed'));
    } finally {
      setIsImporting(false);
    }
  }, [importType, singleUrl, bulkUrls, updateExisting, language, onImportComplete]);

  const handleClose = useCallback(() => {
    setSingleUrl('');
    setBulkUrls('');
    setUpdateExisting(false);
    setResult(null);
    setError(null);
    setCurrentTab('import');
    onClose();
  }, [onClose]);

  const inputClass = "w-full border rounded-xl px-3 py-2 outline-none focus:ring focus:ring-gray-200 placeholder:text-gray-400";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={!isImporting ? handleClose : undefined} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold" style={{ color: brand.primary }}>
              {language === 'he' ? 'ייבוא נכסים מיד2 ומדלן' : 'Import from Yad2 & Madlan'}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={!isImporting ? handleClose : undefined}
              disabled={isImporting}
              aria-label={language === 'he' ? 'סגירה' : 'Close'}
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setCurrentTab('import')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  currentTab === 'import'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {language === 'he' ? 'ייבוא' : 'Import'}
              </button>
              {result && (
                <button
                  onClick={() => setCurrentTab('results')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    currentTab === 'results'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {language === 'he' ? 'תוצאות' : 'Results'}
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {currentTab === 'import' && (
              <div className="space-y-6">
                {/* Import Type Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    {language === 'he' ? 'סוג ייבוא' : 'Import Type'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setImportType('single-url')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        importType === 'single-url'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {language === 'he' ? 'לינק בודד' : 'Single URL'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {language === 'he' ? 'ייבוא נכס אחד מלינק' : 'Import one property from URL'}
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setImportType('bulk-urls')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        importType === 'bulk-urls'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {language === 'he' ? 'מספר לינקים' : 'Multiple URLs'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {language === 'he' ? 'ייבוא מספר נכסים מלינקים' : 'Import multiple properties from URLs'}
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setImportType('csv')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        importType === 'csv'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {language === 'he' ? 'קובץ CSV' : 'CSV File'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {language === 'he' ? 'ייבוא מקובץ CSV' : 'Import from CSV file'}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Import Form */}
                {importType === 'single-url' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {language === 'he' ? 'לינק יד2 או מדלן' : 'Yad2 or Madlan URL'}
                    </label>
                    <input
                      type="url"
                      value={singleUrl}
                      onChange={(e) => setSingleUrl(e.target.value)}
                      placeholder={language === 'he' ? 'הדבק את הלינק כאן...' : 'Paste the URL here...'}
                      className={inputClass}
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'he' 
                        ? 'תומך בלינקים מיד2.co.il ו madlan.co.il'
                        : 'Supports links from yad2.co.il and madlan.co.il'
                      }
                    </p>
                  </div>
                )}

                {importType === 'bulk-urls' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {language === 'he' ? 'לינקים (אחד בכל שורה)' : 'URLs (one per line)'}
                    </label>
                    <textarea
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                      placeholder={language === 'he' 
                        ? 'הדבק לינקים כאן, אחד בכל שורה...\nhttps://yad2.co.il/item/123\nhttps://madlan.co.il/property/456'
                        : 'Paste URLs here, one per line...\nhttps://yad2.co.il/item/123\nhttps://madlan.co.il/property/456'
                      }
                      rows={6}
                      className={inputClass}
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>
                )}

                {importType === 'csv' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {language === 'he' ? 'קובץ CSV' : 'CSV File'}
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className={inputClass}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'he' 
                        ? 'הקובץ צריך לכלול עמודות: name, address, city, price, rooms, size'
                        : 'File should include columns: name, address, city, price, rooms, size'
                      }
                    </p>
                  </div>
                )}

                {/* Options */}
                {(importType === 'bulk-urls' || importType === 'csv') && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="updateExisting"
                      checked={updateExisting}
                      onChange={(e) => setUpdateExisting(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="updateExisting" className="ml-2 text-sm text-gray-700">
                      {language === 'he' ? 'עדכן נכסים קיימים' : 'Update existing properties'}
                    </label>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-red-800 font-medium">
                      {language === 'he' ? 'שגיאה' : 'Error'}
                    </div>
                    <div className="text-red-700 text-sm mt-1">{error}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isImporting}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    {language === 'he' ? 'ביטול' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-60 transition-all flex items-center gap-2"
                    style={{ backgroundColor: brand.primary }}
                  >
                    {isImporting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isImporting 
                      ? (language === 'he' ? 'מייבא...' : 'Importing...') 
                      : (language === 'he' ? 'התחל ייבוא' : 'Start Import')
                    }
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'results' && result && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-2xl font-bold text-green-800">{result.imported}</div>
                    <div className="text-sm text-green-600">
                      {language === 'he' ? 'יובאו' : 'Imported'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-800">{result.updated}</div>
                    <div className="text-sm text-blue-600">
                      {language === 'he' ? 'עודכנו' : 'Updated'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-800">{result.duplicates}</div>
                    <div className="text-sm text-yellow-600">
                      {language === 'he' ? 'כפולים' : 'Duplicates'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-2xl font-bold text-red-800">{result.errors}</div>
                    <div className="text-sm text-red-600">
                      {language === 'he' ? 'שגיאות' : 'Errors'}
                    </div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {language === 'he' ? 'פירוט תוצאות' : 'Detailed Results'}
                  </h3>
                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    {result.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`p-4 border-b last:border-b-0 ${
                          detail.status === 'imported' ? 'bg-green-50' :
                          detail.status === 'updated' ? 'bg-blue-50' :
                          detail.status === 'duplicate' ? 'bg-yellow-50' :
                          'bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {detail.url && (
                              <div className="text-sm text-gray-600 truncate">
                                {detail.url}
                              </div>
                            )}
                            <div className="font-medium">
                              {detail.property?.name || detail.externalId || `Item ${index + 1}`}
                            </div>
                            {detail.message && (
                              <div className="text-sm text-gray-600 mt-1">
                                {detail.message}
                              </div>
                            )}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            detail.status === 'imported' ? 'bg-green-100 text-green-800' :
                            detail.status === 'updated' ? 'bg-blue-100 text-blue-800' :
                            detail.status === 'duplicate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {detail.status === 'imported' ? (language === 'he' ? 'יובא' : 'Imported') :
                             detail.status === 'updated' ? (language === 'he' ? 'עודכן' : 'Updated') :
                             detail.status === 'duplicate' ? (language === 'he' ? 'כפול' : 'Duplicate') :
                             (language === 'he' ? 'שגיאה' : 'Error')
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 rounded-lg text-white font-semibold transition-all"
                    style={{ backgroundColor: brand.primary }}
                  >
                    {language === 'he' ? 'סגור' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}