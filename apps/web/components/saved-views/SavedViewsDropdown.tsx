/**
 * Saved Views Dropdown
 * Sprint A1 - Quick access to saved filter/sort views
 * Dark theme, mobile-first, accessible
 */

'use client';

import { useState } from 'react';
import { Save, Star, Share2, Trash2, Eye, X } from 'lucide-react';
import { useSavedViews, SavedView } from '@/hooks/useSavedViews';
import toast from 'react-hot-toast';

interface SavedViewsDropdownProps {
  page: string;
  vertical?: string;
  currentFilters: Record<string, any>;
  currentSorts: Array<{ field: string; direction: 'asc' | 'desc' }>;
  onViewApplied: (view: SavedView) => void;
}

export function SavedViewsDropdown({
  page,
  vertical,
  currentFilters,
  currentSorts,
  onViewApplied,
}: SavedViewsDropdownProps) {
  const {
    views,
    loading,
    createView,
    updateView,
    deleteView,
    applyView,
    getShareableUrl,
  } = useSavedViews({ page, vertical, onViewApplied });

  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [saveScope, setSaveScope] = useState<'user' | 'org'>('user');

  const handleSaveView = async () => {
    if (!newViewName.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    try {
      await createView(newViewName, currentFilters, currentSorts, {
        isDefault: saveAsDefault,
        scope: saveScope,
      });
      toast.success('View saved successfully');
      setShowSaveDialog(false);
      setNewViewName('');
      setSaveAsDefault(false);
    } catch (err) {
      toast.error('Failed to save view');
    }
  };

  const handleDeleteView = async (viewId: string, viewName: string) => {
    if (!confirm(`Delete view "${viewName}"?`)) return;

    try {
      await deleteView(viewId);
      toast.success('View deleted');
    } catch (err) {
      toast.error('Failed to delete view');
    }
  };

  const handleSetDefault = async (viewId: string) => {
    try {
      await updateView(viewId, { isDefault: true });
      toast.success('Set as default view');
    } catch (err) {
      toast.error('Failed to set default');
    }
  };

  const handleShareView = (viewId: string, viewName: string) => {
    const url = getShareableUrl(viewId);
    navigator.clipboard.writeText(url);
    toast.success(`Link copied for "${viewName}"`);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 h-10 bg-[#1A2F4B] hover:bg-[#2979FF] text-white rounded-lg transition-colors text-sm font-medium"
        aria-label="Saved views"
        aria-expanded={isOpen}
      >
        <Eye className="w-4 h-4" />
        Views
        {views.length > 0 && (
          <span className="bg-[#2979FF] px-1.5 py-0.5 rounded text-xs">{views.length}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-80 bg-[#0E1A2B] border border-[#1A2F4B] rounded-lg shadow-xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1A2F4B]">
              <h3 className="text-white font-semibold text-sm">Saved Views</h3>
              <button
                onClick={() => {
                  setShowSaveDialog(true);
                  setIsOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2979FF] hover:bg-[#1e5bbf] text-white rounded text-xs font-medium transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Current
              </button>
            </div>

            {/* Views List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
              ) : views.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No saved views yet. Save your current filters to get started.
                </div>
              ) : (
                <div className="divide-y divide-[#1A2F4B]">
                  {views.map((view) => (
                    <div
                      key={view.id}
                      className="p-3 hover:bg-[#1A2F4B] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => {
                            applyView(view);
                            setIsOpen(false);
                          }}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{view.name}</span>
                            {view.isDefault && (
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            )}
                            {view.scope === 'org' && (
                              <span className="px-1.5 py-0.5 bg-[#2979FF] text-white rounded text-xs">
                                Org
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {Object.keys(view.filters).length} filters
                            {view.sorts && view.sorts.length > 0 && `, ${view.sorts.length} sorts`}
                          </p>
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!view.isDefault && (
                            <button
                              onClick={() => handleSetDefault(view.id)}
                              className="p-1.5 hover:bg-[#2979FF] rounded text-gray-400 hover:text-white transition-colors"
                              title="Set as default"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleShareView(view.id, view.name)}
                            className="p-1.5 hover:bg-[#2979FF] rounded text-gray-400 hover:text-white transition-colors"
                            title="Copy share link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          {view.userId && (
                            <button
                              onClick={() => handleDeleteView(view.id, view.name)}
                              className="p-1.5 hover:bg-red-500 rounded text-gray-400 hover:text-white transition-colors"
                              title="Delete view"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSaveDialog(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0E1A2B] border border-[#1A2F4B] rounded-lg shadow-2xl w-full max-w-md">
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#1A2F4B]">
                <h3 className="text-white font-semibold">Save Current View</h3>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="p-1 hover:bg-[#1A2F4B] rounded text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    View Name
                  </label>
                  <input
                    type="text"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="e.g., Hot Leads, Pending Reviews"
                    className="w-full px-3 py-2 bg-[#1A2F4B] border border-[#2979FF] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveView()}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                      className="w-4 h-4 bg-[#1A2F4B] border-[#2979FF] rounded text-[#2979FF] focus:ring-[#2979FF]"
                    />
                    <span className="text-sm text-gray-300">Set as default view</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveScope === 'org'}
                      onChange={(e) => setSaveScope(e.target.checked ? 'org' : 'user')}
                      className="w-4 h-4 bg-[#1A2F4B] border-[#2979FF] rounded text-[#2979FF] focus:ring-[#2979FF]"
                    />
                    <span className="text-sm text-gray-300">
                      Share with organization (all members can see)
                    </span>
                  </label>
                </div>

                <div className="text-xs text-gray-400 bg-[#1A2F4B] p-3 rounded-lg">
                  Saving {Object.keys(currentFilters).length} filters
                  {currentSorts.length > 0 && ` and ${currentSorts.length} sorts`}
                </div>
              </div>

              {/* Dialog Footer */}
              <div className="flex items-center gap-2 p-4 border-t border-[#1A2F4B]">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-2 bg-[#1A2F4B] hover:bg-[#2d4a6b] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveView}
                  className="flex-1 px-4 py-2 bg-[#2979FF] hover:bg-[#1e5bbf] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Save View
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
