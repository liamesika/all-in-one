'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { auth } from '@/lib/firebase';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (imported: number) => void;
}

interface ParsedLead {
  fullName: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
}

export function ImportLeadsModal({ isOpen, onClose, onSuccess }: ImportLeadsModalProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedLead[]>([]);
  const [importResults, setImportResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const t = {
    title: language === 'he' ? 'ייבוא לידים' : 'Import Leads',
    uploadTitle: language === 'he' ? 'העלה קובץ CSV' : 'Upload CSV File',
    dragDrop: language === 'he' ? 'גרור קובץ CSV לכאן' : 'Drag and drop CSV file here',
    or: language === 'he' ? 'או' : 'or',
    browse: language === 'he' ? 'בחר קובץ' : 'Choose file',
    csvFormat: language === 'he' ? 'פורמט CSV' : 'CSV Format',
    exampleHeader: language === 'he' ? 'שורת כותרת לדוגמה' : 'Example header row',
    requiredFields: language === 'he' ? 'שדות חובה' : 'Required fields',
    optionalFields: language === 'he' ? 'שדות אופציונליים' : 'Optional fields',
    preview: language === 'he' ? 'תצוגה מקדימה' : 'Preview',
    import: language === 'he' ? 'ייבא' : 'Import',
    importing: language === 'he' ? 'מייבא...' : 'Importing...',
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
    close: language === 'he' ? 'סגור' : 'Close',
    results: language === 'he' ? 'תוצאות ייבוא' : 'Import Results',
    imported: language === 'he' ? 'יובאו בהצלחה' : 'Successfully imported',
    duplicates: language === 'he' ? 'כפילויות (דולגו)' : 'Duplicates (skipped)',
    errors: language === 'he' ? 'שגיאות' : 'Errors',
    leads: language === 'he' ? 'לידים' : 'leads',
    invalidFile: language === 'he' ? 'קובץ לא תקין' : 'Invalid file',
    uploadError: language === 'he' ? 'שגיאה בהעלאת הקובץ' : 'Error uploading file',
    authError: language === 'he' ? 'נדרשת אימות. אנא התחבר מחדש.' : 'Authentication required. Please sign in again.',
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError(t.invalidFile);
      return;
    }

    setFile(selectedFile);
    setError(null);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length < 2) {
          setError('CSV file must have at least a header row and one data row');
          return;
        }

        // Parse header
        const header = lines[0].split(',').map((h) => h.trim().toLowerCase());

        // Find column indices - support both 'name' and 'fullname'
        const nameIdx = header.findIndex((h) => h.includes('name'));
        const phoneIdx = header.findIndex((h) => h.includes('phone'));
        const emailIdx = header.findIndex((h) => h.includes('email'));
        const sourceIdx = header.findIndex((h) => h.includes('source'));
        const notesIdx = header.findIndex((h) => h.includes('notes'));
        const createdIdx = header.findIndex((h) => h.includes('created'));

        if (nameIdx === -1 || phoneIdx === -1) {
          setError('CSV must contain "name" or "fullName" and "phone" columns');
          return;
        }

        // Parse data rows
        const leads: ParsedLead[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

          if (values.length < 2) continue; // Skip incomplete rows

          const lead: ParsedLead = {
            fullName: values[nameIdx] || '',
            phone: values[phoneIdx] || '',
          };

          if (emailIdx !== -1 && values[emailIdx]) lead.email = values[emailIdx];
          if (sourceIdx !== -1 && values[sourceIdx]) lead.source = values[sourceIdx];
          if (notesIdx !== -1 && values[notesIdx]) lead.notes = values[notesIdx];
          if (createdIdx !== -1 && values[createdIdx]) lead.createdAt = values[createdIdx];

          leads.push(lead);
        }

        setParsedData(leads);
        setStep('preview');
      } catch (err: any) {
        console.error('CSV parse error:', err);
        setError(t.uploadError);
      }
    };

    reader.readAsText(file, 'utf-8');
  };

  const handleImport = async () => {
    setStep('importing');

    try {
      const user = auth.currentUser;
      if (!user) {
        setError(t.authError);
        setStep('preview');
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch('/api/real-estate/leads/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rows: parsedData,
          importType: 'csv',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResults(result);
      setStep('results');

      if (result.imported > 0) {
        onSuccess(result.imported);
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || t.uploadError);
      setStep('preview');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && step !== 'importing') {
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setImportResults(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-leads-title"
      onKeyDown={handleKeyDown}
    >
      <div className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="import-leads-title" className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <button
            onClick={handleClose}
            disabled={step === 'importing'}
            className="p-2 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t.close}
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">{t.dragDrop}</p>
                <p className="text-sm text-gray-500 mb-4">{t.or}</p>
                <button className="px-6 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  {t.browse}
                </button>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>

              {/* CSV Format Guide */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t.csvFormat}
                </h3>

                <div className="bg-white rounded border border-gray-200 p-3 mb-4 font-mono text-sm overflow-x-auto">
                  <div className="whitespace-nowrap text-gray-600">
                    name,phone,email,source,notes,createdAt
                  </div>
                  <div className="whitespace-nowrap text-gray-900">
                    Sarah Levi,0587878676,sarah@example.com,Facebook,Called back,2025-10-10T09:10:00Z
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">{t.requiredFields}:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• name</li>
                      <li>• phone</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">{t.optionalFields}:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• email</li>
                      <li>• source</li>
                      <li>• notes</li>
                      <li>• createdAt</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900">
                  {language === 'he' ? `נמצאו ${parsedData.length} לידים` : `Found ${parsedData.length} leads`}
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedData.slice(0, 10).map((lead, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{lead.fullName}</td>
                          <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                          <td className="px-4 py-3 text-gray-600">{lead.email || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{lead.source || 'Import'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 10 && (
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
                    {language === 'he'
                      ? `+ ${parsedData.length - 10} לידים נוספים`
                      : `+ ${parsedData.length - 10} more leads`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-900">{t.importing}</p>
              <p className="text-sm text-gray-600 mt-2">
                {language === 'he' ? 'אנא המתן...' : 'Please wait...'}
              </p>
            </div>
          )}

          {/* Results Step */}
          {step === 'results' && importResults && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">{t.results}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">{t.imported}:</span>
                      <span className="font-semibold text-green-900">
                        {importResults.imported} {t.leads}
                      </span>
                    </div>
                    {importResults.duplicates > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-700">{t.duplicates}:</span>
                        <span className="font-semibold text-green-900">{importResults.duplicates}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-900 mb-2">
                    {t.errors} ({importResults.errors.length}):
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-sm text-yellow-800">
                    {importResults.errors.slice(0, 5).map((err: any, idx: number) => (
                      <div key={idx}>
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                    {importResults.errors.length > 5 && (
                      <div className="text-yellow-700">
                        + {importResults.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={step === 'importing'}
            className="px-6 py-2.5 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {step === 'results' ? t.close : t.cancel}
          </button>
          {step === 'preview' && (
            <button
              onClick={handleImport}
              className="px-8 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t.import}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
