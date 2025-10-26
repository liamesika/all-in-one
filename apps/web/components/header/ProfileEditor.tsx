'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, Camera, Check } from 'lucide-react';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    displayName?: string;
    avatarUrl?: string;
    email?: string;
  } | null;
  onSave: (displayName: string, avatarUrl: string) => Promise<void>;
}

const PRESET_AVATARS = [
  '/avatars/preset-1.svg',
  '/avatars/preset-2.svg',
  '/avatars/preset-3.svg',
  '/avatars/preset-4.svg',
  '/avatars/preset-5.svg',
];

export function ProfileEditor({ isOpen, onClose, currentProfile, onSave }: ProfileEditorProps) {
  const [displayName, setDisplayName] = useState(currentProfile?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile?.avatarUrl || '');
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentProfile?.displayName || '');
      setSelectedAvatar(currentProfile?.avatarUrl || '');
      setCustomAvatarPreview('');
      setCustomAvatarFile(null);

      // Focus first input when opened
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, currentProfile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setCustomAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCustomAvatarPreview(result);
      setSelectedAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      alert('Please enter a display name');
      return;
    }

    setIsSaving(true);
    try {
      let avatarUrl = selectedAvatar;

      // If custom avatar was uploaded, handle upload here
      // For now, we'll use the preview URL or store in localStorage
      if (customAvatarFile) {
        // In production, upload to S3/Cloudinary
        avatarUrl = customAvatarPreview;
      }

      await onSave(displayName.trim(), avatarUrl);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-editor-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="profile-editor-title" className="text-xl font-semibold text-gray-900">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Current Avatar Display */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-3xl overflow-hidden">
              {selectedAvatar ? (
                <Image
                  src={selectedAvatar}
                  alt="Avatar preview"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span>{displayName.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              ref={firstInputRef}
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your name"
              maxLength={50}
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Avatar
            </label>

            {/* Custom Upload */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload custom avatar"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all min-h-[44px]"
              >
                <Camera size={20} className="text-gray-500" />
                <span className="text-gray-700 font-medium">Upload Custom Photo</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </div>

            {/* Preset Avatars */}
            <div className="grid grid-cols-5 gap-3">
              {PRESET_AVATARS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setCustomAvatarPreview('');
                    setCustomAvatarFile(null);
                  }}
                  className={`relative w-full aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 min-h-[44px] ${
                    selectedAvatar === avatar
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  aria-label={`Select preset avatar ${index + 1}`}
                  aria-pressed={selectedAvatar === avatar}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {index + 1}
                  </div>
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <Check size={20} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !displayName.trim()}
            className="px-6 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
