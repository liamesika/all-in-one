'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderTree,
  ChevronRight,
  Plus,
  Save,
  Download,
  Menu,
  Edit2,
  Trash2,
  GripVertical,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
} from '@/components/shared';
import { EcommerceHeader } from '@/components/dashboard/RealEstateHeader';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface Collection {
  id: string;
  name: string;
  type: 'manual' | 'rule-based';
  rules?: {
    condition: 'contains' | 'equals' | 'starts-with';
    field: 'title' | 'tag' | 'price';
    value: string;
  }[];
  productCount: number;
}

interface MenuItem {
  id: string;
  label: string;
  type: 'collection' | 'link' | 'page';
  link?: string;
  collectionId?: string;
  children?: MenuItem[];
}

export function StructureClient() {
  const router = useRouter();
  const { lang } = useLang();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/ecommerce/structure', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCollections(data.collections || []);
          setMenuItems(data.menuItems || []);
        }
      } catch (error) {
        console.error('Failed to fetch structure:', error);
      }
    };

    fetchData();
  }, []);

  const handleSaveCollection = async (collection: Partial<Collection>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/structure/collections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collection),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingCollection) {
          setCollections(prev =>
            prev.map(c => (c.id === editingCollection.id ? data.collection : c))
          );
        } else {
          setCollections(prev => [...prev, data.collection]);
        }
        setShowCollectionModal(false);
        setEditingCollection(null);
      }
    } catch (error) {
      console.error('Failed to save collection:', error);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/ecommerce/structure/collections?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCollections(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

  const handleSaveMenu = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/structure/menu', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItems }),
      });

      if (response.ok) {
        console.log('Menu saved successfully');
      }
    } catch (error) {
      console.error('Failed to save menu:', error);
    }
  };

  const handleExportJSON = () => {
    const data = {
      collections,
      menuItems,
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `store-structure-${Date.now()}.json`;
    a.click();
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    const newItems = [...menuItems];
    const draggedIndex = newItems.findIndex(i => i.id === draggedItem);
    const targetIndex = newItems.findIndex(i => i.id === targetId);

    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setMenuItems(newItems);
    setDraggedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <EcommerceHeader />

      <div className="pt-24 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] mb-4 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 ${lang === 'he' ? '' : 'rotate-180'}`} />
            <span>{lang === 'he' ? 'חזרה' : 'Back'}</span>
          </button>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FolderTree className="w-8 h-8 text-[#2979FF]" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {lang === 'he' ? 'מבנה חנות' : 'Store Structure'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {lang === 'he' ? 'ניהול אוספים ותפריט ניווט' : 'Manage collections and navigation menu'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <UniversalButton onClick={handleSaveMenu} variant="secondary">
                <Save className="w-4 h-4" />
                {lang === 'he' ? 'שמור' : 'Save'}
              </UniversalButton>
              <UniversalButton onClick={handleExportJSON} variant="secondary">
                <Download className="w-4 h-4" />
                JSON
              </UniversalButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Collections */}
            <UniversalCard variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {lang === 'he' ? 'אוספים' : 'Collections'}
                  </h3>
                  <UniversalButton
                    onClick={() => {
                      setEditingCollection(null);
                      setShowCollectionModal(true);
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'he' ? 'אוסף חדש' : 'New Collection'}
                  </UniversalButton>
                </div>
              </CardHeader>
              <CardBody>
                {collections.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      {lang === 'he' ? 'אין אוספים עדיין' : 'No collections yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {collections.map(collection => (
                      <div
                        key={collection.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {collection.name}
                            </h4>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                collection.type === 'manual'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                              }`}
                            >
                              {collection.type === 'manual'
                                ? lang === 'he'
                                  ? 'ידני'
                                  : 'Manual'
                                : lang === 'he'
                                ? 'אוטומטי'
                                : 'Automated'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {collection.productCount}{' '}
                            {lang === 'he' ? 'מוצרים' : 'products'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCollection(collection);
                              setShowCollectionModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(collection.id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </UniversalCard>

            {/* Menu Builder */}
            <UniversalCard variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Menu className="w-5 h-5 text-[#2979FF]" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lang === 'he' ? 'תפריט ניווט' : 'Navigation Menu'}
                    </h3>
                  </div>
                  <UniversalButton
                    onClick={() => setShowMenuItemModal(true)}
                    size="sm"
                    variant="secondary"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'he' ? 'פריט' : 'Item'}
                  </UniversalButton>
                </div>
              </CardHeader>
              <CardBody>
                {menuItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      {lang === 'he' ? 'אין פריטי תפריט עדיין' : 'No menu items yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {menuItems.map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(item.id)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-move"
                      >
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.type === 'collection'
                              ? lang === 'he'
                                ? 'אוסף'
                                : 'Collection'
                              : item.type === 'link'
                              ? lang === 'he'
                                ? 'קישור'
                                : 'Link'
                              : lang === 'he'
                              ? 'עמוד'
                              : 'Page'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setMenuItems(prev => prev.filter(i => i.id !== item.id));
                          }}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </UniversalCard>
          </div>

          {/* Collection Modal */}
          {showCollectionModal && (
            <CollectionModal
              collection={editingCollection}
              onSave={handleSaveCollection}
              onClose={() => {
                setShowCollectionModal(false);
                setEditingCollection(null);
              }}
              lang={lang}
            />
          )}

          {/* Menu Item Modal */}
          {showMenuItemModal && (
            <MenuItemModal
              collections={collections}
              onSave={item => {
                setMenuItems(prev => [...prev, { ...item, id: `menu-${Date.now()}` }]);
                setShowMenuItemModal(false);
              }}
              onClose={() => setShowMenuItemModal(false)}
              lang={lang}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Collection Modal Component
function CollectionModal({
  collection,
  onSave,
  onClose,
  lang,
}: {
  collection: Collection | null;
  onSave: (col: Partial<Collection>) => void;
  lang: string;
}) {
  const [name, setName] = useState(collection?.name || '');
  const [type, setType] = useState<'manual' | 'rule-based'>(collection?.type || 'manual');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {collection
            ? lang === 'he'
              ? 'ערוך אוסף'
              : 'Edit Collection'
            : lang === 'he'
            ? 'אוסף חדש'
            : 'New Collection'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {lang === 'he' ? 'שם' : 'Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {lang === 'he' ? 'סוג' : 'Type'}
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="manual">{lang === 'he' ? 'ידני' : 'Manual'}</option>
              <option value="rule-based">{lang === 'he' ? 'מבוסס כללים' : 'Rule-Based'}</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <UniversalButton
            onClick={() => onSave({ ...collection, name, type, productCount: 0 })}
            className="flex-1"
          >
            {lang === 'he' ? 'שמור' : 'Save'}
          </UniversalButton>
          <UniversalButton onClick={onClose} variant="secondary" className="flex-1">
            {lang === 'he' ? 'ביטול' : 'Cancel'}
          </UniversalButton>
        </div>
      </div>
    </div>
  );
}

// Menu Item Modal Component
function MenuItemModal({
  collections,
  onSave,
  onClose,
  lang,
}: {
  collections: Collection[];
  onSave: (item: Omit<MenuItem, 'id'>) => void;
  onClose: () => void;
  lang: string;
}) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'collection' | 'link' | 'page'>('collection');
  const [collectionId, setCollectionId] = useState('');
  const [link, setLink] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {lang === 'he' ? 'פריט תפריט חדש' : 'New Menu Item'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {lang === 'he' ? 'תווית' : 'Label'}
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {lang === 'he' ? 'סוג' : 'Type'}
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="collection">{lang === 'he' ? 'אוסף' : 'Collection'}</option>
              <option value="link">{lang === 'he' ? 'קישור' : 'Link'}</option>
              <option value="page">{lang === 'he' ? 'עמוד' : 'Page'}</option>
            </select>
          </div>

          {type === 'collection' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {lang === 'he' ? 'אוסף' : 'Collection'}
              </label>
              <select
                value={collectionId}
                onChange={e => setCollectionId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{lang === 'he' ? 'בחר אוסף' : 'Select collection'}</option>
                {collections.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'link' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {lang === 'he' ? 'קישור' : 'Link'}
              </label>
              <input
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <UniversalButton
            onClick={() =>
              onSave({
                label,
                type,
                ...(type === 'collection' && { collectionId }),
                ...(type === 'link' && { link }),
              })
            }
            className="flex-1"
            disabled={!label || (type === 'collection' && !collectionId) || (type === 'link' && !link)}
          >
            {lang === 'he' ? 'הוסף' : 'Add'}
          </UniversalButton>
          <UniversalButton onClick={onClose} variant="secondary" className="flex-1">
            {lang === 'he' ? 'ביטול' : 'Cancel'}
          </UniversalButton>
        </div>
      </div>
    </div>
  );
}
