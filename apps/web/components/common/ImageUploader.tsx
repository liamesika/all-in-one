'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface ImageUploaderProps {
  maxImages?: number;
  maxSizeMB?: number;
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
  url?: string;
}

export function ImageUploader({
  maxImages = 10,
  maxSizeMB = 5,
  value = [],
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const { language } = useLanguage();
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    dragDrop: language === 'he' ? 'גרור ושחרר תמונות כאן' : 'Drag & drop images here',
    or: language === 'he' ? 'או' : 'or',
    browse: language === 'he' ? 'עיין במחשב' : 'Browse files',
    maxImages: language === 'he' ? `עד ${maxImages} תמונות` : `Up to ${maxImages} images`,
    maxSize: language === 'he' ? `גודל מקסימלי ${maxSizeMB}MB` : `Max ${maxSizeMB}MB each`,
    uploading: language === 'he' ? 'מעלה...' : 'Uploading...',
    remove: language === 'he' ? 'הסר' : 'Remove',
    errorSize: language === 'he' ? `הקובץ גדול מדי (מקסימום ${maxSizeMB}MB)` : `File too large (max ${maxSizeMB}MB)`,
    errorType: language === 'he' ? 'סוג קובץ לא נתמך' : 'Unsupported file type',
    errorUpload: language === 'he' ? 'שגיאה בהעלאה' : 'Upload failed',
    errorMax: language === 'he' ? `ניתן להעלות עד ${maxImages} תמונות` : `Maximum ${maxImages} images allowed`,
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return t.errorType;
    }

    // Check file size
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      return t.errorSize;
    }

    return null;
  };

  const uploadFile = async (uploadingImage: UploadingImage) => {
    try {
      // Step 1: Get signed upload URL
      const signedUrlResponse = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-uid': 'demo-user', // TODO: Get from auth
        },
        body: JSON.stringify({
          fileName: uploadingImage.file.name,
          fileType: uploadingImage.file.type,
        }),
      });

      if (!signedUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await signedUrlResponse.json();

      // Step 2: Upload file to signed URL with progress tracking
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadingImages((prev) =>
              prev.map((img) =>
                img.id === uploadingImage.id ? { ...img, progress } : img
              )
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 204) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', uploadingImage.file.type);
        xhr.send(uploadingImage.file);
      });

      // Step 3: Update state with successful upload
      setUploadingImages((prev) =>
        prev.map((img) =>
          img.id === uploadingImage.id
            ? { ...img, progress: 100, url: publicUrl }
            : img
        )
      );

      // Add to uploaded images
      onChange([...value, publicUrl]);

      // Remove from uploading list after short delay
      setTimeout(() => {
        setUploadingImages((prev) => prev.filter((img) => img.id !== uploadingImage.id));
      }, 1000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadingImages((prev) =>
        prev.map((img) =>
          img.id === uploadingImage.id
            ? { ...img, error: error.message || t.errorUpload }
            : img
        )
      );
    }
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const filesArray = Array.from(files);
      const totalImages = value.length + uploadingImages.length + filesArray.length;

      if (totalImages > maxImages) {
        alert(t.errorMax);
        return;
      }

      const newUploading: UploadingImage[] = [];

      filesArray.forEach((file) => {
        const error = validateFile(file);
        const id = `${Date.now()}-${Math.random()}`;
        const preview = URL.createObjectURL(file);

        const uploadingImage: UploadingImage = {
          id,
          file,
          preview,
          progress: 0,
          error: error || undefined,
        };

        newUploading.push(uploadingImage);

        if (!error) {
          uploadFile(uploadingImage);
        }
      });

      setUploadingImages((prev) => [...prev, ...newUploading]);
    },
    [value, uploadingImages, disabled, maxImages]
  );

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
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFiles(e.target.files);
  };

  const handleRemoveUploaded = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  const handleRemoveUploading = (id: string) => {
    setUploadingImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.preview) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Upload Area */}
      {value.length + uploadingImages.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">{t.dragDrop}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t.or}{' '}
                <span className="text-blue-600 font-medium">{t.browse}</span>
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <span className="block">{t.maxImages}</span>
              <span className="block mt-1">{t.maxSize}</span>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
            >
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveUploaded(url)}
                disabled={disabled}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                title={t.remove}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploading Images */}
      {uploadingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadingImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={img.preview}
                alt="Uploading"
                className={`w-full h-full object-cover ${img.error ? 'opacity-50' : ''}`}
              />

              {/* Progress Overlay */}
              {!img.error && img.progress < 100 && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
                  <span className="text-xs text-white font-medium">
                    {img.progress}%
                  </span>
                </div>
              )}

              {/* Error Overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center p-2">
                  <AlertCircle className="w-6 h-6 text-white mb-2" />
                  <span className="text-xs text-white text-center">
                    {img.error}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUploading(img.id)}
                    className="mt-2 px-2 py-1 bg-white text-red-600 rounded text-xs font-medium hover:bg-gray-100"
                  >
                    {t.remove}
                  </button>
                </div>
              )}

              {/* Success Check */}
              {img.progress === 100 && !img.error && (
                <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
