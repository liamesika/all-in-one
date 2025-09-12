'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';

type LeadSource = 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP' | 'CSV_UPLOAD' | 'GOOGLE_SHEETS' | 'MANUAL' | 'OTHER';

type SourceHealth = {
  source: LeadSource;
  lastEventAt?: string;
  isHealthy: boolean;
  lastError?: string;
  lastErrorAt?: string;
  totalLeads: number;
  todayLeads: number;
};

type ImportBatch = {
  id: string;
  filename: string;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  errors?: any[];
};

type CsvPreview = {
  headers: string[];
  rows: any[][];
  totalRows: number;
};

type ColumnMapping = {
  [csvColumn: string]: string; // maps to lead field names
};

const SOURCE_LABELS = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  WHATSAPP: 'WhatsApp',
  CSV_UPLOAD: 'CSV Upload',
  GOOGLE_SHEETS: 'Google Sheets',
  MANUAL: 'Manual',
  OTHER: 'Other',
};

const LEAD_FIELDS = {
  fullName: 'Full Name',
  firstName: 'First Name', 
  lastName: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  city: 'City',
  address: 'Address',
  budget: 'Budget',
  notes: 'Notes',
  utmSource: 'UTM Source',
  utmMedium: 'UTM Medium',
  utmCampaign: 'UTM Campaign',
  utmTerm: 'UTM Term',
  utmContent: 'UTM Content',
};

function IntakeClient({ ownerUid }: { ownerUid: string }) {
  const { language } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'csv' | 'sheets' | 'health' | 'history'>('csv');
  const [sourceHealth, setSourceHealth] = useState<SourceHealth[]>([]);
  const [importHistory, setImportHistory] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // CSV Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'mapping' | 'confirm' | 'processing'>('upload');
  const [importProgress, setImportProgress] = useState(0);

  // Google Sheets state
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [sheetsSync, setSheetsSync] = useState({
    enabled: false,
    lastSync: null as string | null,
    syncInterval: 'hourly' as 'hourly' | 'daily' | 'manual',
  });

  useEffect(() => {
    if (ownerUid) {
      fetchSourceHealth();
      fetchImportHistory();
    }
  }, [ownerUid]);

  const fetchSourceHealth = async () => {
    try {
      const response = await fetch(`/api/leads/source-health?ownerUid=${ownerUid}`);
      if (response.ok) {
        const data = await response.json();
        setSourceHealth(data.sources || []);
      }
    } catch (err) {
      console.error('Failed to fetch source health:', err);
    }
  };

  const fetchImportHistory = async () => {
    try {
      const response = await fetch(`/api/leads/import-history?ownerUid=${ownerUid}`);
      if (response.ok) {
        const data = await response.json();
        setImportHistory(data.batches || []);
      }
    } catch (err) {
      console.error('Failed to fetch import history:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith('.csv')) {
      setError(language === 'he' ? 'אנא בחר קובץ CSV תקין' : 'Please select a valid CSV file');
      return;
    }

    setCsvFile(file);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ownerUid', ownerUid);

      const response = await fetch('/api/leads/csv-preview', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to preview CSV');
      }

      const preview = await response.json();
      setCsvPreview(preview);
      
      // Auto-map common columns
      const autoMapping: ColumnMapping = {};
      preview.headers.forEach((header: string) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') && lowerHeader.includes('full')) {
          autoMapping[header] = 'fullName';
        } else if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
          autoMapping[header] = 'firstName';
        } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
          autoMapping[header] = 'lastName';
        } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
          autoMapping[header] = 'email';
        } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('tel')) {
          autoMapping[header] = 'phone';
        } else if (lowerHeader.includes('city') || lowerHeader.includes('location')) {
          autoMapping[header] = 'city';
        } else if (lowerHeader.includes('budget') || lowerHeader.includes('price')) {
          autoMapping[header] = 'budget';
        }
      });
      setColumnMapping(autoMapping);
      setImportStep('preview');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!csvFile || !csvPreview) return;
    
    setImportStep('processing');
    setImportProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('ownerUid', ownerUid);
      formData.append('columnMapping', JSON.stringify(columnMapping));

      const response = await fetch('/api/leads/csv-import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import CSV');
      }

      const result = await response.json();
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            // Reset form and refresh data
            setTimeout(() => {
              resetCsvImport();
              fetchImportHistory();
              router.push('/e-commerce/leads');
            }, 1000);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import CSV');
      setImportStep('confirm');
    }
  };

  const resetCsvImport = () => {
    setCsvFile(null);
    setCsvPreview(null);
    setColumnMapping({});
    setImportStep('upload');
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return language === 'he' ? 'עכשיו' : 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}${language === 'he' ? ' דקות' : ' minutes ago'}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}${language === 'he' ? ' שעות' : ' hours ago'}`;
    return `${Math.floor(diffInMinutes / 1440)}${language === 'he' ? ' ימים' : ' days ago'}`;
  };

  if (!ownerUid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Authentication Required</h1>
          <p className="text-gray-600 mt-2">Please log in to access lead intake</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/e-commerce/leads')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← {language === 'he' ? 'חזרה ללידים' : 'Back to Leads'}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'he' ? 'ייבוא לידים' : 'Lead Intake'}
              </h1>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'csv', label: language === 'he' ? 'ייבוא CSV' : 'CSV Import' },
              { id: 'sheets', label: language === 'he' ? 'Google Sheets' : 'Google Sheets' },
              { id: 'health', label: language === 'he' ? 'בריאות מקורות' : 'Source Health' },
              { id: 'history', label: language === 'he' ? 'היסטוריה' : 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              {language === 'he' ? 'סגור' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* CSV Import Tab */}
        {activeTab === 'csv' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {language === 'he' ? 'ייבוא קובץ CSV' : 'CSV File Import'}
              </h2>

              {importStep === 'upload' && (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            {language === 'he' ? 'בחר קובץ CSV או גרור לכאן' : 'Choose CSV file or drag here'}
                          </span>
                          <input
                            ref={fileInputRef}
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          {language === 'he' ? 'קבצי CSV בלבד. עד 10MB' : 'CSV files only. Up to 10MB'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {importStep === 'preview' && csvPreview && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      {language === 'he' ? 'תצוגה מקדימה' : 'Preview'}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {csvPreview.totalRows} {language === 'he' ? 'שורות' : 'rows'}
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {csvPreview.headers.map((header, index) => (
                            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvPreview.rows.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setImportStep('mapping')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {language === 'he' ? 'מפה עמודות' : 'Map Columns'}
                    </button>
                    <button
                      onClick={resetCsvImport}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      {language === 'he' ? 'ביטול' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}

              {importStep === 'mapping' && csvPreview && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {language === 'he' ? 'מיפוי עמודות' : 'Column Mapping'}
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {csvPreview.headers.map((csvColumn) => (
                      <div key={csvColumn} className="flex items-center space-x-4">
                        <div className="w-1/3">
                          <label className="block text-sm font-medium text-gray-700">
                            CSV: <span className="font-normal">{csvColumn}</span>
                          </label>
                        </div>
                        <div className="w-1/3">
                          <select
                            value={columnMapping[csvColumn] || ''}
                            onChange={(e) => {
                              const newMapping = { ...columnMapping };
                              if (e.target.value) {
                                newMapping[csvColumn] = e.target.value;
                              } else {
                                delete newMapping[csvColumn];
                              }
                              setColumnMapping(newMapping);
                            }}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">{language === 'he' ? 'לא ממופה' : 'Not mapped'}</option>
                            {Object.entries(LEAD_FIELDS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-1/3 text-sm text-gray-500">
                          {csvPreview.rows[0]?.[csvPreview.headers.indexOf(csvColumn)] || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setImportStep('confirm')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {language === 'he' ? 'המשך לאישור' : 'Continue to Confirm'}
                    </button>
                    <button
                      onClick={() => setImportStep('preview')}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      {language === 'he' ? 'חזור' : 'Back'}
                    </button>
                  </div>
                </div>
              )}

              {importStep === 'confirm' && csvPreview && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {language === 'he' ? 'אישור ייבוא' : 'Confirm Import'}
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">{language === 'he' ? 'קובץ:' : 'File:'}</span> {csvFile?.name}
                      </div>
                      <div>
                        <span className="font-medium">{language === 'he' ? 'שורות:' : 'Rows:'}</span> {csvPreview.totalRows}
                      </div>
                      <div>
                        <span className="font-medium">{language === 'he' ? 'עמודות ממופות:' : 'Mapped columns:'}</span> {Object.keys(columnMapping).filter(k => columnMapping[k]).length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleImportConfirm}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? 
                        (language === 'he' ? 'מייבא...' : 'Importing...') :
                        (language === 'he' ? 'אישור ייבוא' : 'Confirm Import')
                      }
                    </button>
                    <button
                      onClick={() => setImportStep('mapping')}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      {language === 'he' ? 'חזור' : 'Back'}
                    </button>
                  </div>
                </div>
              )}

              {importStep === 'processing' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {language === 'he' ? 'מייבא נתונים...' : 'Importing Data...'}
                  </h3>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center">
                    {importProgress}% {language === 'he' ? 'הושלם' : 'completed'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Sheets Tab */}
        {activeTab === 'sheets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {language === 'he' ? 'Google Sheets סנכרון' : 'Google Sheets Sync'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'he' ? 'כתובת URL של הגיליון' : 'Sheet URL'}
                  </label>
                  <input
                    type="url"
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'he' ? 'תדירות סנכרון' : 'Sync Frequency'}
                  </label>
                  <select
                    value={sheetsSync.syncInterval}
                    onChange={(e) => setSheetsSync({
                      ...sheetsSync,
                      syncInterval: e.target.value as any,
                    })}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="manual">{language === 'he' ? 'ידני' : 'Manual'}</option>
                    <option value="hourly">{language === 'he' ? 'כל שעה' : 'Hourly'}</option>
                    <option value="daily">{language === 'he' ? 'יומי' : 'Daily'}</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="sheets-enabled"
                    type="checkbox"
                    checked={sheetsSync.enabled}
                    onChange={(e) => setSheetsSync({
                      ...sheetsSync,
                      enabled: e.target.checked,
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sheets-enabled" className="ml-2 block text-sm text-gray-900">
                    {language === 'he' ? 'אפשר סנכרון אוטומטי' : 'Enable automatic sync'}
                  </label>
                </div>
                
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {language === 'he' ? 'בדוק חיבור' : 'Test Connection'}
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    {language === 'he' ? 'סנכרון עכשיו' : 'Sync Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sourceHealth.map((source) => (
                <div key={source.source} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {SOURCE_LABELS[source.source]}
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${
                      source.isHealthy ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'he' ? 'סה"כ לידים:' : 'Total leads:'}</span>
                      <span className="font-medium">{source.totalLeads}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'he' ? 'היום:' : 'Today:'}</span>
                      <span className="font-medium">{source.todayLeads}</span>
                    </div>
                    
                    {source.lastEventAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{language === 'he' ? 'אירוע אחרון:' : 'Last event:'}</span>
                        <span className="font-medium">{formatRelativeTime(source.lastEventAt)}</span>
                      </div>
                    )}
                    
                    {source.lastError && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md">
                        <p className="text-sm text-red-800">{source.lastError}</p>
                        {source.lastErrorAt && (
                          <p className="text-xs text-red-600 mt-1">
                            {formatDate(source.lastErrorAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {language === 'he' ? 'היסטוריית ייבוא' : 'Import History'}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'קובץ' : 'File'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'סטטוס' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'שורות' : 'Rows'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'הצלחה' : 'Success'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'שגיאות' : 'Errors'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'תאריך' : 'Date'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importHistory.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.filename}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            batch.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            batch.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            batch.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {batch.status === 'COMPLETED' && (language === 'he' ? 'הושלם' : 'Completed')}
                            {batch.status === 'FAILED' && (language === 'he' ? 'נכשל' : 'Failed')}
                            {batch.status === 'PROCESSING' && (language === 'he' ? 'מעבד' : 'Processing')}
                            {batch.status === 'PENDING' && (language === 'he' ? 'ממתין' : 'Pending')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.totalRows}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {batch.successCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {batch.errorCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(batch.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {importHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'he' ? 'אין היסטוריית ייבוא' : 'No import history'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntakePage({ ownerUid }: { ownerUid: string }) {
  return (
    <LanguageProvider>
      <IntakeClient ownerUid={ownerUid} />
    </LanguageProvider>
  );
}