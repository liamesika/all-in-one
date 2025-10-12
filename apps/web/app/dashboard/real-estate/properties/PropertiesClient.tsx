"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Plus, Upload } from "lucide-react";
import { PropertyAdGenerator } from "@/components/real-estate/PropertyAdGenerator";
import { PropertyFormModal } from "@/components/real-estate/properties/PropertyFormModal";
import { ImportPropertiesModal } from "@/components/real-estate/ImportPropertiesModal";
import { ScoreBadge } from "@/components/real-estate/ScoreBadge";
import { useLanguage } from "@/lib/language-context";

const brand = {
  primary: "#0a3d91",
  primaryHover: "#124bb5",
};

export default function PropertiesClient({ initialData }: { initialData: any[] }) {
  const { language } = useLanguage();
  const [properties, setProperties] = useState(initialData);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showAdGenerator, setShowAdGenerator] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  const handleGenerateAd = (property: any) => {
    setSelectedProperty(property);
    setShowAdGenerator(true);
  };

  const handleCloseAdGenerator = () => {
    setShowAdGenerator(false);
    setSelectedProperty(null);
  };

  const handleCreateProperty = () => {
    setEditingProperty(null);
    setShowPropertyForm(true);
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handlePropertySaved = (savedProperty: any) => {
    if (editingProperty) {
      // Update existing property
      setProperties(prev => prev.map(p => p.id === savedProperty.id ? savedProperty : p));
    } else {
      // Add new property
      setProperties(prev => [savedProperty, ...prev]);
    }
  };

  const handleImportComplete = () => {
    // Refresh properties list - in real app, fetch from API
    console.log('Import complete, refreshing properties list');
    // TODO: Fetch updated properties from API
  };

  return (
    <main className={`p-8 max-w-6xl mx-auto ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold" style={{ color: brand.primary }}>
          {language === 'he' ? 'נכסים' : 'Properties'}
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold shadow-md transition hover:shadow-lg"
            style={{
              borderColor: brand.primary,
              color: brand.primary,
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = brand.primary;
              (e.currentTarget as HTMLButtonElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
              (e.currentTarget as HTMLButtonElement).style.color = brand.primary;
            }}
          >
            <Upload className="w-5 h-5" />
            {language === 'he' ? 'ייבוא CSV' : 'Import CSV'}
          </button>

          <button
            onClick={handleCreateProperty}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold shadow-md transition hover:shadow-lg"
            style={{ backgroundColor: brand.primary }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = brand.primaryHover)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = brand.primary)}
          >
            <Plus className="w-5 h-5" />
            {language === 'he' ? 'נכס חדש' : 'New Property'}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white shadow-xl overflow-hidden">
        <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50">
          {language === 'he' ? 'רשימת נכסים' : 'Properties List'}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="text-sm text-gray-600">
              <tr className="bg-gray-50">
                <th className="p-3 font-medium">{language === 'he' ? 'שם' : 'Name'}</th>
                <th className="p-3 font-medium">{language === 'he' ? 'עיר' : 'City'}</th>
                <th className="p-3 font-medium">{language === 'he' ? 'ציון' : 'Score'}</th>
                <th className="p-3 font-medium">{language === 'he' ? 'סטטוס' : 'Status'}</th>
                <th className="p-3 font-medium">{language === 'he' ? 'פורסם' : 'Published'}</th>
                <th className="p-3 font-medium">{language === 'he' ? 'פעולות' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {properties.length > 0 ? (
                properties.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-semibold">{r.name}</td>
                    <td className="p-3">{r.city || "-"}</td>
                    <td className="p-3">
                      <ScoreBadge property={r} language={language as 'en' | 'he'} size="sm" />
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-lg text-xs bg-gray-100">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.publishedAt
                        ? new Date(r.publishedAt).toLocaleDateString("he-IL")
                        : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleGenerateAd(r)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:shadow-md transition-all"
                          title={language === 'he' ? 'צור מודעה עם AI' : 'Generate Ad with AI'}
                        >
                          <Sparkles className="w-4 h-4" />
                          {language === 'he' ? 'AI' : 'AI'}
                        </button>
                        <Link
                          href={`/dashboard/real-estate/properties/${r.id}`}
                          className="px-3 py-1.5 text-sm underline hover:opacity-80"
                          style={{ color: brand.primary }}
                        >
                          {language === 'he' ? 'צפייה' : 'View'}
                        </Link>
                        <button
                          onClick={() => handleEditProperty(r)}
                          className="px-3 py-1.5 text-sm underline hover:opacity-80"
                          style={{ color: brand.primary }}
                        >
                          {language === 'he' ? 'עריכה' : 'Edit'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-8 text-gray-500" colSpan={5}>
                    {language === 'he'
                      ? 'אין עדיין נכסים. לחצי "נכס חדש" כדי להוסיף.'
                      : 'No properties yet. Click "New Property" to add one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad Generator Modal */}
      {showAdGenerator && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PropertyAdGenerator
            property={selectedProperty}
            onClose={handleCloseAdGenerator}
          />
        </div>
      )}

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={showPropertyForm}
        onClose={() => {
          setShowPropertyForm(false);
          setEditingProperty(null);
        }}
        onSuccess={handlePropertySaved}
        property={editingProperty}
      />

      {/* Import Properties Modal */}
      {showImportModal && (
        <ImportPropertiesModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </main>
  );
}
