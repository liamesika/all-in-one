'use client';

/**
 * Creative Productions - Templates Client
 * Browse, create, edit, duplicate, lock/unlock templates
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BUILT_IN_TEMPLATES } from '@/lib/builtInTemplates';

interface Template {
  id: string;
  title: string;
  kind: string;
  content: any;
  locale: string;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesClient() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<string>('all');
  const [filterLocale, setFilterLocale] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [hasSeededBuiltIns, setHasSeededBuiltIns] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [filterKind, filterLocale]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (filterKind !== 'all') params.set('kind', filterKind);
      if (filterLocale !== 'all') params.set('locale', filterLocale);

      const res = await fetch(`/api/productions/templates?${params}`);
      if (!res.ok) throw new Error('Failed to fetch templates');

      const data = await res.json();
      setTemplates(data.templates || []);

      // Check if we need to seed built-ins
      if (data.templates.length === 0 && !hasSeededBuiltIns) {
        await seedBuiltInTemplates();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const seedBuiltInTemplates = async () => {
    try {
      setHasSeededBuiltIns(true);
      const templates = Object.values(BUILT_IN_TEMPLATES);

      await Promise.all(
        templates.map(template =>
          fetch('/api/productions/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...template, locked: true }),
          })
        )
      );

      await fetchTemplates();
    } catch (err) {
      console.error('Failed to seed templates:', err);
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      const res = await fetch(`/api/productions/templates/${templateId}/duplicate`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to duplicate template');

      await fetchTemplates();
    } catch (err: any) {
      alert('Failed to duplicate template: ' + err.message);
    }
  };

  const handleLocalize = async (templateId: string, targetLocale: 'EN' | 'HE') => {
    try {
      const res = await fetch(`/api/productions/templates/${templateId}/localize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLocale }),
      });

      if (!res.ok) throw new Error('Failed to localize template');

      await fetchTemplates();
    } catch (err: any) {
      alert('Failed to localize template: ' + err.message);
    }
  };

  const handleToggleLock = async (template: Template) => {
    try {
      const res = await fetch(`/api/productions/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !template.locked }),
      });

      if (!res.ok) throw new Error('Failed to toggle lock');

      await fetchTemplates();
    } catch (err: any) {
      alert('Failed to toggle lock: ' + err.message);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/productions/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete template');
      }

      await fetchTemplates();
    } catch (err: any) {
      alert('Failed to delete template: ' + err.message);
    }
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'BRIEF':
        return '📋';
      case 'SCRIPT':
        return '🎬';
      case 'SHOTLIST':
        return '📸';
      case 'AD_COPY':
        return '📝';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-10 bg-[#1A2F4B] rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-[#1A2F4B] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchTemplates}
            className="px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredTemplates = templates;

  return (
    <div className="min-h-screen bg-[#0E1A2B] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <button
              onClick={() => router.push('/dashboard/productions')}
              className="text-gray-400 hover:text-white mb-2 transition-colors inline-flex items-center gap-2 text-sm"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white">Templates</h1>
            <p className="text-gray-400 mt-1">{filteredTemplates.length} templates</p>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowEditor(true);
            }}
            className="px-6 py-3 bg-[#2979FF] hover:bg-[#1E5FCC] text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(41,121,255,0.4)] focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
          >
            + New Template
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#1A2F4B] rounded-xl p-4 mb-6 flex flex-wrap gap-4">
          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value)}
            className="px-4 py-2 bg-[#0E1A2B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
          >
            <option value="all">All Types</option>
            <option value="BRIEF">Brief</option>
            <option value="SCRIPT">Script</option>
            <option value="SHOTLIST">Shot List</option>
            <option value="AD_COPY">Ad Copy</option>
          </select>

          <select
            value={filterLocale}
            onChange={(e) => setFilterLocale(e.target.value)}
            className="px-4 py-2 bg-[#0E1A2B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
          >
            <option value="all">All Languages</option>
            <option value="EN">English</option>
            <option value="HE">Hebrew</option>
          </select>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-[#1A2F4B] rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-4">No templates yet</p>
            <button
              onClick={() => setShowEditor(true)}
              className="text-[#2979FF] hover:text-[#1E5FCC] font-medium"
            >
              Create your first template →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => {
                  setEditingTemplate(template);
                  setShowEditor(true);
                }}
                onDuplicate={() => handleDuplicate(template.id)}
                onLocalize={handleLocalize}
                onToggleLock={() => handleToggleLock(template)}
                onDelete={() => handleDelete(template.id)}
                getKindIcon={getKindIcon}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <TemplateEditorModal
          template={editingTemplate}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          onSuccess={() => {
            setShowEditor(false);
            setEditingTemplate(null);
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDuplicate: () => void;
  onLocalize: (id: string, locale: 'EN' | 'HE') => void;
  onToggleLock: () => void;
  onDelete: () => void;
  getKindIcon: (kind: string) => string;
}

function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onLocalize,
  onToggleLock,
  onDelete,
  getKindIcon,
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-[#1A2F4B] rounded-xl p-6 hover:bg-[#234060] transition-all relative group">
      {/* Lock Badge */}
      {template.locked && (
        <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium">
          🔒 Locked
        </div>
      )}

      {/* Icon & Title */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-4xl">{getKindIcon(template.kind)}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg truncate mb-1">
            {template.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{template.kind}</span>
            <span>•</span>
            <span>{template.locale}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          disabled={template.locked}
          className="flex-1 px-3 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
        >
          Edit
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-[#0E1A2B] hover:bg-[#0E1A2B]/70 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            aria-label="More actions"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0E1A2B] border border-white/10 rounded-lg shadow-xl z-10">
              <button
                onClick={() => {
                  onDuplicate();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#1A2F4B] transition-colors"
              >
                📋 Duplicate
              </button>
              <button
                onClick={() => {
                  onLocalize(template.id, template.locale === 'EN' ? 'HE' : 'EN');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#1A2F4B] transition-colors"
              >
                🌐 Localize to {template.locale === 'EN' ? 'HE' : 'EN'}
              </button>
              <button
                onClick={() => {
                  onToggleLock();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#1A2F4B] transition-colors"
              >
                {template.locked ? '🔓 Unlock' : '🔒 Lock'}
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                disabled={template.locked}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1A2F4B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TemplateEditorModalProps {
  template: Template | null;
  onClose: () => void;
  onSuccess: () => void;
}

function TemplateEditorModal({ template, onClose, onSuccess }: TemplateEditorModalProps) {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    kind: template?.kind || 'BRIEF',
    locale: template?.locale || 'EN',
    content: template?.content || { sections: [] },
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = template
        ? `/api/productions/templates/${template.id}`
        : '/api/productions/templates';

      const res = await fetch(url, {
        method: template ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save template');
      }

      onSuccess();
    } catch (err: any) {
      alert('Failed to save template: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1A2F4B] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {template ? 'Edit Template' : 'New Template'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-[#0E1A2B] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              placeholder="My Template"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={formData.kind}
                onChange={(e) => setFormData(prev => ({ ...prev, kind: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0E1A2B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              >
                <option value="BRIEF">Brief</option>
                <option value="SCRIPT">Script</option>
                <option value="SHOTLIST">Shot List</option>
                <option value="AD_COPY">Ad Copy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select
                value={formData.locale}
                onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0E1A2B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              >
                <option value="EN">English</option>
                <option value="HE">Hebrew</option>
              </select>
            </div>
          </div>

          <div className="pt-4 text-sm text-gray-400">
            <p>Template content will be structured as sections. After creating, you can add custom sections.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#0E1A2B] hover:bg-[#0E1A2B]/70 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#2979FF] hover:bg-[#1E5FCC] text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(41,121,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            >
              {submitting ? 'Saving...' : template ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
