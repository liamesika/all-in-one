'use client';

/**
 * DocumentUploadModal Component
 * Upload documents with drag-and-drop support
 */

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/language-context';
import { BaseModal } from './BaseModal';
import { FormField } from './FormField';
import { UniversalButton } from '@/components/shared';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Upload, File, X } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  caseId?: string; // Pre-fill case if provided
}

export function DocumentUploadModal({ isOpen, onClose, onSuccess, caseId }: DocumentUploadModalProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    caseId: caseId || '',
    documentType: '',
    description: '',
    tags: '',
  });

  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'image/jpeg', 'image/png'];

  useEffect(() => {
    if (isOpen) {
      loadCases();
      setFormData({
        caseId: caseId || '',
        documentType: '',
        description: '',
        tags: '',
      });
      setFile(null);
      setErrors({});
      setUploadProgress(0);
    }
  }, [isOpen, caseId]);

  const loadCases = async () => {
    try {
      const response = await lawApi.cases.list({ limit: 1000 });
      setCases(response.data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return language === 'he' ? 'הקובץ גדול מדי (מקסימום 50MB)' : 'File too large (max 50MB)';
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return language === 'he' ? 'סוג קובץ לא נתמך' : 'File type not supported';
    }

    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setErrors({ file: error });
      return;
    }

    setFile(selectedFile);
    setErrors({});
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!file) {
      newErrors.file = language === 'he' ? 'יש לבחור קובץ' : 'Please select a file';
    }

    if (!formData.description.trim()) {
      newErrors.description = language === 'he' ? 'תיאור נדרש' : 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !file) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const metadata = {
        caseId: formData.caseId || undefined,
        documentType: formData.documentType || undefined,
        description: formData.description,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      };

      // Simulate upload progress (in real implementation, use XMLHttpRequest for progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await lawApi.documents.upload(file, metadata);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(language === 'he' ? 'המסמך הועלה בהצלחה' : 'Document uploaded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      toast.error(error.message || (language === 'he' ? 'שגיאה בהעלאת המסמך' : 'Failed to upload document'));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'he' ? 'העלאת מסמך' : 'Upload Document'}
      description={language === 'he' ? 'העלה קובץ חדש למערכת' : 'Upload a new file to the system'}
      size="lg"
      footer={
        <>
          <UniversalButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </UniversalButton>
          <UniversalButton
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !file}
          >
            {loading
              ? (language === 'he' ? 'מעלה...' : 'Uploading...')
              : (language === 'he' ? 'העלה' : 'Upload')
            }
          </UniversalButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${dragActive
              ? 'border-[#2979FF] bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-[#2979FF]'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            accept=".pdf,.docx,.xlsx,.txt,.jpg,.jpeg,.png"
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <File className="w-8 h-8 text-[#2979FF]" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                {language === 'he' ? 'גרור קובץ לכאן או לחץ לבחירה' : 'Drag file here or click to select'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'he' ? 'PDF, DOCX, XLSX, TXT, JPG, PNG (מקס 50MB)' : 'PDF, DOCX, XLSX, TXT, JPG, PNG (max 50MB)'}
              </p>
            </>
          )}
        </div>

        {errors.file && (
          <p className="text-sm text-red-500 dark:text-red-400">{errors.file}</p>
        )}

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{language === 'he' ? 'מעלה...' : 'Uploading...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#2979FF] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <FormField
          label={language === 'he' ? 'תיאור' : 'Description'}
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          required
          placeholder={language === 'he' ? 'תאר את המסמך' : 'Describe the document'}
        />

        <FormField
          label={language === 'he' ? 'תיק' : 'Case'}
          name="caseId"
          type="select"
          value={formData.caseId}
          onChange={handleChange}
        >
          <option value="">
            {language === 'he' ? 'לא משוייך לתיק' : 'Not linked to case'}
          </option>
          {cases.map((case_) => (
            <option key={case_.id} value={case_.id}>
              {case_.caseNumber} - {case_.title}
            </option>
          ))}
        </FormField>

        <FormField
          label={language === 'he' ? 'סוג מסמך' : 'Document Type'}
          name="documentType"
          value={formData.documentType}
          onChange={handleChange}
          placeholder={language === 'he' ? 'למשל: חוזה, תצהיר, כתב תביעה' : 'e.g., Contract, Affidavit, Complaint'}
        />

        <FormField
          label={language === 'he' ? 'תגיות' : 'Tags'}
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder={language === 'he' ? 'חשוב, חסוי, עדכני (מופרד בפסיקים)' : 'important, confidential, current (comma-separated)'}
        />
      </form>
    </BaseModal>
  );
}
