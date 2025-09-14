'use client';

import React, { useState, useCallback, useRef, memo } from 'react';
import { useLanguage } from '@/lib/language-context';
import { performanceMonitor } from '@/lib/performance-monitoring';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface FileUploadItem {
  id: string;
  file: File;
  preview?: string;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  uploadedUrl?: string;
}

interface OptimizedFileUploadProps {
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  chunkSize?: number; // in MB
  multiple?: boolean;
  onUploadComplete?: (files: { url: string; file: File }[]) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onError?: (error: string, file: File) => void;
  className?: string;
  disabled?: boolean;
}

// Chunk upload utility
async function uploadFileInChunks(
  file: File,
  uploadUrl: string,
  chunkSize: number = 1024 * 1024, // 1MB chunks
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size.toString());
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`);
    }
    
    // Update progress
    const loaded = Math.min((chunkIndex + 1) * chunkSize, file.size);
    onProgress?.({
      loaded,
      total: file.size,
      percentage: Math.round((loaded / file.size) * 100)
    });
  }
  
  // Finalize upload
  const finalResponse = await fetch(uploadUrl + '/finalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, fileName: file.name })
  });
  
  if (!finalResponse.ok) {
    throw new Error(`Upload finalization failed: ${finalResponse.statusText}`);
  }
  
  const result = await finalResponse.json();
  return result.url;
}

// File validation utility
function validateFile(file: File, maxSize: number, accept?: string): string | null {
  if (maxSize && file.size > maxSize * 1024 * 1024) {
    return `File size exceeds ${maxSize}MB limit`;
  }
  
  if (accept) {
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }
      return fileType.match(type.replace('*', '.*'));
    });
    
    if (!isValidType) {
      return `File type not accepted. Accepted types: ${accept}`;
    }
  }
  
  return null;
}

// Individual file item component
const FileUploadItem = memo(function FileUploadItem({
  item,
  onRemove,
  onRetry
}: {
  item: FileUploadItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const { language } = useLanguage();
  
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      case 'uploading':
        return '🔄';
      default:
        return '📄';
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'completed':
        return language === 'he' ? 'הועלה בהצלחה' : 'Uploaded';
      case 'error':
        return language === 'he' ? 'שגיאה' : 'Error';
      case 'uploading':
        return language === 'he' ? 'מעלה...' : 'Uploading...';
      default:
        return language === 'he' ? 'ממתין' : 'Pending';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
      {item.preview && (
        <img
          src={item.preview}
          alt={item.file.name}
          className="w-12 h-12 object-cover rounded"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <p className="text-sm font-medium text-gray-900 truncate">
            {item.file.name}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>{formatFileSize(item.file.size)}</span>
          <span>{getStatusText()}</span>
        </div>
        
        {item.status === 'uploading' && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs">
              <span>{item.progress.percentage}%</span>
              <span>
                {formatFileSize(item.progress.loaded)} / {formatFileSize(item.progress.total)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${item.progress.percentage}%` }}
              />
            </div>
          </div>
        )}
        
        {item.error && (
          <p className="text-xs text-red-600 mt-1">{item.error}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        {item.status === 'error' && (
          <button
            onClick={() => onRetry(item.id)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title={language === 'he' ? 'נסה שוב' : 'Retry'}
          >
            🔄
          </button>
        )}
        
        {item.status !== 'uploading' && (
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title={language === 'he' ? 'הסר' : 'Remove'}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
});

// Main optimized file upload component
export const OptimizedFileUpload = memo(function OptimizedFileUpload({
  accept = 'image/*',
  maxFiles = 10,
  maxSize = 10, // 10MB
  chunkSize = 1, // 1MB chunks
  multiple = true,
  onUploadComplete,
  onUploadProgress,
  onError,
  className = '',
  disabled = false
}: OptimizedFileUploadProps) {
  const { language } = useLanguage();
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadQueue = useRef<FileUploadItem[]>([]);
  const isProcessingQueue = useRef(false);

  const createFileItem = useCallback((file: File): FileUploadItem => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    return {
      id,
      file,
      preview,
      progress: { loaded: 0, total: file.size, percentage: 0 },
      status: 'pending'
    };
  }, []);

  const processUploadQueue = useCallback(async () => {
    if (isProcessingQueue.current || uploadQueue.current.length === 0) return;
    
    isProcessingQueue.current = true;
    
    while (uploadQueue.current.length > 0) {
      const item = uploadQueue.current.shift()!;
      
      try {
        // Update status to uploading
        setUploadItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'uploading' as const } : i
        ));

        const startTime = performance.now();
        
        // Upload file in chunks
        const uploadedUrl = await uploadFileInChunks(
          item.file,
          '/api/uploads/chunked',
          chunkSize * 1024 * 1024,
          (progress) => {
            setUploadItems(prev => prev.map(i => 
              i.id === item.id ? { ...i, progress } : i
            ));
            onUploadProgress?.(progress);
          }
        );

        const endTime = performance.now();
        performanceMonitor.trackApiCall(
          '/api/uploads/chunked',
          'POST',
          endTime - startTime,
          200
        );

        // Update status to completed
        setUploadItems(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, status: 'completed' as const, uploadedUrl }
            : i
        ));

        onUploadComplete?.([{ url: uploadedUrl, file: item.file }]);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        // Update status to error
        setUploadItems(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, status: 'error' as const, error: errorMessage }
            : i
        ));

        onError?.(errorMessage, item.file);
      }
    }
    
    isProcessingQueue.current = false;
  }, [chunkSize, onUploadComplete, onUploadProgress, onError]);

  const handleFiles = useCallback((files: File[]) => {
    if (disabled) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    for (const file of files) {
      if (uploadItems.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }

      const validationError = validateFile(file, maxSize, accept);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    }

    // Show errors
    if (errors.length > 0) {
      console.error('File validation errors:', errors);
      onError?.(errors.join('\n'), files[0]);
    }

    // Create upload items
    const newItems = validFiles.map(createFileItem);
    setUploadItems(prev => [...prev, ...newItems]);
    
    // Add to upload queue
    uploadQueue.current.push(...newItems);
    processUploadQueue();
  }, [disabled, uploadItems.length, maxFiles, maxSize, accept, createFileItem, processUploadQueue, onError]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // Reset input
    if (e.target) e.target.value = '';
  }, [handleFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeItem = useCallback((id: string) => {
    setUploadItems(prev => {
      const itemToRemove = prev.find(item => item.id === id);
      if (itemToRemove?.preview) {
        URL.revokeObjectURL(itemToRemove.preview);
      }
      return prev.filter(item => item.id !== id);
    });
    
    // Remove from upload queue
    uploadQueue.current = uploadQueue.current.filter(item => item.id !== id);
  }, []);

  const retryItem = useCallback((id: string) => {
    const item = uploadItems.find(item => item.id === id);
    if (item && item.status === 'error') {
      setUploadItems(prev => prev.map(i => 
        i.id === id ? { ...i, status: 'pending' as const, error: undefined } : i
      ));
      
      uploadQueue.current.push(item);
      processUploadQueue();
    }
  }, [uploadItems, processUploadQueue]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      uploadItems.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={!disabled ? openFileDialog : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {language === 'he' ? 'גרור קבצים כאן או לחץ לבחירה' : 'Drag files here or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              {language === 'he' 
                ? `מקסימום ${maxFiles} קבצים, עד ${maxSize}MB כל קובץ`
                : `Maximum ${maxFiles} files, up to ${maxSize}MB each`
              }
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {accept && (language === 'he' ? `סוגי קבצים: ${accept}` : `Accepted: ${accept}`)}
            </p>
          </div>
        </div>
      </div>

      {/* Upload items */}
      {uploadItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            {language === 'he' ? 'קבצים' : 'Files'} ({uploadItems.length})
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadItems.map(item => (
              <FileUploadItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onRetry={retryItem}
              />
            ))}
          </div>
          
          {uploadItems.length > 0 && (
            <div className="text-xs text-gray-500 text-center">
              {language === 'he' ? 'העלאה מתבצעת ברקע' : 'Upload processing in background'}
            </div>
          )}
        </div>
      )}
    </div>
  );
});