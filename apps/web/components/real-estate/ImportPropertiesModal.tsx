'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface ImportPropertiesModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

interface ColumnMapping {
  csvColumn: string;
  systemField: string;
}

interface ImportPreview {
  fileName: string;
  totalRows: number;
  headers: string[];
  sampleRows: any[];
}

const SYSTEM_FIELDS = [
  { value: 'name', label: 'Property Name', required: true },
  { value: 'address', label: 'Address', required: false },
  { value: 'city', label: 'City', required: false },
  { value: 'price', label: 'Price', required: false },
  { value: 'rooms', label: 'Rooms', required: false },
  { value: 'size', label: 'Size (sqm)', required: false },
  { value: 'description', label: 'Description', required: false },
  { value: 'amenities', label: 'Amenities', required: false },
  { value: 'status', label: 'Status', required: false },
  { value: 'skip', label: '— Skip Column —', required: false },
];

export function ImportPropertiesModal({ onClose, onImportComplete }: ImportPropertiesModalProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'complete'>('upload');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError(language === 'he' ? 'אנא העלה קובץ CSV בלבד' : 'Please upload a CSV file only');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text, file.name);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string, fileName: string) => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      setError(language === 'he' ? 'הקובץ ריק או לא תקין' : 'File is empty or invalid');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const sampleRows = lines.slice(1, 6).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    const initialMappings = headers.map((header) => ({
      csvColumn: header,
      systemField: autoMapColumn(header),
    }));

    setPreview({
      fileName,
      totalRows: lines.length - 1,
      headers,
      sampleRows,
    });
    setColumnMappings(initialMappings);
    setStep('mapping');
  };

  const autoMapColumn = (header: string): string => {
    const lowerHeader = header.toLowerCase();

    if (lowerHeader.includes('name') || lowerHeader.includes('title')) return 'name';
    if (lowerHeader.includes('address')) return 'address';
    if (lowerHeader.includes('city')) return 'city';
    if (lowerHeader.includes('price')) return 'price';
    if (lowerHeader.includes('room')) return 'rooms';
    if (lowerHeader.includes('size') || lowerHeader.includes('sqm') || lowerHeader.includes('area')) return 'size';
    if (lowerHeader.includes('description') || lowerHeader.includes('desc')) return 'description';
    if (lowerHeader.includes('amenity') || lowerHeader.includes('amenities')) return 'amenities';
    if (lowerHeader.includes('status')) return 'status';

    return 'skip';
  };

  const handleMappingChange = (csvColumn: string, systemField: string) => {
    setColumnMappings((prev) =>
      prev.map((mapping) =>
        mapping.csvColumn === csvColumn ? { ...mapping, systemField } : mapping
      )
    );
  };

  const validateMappings = (): boolean => {
    const hasMandatoryField = columnMappings.some((m) => m.systemField === 'name');
    if (!hasMandatoryField) {
      setError(language === 'he' ? 'חובה למפות עמודת "שם נכס"' : 'Property Name column mapping is required');
      return false;
    }

    const usedFields = columnMappings.map((m) => m.systemField).filter((f) => f !== 'skip');
    const duplicates = usedFields.filter((field, index) => usedFields.indexOf(field) !== index);
    if (duplicates.length > 0) {
      setError(language === 'he' ? 'לא ניתן למפות עמודה לאותו שדה פעמיים' : 'Cannot map multiple columns to the same field');
      return false;
    }

    setError(null);
    return true;
  };

  const handleImport = async () => {
    if (!validateMappings()) return;

    setStep('importing');
    setError(null);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock results
      const successCount = preview?.totalRows ? Math.floor(preview.totalRows * 0.95) : 0;
      const failedCount = preview?.totalRows ? preview.totalRows - successCount : 0;

      setImportResults({ success: successCount, failed: failedCount });
      setStep('complete');

      // Trigger parent refresh after 1 second
      setTimeout(() => {
        onImportComplete();
      }, 1000);
    } catch (err: any) {
      setError(err.message || (language === 'he' ? 'שגיאה בייבוא' : 'Import failed'));
      setStep('mapping');
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,address,city,price,rooms,size,description,amenities,status\n' +
      'Luxury Penthouse,Rothschild 10,Tel Aviv,4500000,5,180,Stunning luxury penthouse with sea views,Parking (2)|Pool|Gym,LISTED\n' +
      'Modern Apartment,Einstein 25,Tel Aviv,2800000,4,120,Renovated apartment in Ramat Aviv,Parking|Elevator|Balcony,LISTED';

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden ${
          language === 'he' ? 'rtl' : 'ltr'
        }`}
      >
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">
              {language === 'he' ? 'ייבוא נכסים' : 'Import Properties'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'he' ? 'העלה קובץ CSV' : 'Upload CSV File'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === 'he'
                      ? 'גרור קובץ לכאן או לחץ לבחירה'
                      : 'Drag and drop or click to select'}
                  </p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {language === 'he' ? 'בחר קובץ' : 'Choose File'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {language === 'he' ? 'הורד תבנית לדוגמה' : 'Download Template'}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {language === 'he' ? 'דרישות:' : 'Requirements:'}
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {language === 'he' ? 'קובץ CSV בלבד' : 'CSV file format only'}</li>
                  <li>• {language === 'he' ? 'שורת כותרות חובה' : 'Header row required'}</li>
                  <li>• {language === 'he' ? 'עמודת "שם נכס" חובה' : 'Property Name column required'}</li>
                  <li>• {language === 'he' ? 'קידוד UTF-8 מומלץ' : 'UTF-8 encoding recommended'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && preview && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {language === 'he' ? 'קובץ:' : 'File:'} {preview.fileName}
                  </span>
                  <span className="text-sm text-gray-600">
                    {preview.totalRows} {language === 'he' ? 'נכסים' : 'properties'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'he' ? 'מיפוי עמודות' : 'Column Mapping'}
                </h3>
                <div className="space-y-3">
                  {columnMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-medium text-gray-900">
                        {mapping.csvColumn}
                      </div>
                      <div className="text-gray-400">→</div>
                      <select
                        value={mapping.systemField}
                        onChange={(e) => handleMappingChange(mapping.csvColumn, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {SYSTEM_FIELDS.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label} {field.required ? '*' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'he' ? 'תצוגה מקדימה' : 'Preview'}
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {preview.headers.slice(0, 5).map((header, index) => (
                          <th key={index} className="px-4 py-2 text-left font-semibold text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sampleRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-gray-200">
                          {preview.headers.slice(0, 5).map((header, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 text-gray-900">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {language === 'he' ? 'חזור' : 'Back'}
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {language === 'he' ? 'ייבא נכסים' : 'Import Properties'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Importing */}
          {step === 'importing' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'he' ? 'מייבא נכסים...' : 'Importing Properties...'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'he' ? 'אנא המתן, זה עשוי לקחת מספר שניות' : 'Please wait, this may take a few moments'}
              </p>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && importResults && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'he' ? 'ייבוא הושלם!' : 'Import Complete!'}
              </h3>
              <div className="flex items-center justify-center gap-8 my-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{importResults.success}</div>
                  <div className="text-sm text-gray-600">
                    {language === 'he' ? 'הצליחו' : 'Successful'}
                  </div>
                </div>
                {importResults.failed > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-sm text-gray-600">
                      {language === 'he' ? 'נכשלו' : 'Failed'}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'he' ? 'סגור' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
