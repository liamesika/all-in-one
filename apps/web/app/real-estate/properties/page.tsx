"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
// Temporary fallback: replaced framer-motion for Vercel build compatibility
// import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import { LanguageToggle } from "@/components/language-toggle";
import { EffinityHeader } from "@/components/effinity-header";
import { PropertyImport } from "@/components/PropertyImport";

type Row = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  rooms?: number | null;
  size?: number | null;
  price?: number | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  publishedAt?: string | null;
  slug?: string | null;
  agentName?: string | null;
  agentPhone?: string | null;
  createdAt?: string;
  updatedAt?: string;
  provider?: "MANUAL" | "YAD2" | "MADLAN" | null;
  externalId?: string | null;
  externalUrl?: string | null;
  syncStatus?: "IDLE" | "SYNCING" | "SUCCESS" | "ERROR" | null;
  lastSyncAt?: string | null;
  needsReview?: boolean | null;
};

type FileWithPreview = File & { _preview?: string };

// EFFINITY Brand Colors
const brand = { 
  primary: "#1e3a8a", 
  hover: "#1d4ed8",
  light: "#3b82f6",
  gradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
};

function inputClass(extra = "") {
  return [
    "w-full border rounded-xl px-3 py-2 outline-none",
    "focus:ring focus:ring-gray-200",
    "placeholder:text-gray-400",
    "invalid:border-red-500 invalid:focus:ring-red-200",
    extra,
  ].join(" ");
}

function getStatusSelectClass(status: string) {
  const baseClass = "w-full border rounded-xl px-3 py-2 outline-none focus:ring focus:ring-gray-200 font-semibold";
  
  switch (status) {
    case 'PUBLISHED':
      return `${baseClass} bg-green-50 border-green-300 text-green-800 focus:ring-green-200`;
    case 'ARCHIVED':
      return `${baseClass} bg-gray-50 border-gray-300 text-gray-700 focus:ring-gray-200`;
    case 'DRAFT':
    default:
      return `${baseClass} bg-yellow-50 border-yellow-300 text-yellow-800 focus:ring-yellow-200`;
  }
}

function PropertiesPageContent() {
  const { t, language } = useLanguage();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>(""); // "", "DRAFT", "PUBLISHED", "ARCHIVED"
  const [provider, setProvider] = useState<string>(""); // "", "MANUAL", "YAD2", "MADLAN"
  const [error, setError] = useState<string | null>(null);

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);

  // modal state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", address: "", city: "",
    agentName: "", agentPhone: "0587878676",
    price: "", rooms: "", size: ""
  });
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // View/Edit modal state
  const [viewProperty, setViewProperty] = useState<Row | null>(null);
  const [editProperty, setEditProperty] = useState<Row | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editFiles, setEditFiles] = useState<FileWithPreview[]>([]);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // ---------- TABLE LOAD (via apiFetch → unified base + headers) ----------
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (provider) params.set("provider", provider);
      const data = await apiFetch(`/real-estate/properties?${params.toString()}`);
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (e: any) {
      setError(e?.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, provider]);
  
  useEffect(() => {
    async function loadAnalytics() {
        try {
        const data = await apiFetch('/real-estate/properties/analytics');
        setTotal(data?.total ?? null);
        } catch {
        setTotal(null);
        }
    }
    loadAnalytics();
  }, []);

  const count = rows.length;

  // ---------- MODAL FILE UX (copied from your /new page) ----------
  const onPickFiles = useCallback(() => fileInputRef.current?.click(), []);
  const addFiles = useCallback((incoming: File[]) => {
    const MAX_FILES = 20;
    const merged = [...files, ...incoming]
      .slice(0, MAX_FILES)
      .map((f) => {
        const fp = f as FileWithPreview;
        if (!fp._preview) fp._preview = URL.createObjectURL(f);
        return fp;
      });
    setFiles(merged);
  }, [files]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    if (list.length) addFiles(list);
    e.currentTarget.value = "";
  }, [addFiles]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (list.length) addFiles(list);
  }, [addFiles]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed?._preview) URL.revokeObjectURL(removed._preview);
      return next;
    });
  }, []);
  
  const removeEditFile = useCallback((idx: number) => {
    setEditFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed?._preview) URL.revokeObjectURL(removed._preview);
      return next;
    });
  }, []);

  const previews = useMemo(() => files.map((f) => f._preview!), [files]);
  const editPreviews = useMemo(() => editFiles.map((f) => f._preview!), [editFiles]);

  // ---------- CREATE FLOW (exactly like /new – via apiFetch) ----------
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1) create property
      const created = await apiFetch("/real-estate/properties", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address || undefined,
          city: form.city || undefined,
          agentName: form.agentName || undefined,
          agentPhone: form.agentPhone || undefined,
          price: form.price ? Number(form.price) : undefined,
          rooms: form.rooms ? Number(form.rooms) : undefined,
          size: form.size ? Number(form.size) : undefined,
        }),
      });

      // 2) upload photos (optional)
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        await apiFetch(`/real-estate/properties/${created.id}/photos/upload`, {
          method: "POST",
          body: fd, // apiFetch won't set JSON header for FormData
        });
      }

      // refresh list & close
      setOpen(false);
      setForm({ name: "", address: "", city: "", agentName: "", agentPhone: "0587878676", price: "", rooms: "", size: "" });
      setFiles([]);
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to save. Please try again or check connection.");
    } finally {
      setSaving(false);
    }
  }
  
  // Edit property handler
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editProperty) return;
    
    setEditSaving(true);
    setError(null);

    try {
      await apiFetch(`/real-estate/properties/${editProperty.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name?.trim(),
          address: editForm.address || undefined,
          city: editForm.city || undefined,
          agentName: editForm.agentName || undefined,
          agentPhone: editForm.agentPhone || undefined,
          price: editForm.price ? Number(editForm.price) : undefined,
          rooms: editForm.rooms ? Number(editForm.rooms) : undefined,
          size: editForm.size ? Number(editForm.size) : undefined,
          status: editForm.status || 'DRAFT',
        }),
      });

      // Upload new photos if any
      if (editFiles.length) {
        const fd = new FormData();
        editFiles.forEach((f) => fd.append("files", f));
        await apiFetch(`/real-estate/properties/${editProperty.id}/photos/upload`, {
          method: "POST",
          body: fd,
        });
      }

      // refresh list & close
      setEditProperty(null);
      setEditForm({});
      setEditFiles([]);
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to update. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }
  
  // Export to HTML landing page
  function exportToHTML(property: Row) {
    // Placeholder images for the grid when no actual images are available
    const placeholderImages = [
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjYzNkYWY5Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI2ZiZDA0YSIvPgo8cG9seWdvbiBwb2ludHM9IjYwLDE4MCA5MCwxMzAgMTMwLDE0MCA5MCwxNjAgMTQwLDE4MCA2MCwxODAiIGZpbGw9IiMzNGQ5OTkiLz4KPHBvbHlnb24gcG9pbnRzPSI4MCwyMDAgMTIwLDE2MCAyMDAsMTcwIDI0MCwxNDAgMjgwLDE2MCAzMDAsMjAwIDgwLDIwMCIgZmlsbD0iIzE2Yzc4NCIvPgo8L3N2Zz4K',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjYzNkYWY5Ii8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjYwIiByPSIyNSIgZmlsbD0iI2ZiZDA0YSIvPgo8cG9seWdvbiBwb2ludHM9IjIwLDE4MCA4MCwxMjAgMTQwLDEzMCAxODAsMTIwIDI2MCwxNDAgMzAwLDE1MCAzODAsMTgwIDIwLDE4MCIgZmlsbD0iIzM0ZDM5OSIvPgo8cG9seWdvbiBwb2ludHM9IjQwLDIyMCAxMDAsMTcwIDIwMCwxODAgMjgwLDE2MCAzNDAsMTkwIDM4MCwyMjAgNDAsMjIwIiBmaWxsPSIjMTZjNzg0Ii8+Cjwvc3ZnPgo=',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjYzNkYWY5Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNzAiIHI9IjM1IiBmaWxsPSIjZmJkMDRhIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTAwLDE2MCAyMDAsMTEwIDI2MCwxMjAgMzIwLDEwMCAzODAsMTMwIDM4MCwxNjAgMTAwLDE2MCIgZmlsbD0iIzM0ZDM5OSIvPgo8cG9seWdvbiBwb2ludHM9IjYwLDIxMCAxNDAsMTcwIDI0MCwxODAgMzIwLDE2MCAzODAsMjEwIDYwLDIxMCIgZmlsbD0iIzE2Yzc4NCIvPgo8L3N2Zz4K',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjYzNkYWY5Ii8+CjxjaXJjbGUgY3g9IjMzMCIgY3k9IjUwIiByPSIyOCIgZmlsbD0iI2ZiZDA0YSIvPgo8cG9seWdvbiBwb2ludHM9IjUwLDE1MCAyMDAsMTAwIDI4MCwxMTAgMzAwLDk1IDM4MCwxMjAgMzgwLDE1MCA1MCwxNTAiIGZpbGw9IiMzNGQzOTkiLz4KPHBvbHlnb24gcG9pbnRzPSIyMCwyMTAgMTIwLDE3MCAyNDAsMTgwIDM0MCwxNTUgMzgwLDIxMCAyMCwyMTAiIGZpbGw9IiMxNmM3ODQiLz4KPC9zdmc+Cg=='
    ];

    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${property.name} - EFFINITY Real Estate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
    
    /* EFFINITY Header */
    .header { 
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); 
      color: white; 
      padding: 20px 0; 
      box-shadow: 0 4px 20px rgba(30, 58, 138, 0.3);
    }
    .header-content { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 0 20px; 
      display: flex; 
      align-items: center; 
      gap: 15px; 
    }
    .logo { 
      width: 50px; 
      height: 50px; 
      background: white; 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: bold; 
      font-size: 18px; 
      color: #1e3a8a; 
    }
    .header h1 { font-size: 2.2rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    .header p { opacity: 0.9; margin-top: 5px; }
    
    /* Main Content */
    .container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
    .property-card { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 15px 40px rgba(0,0,0,0.1); }
    
    /* Property Title */
    .property-title { 
      font-size: 2.8rem; 
      font-weight: bold; 
      color: #1e3a8a; 
      text-align: center; 
      margin-bottom: 20px; 
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    
    /* Address */
    .property-address { 
      font-size: 1.3rem; 
      color: #6b7280; 
      text-align: center; 
      margin-bottom: 30px; 
      font-weight: 500;
    }
    
    /* Price */
    .property-price { 
      font-size: 3rem; 
      font-weight: bold; 
      color: #1e3a8a; 
      text-align: center; 
      margin-bottom: 40px; 
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    
    /* Two Column Layout */
    .info-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 40px; 
      margin-bottom: 40px; 
    }
    
    .contact-section { 
      background: #f8f9ff; 
      padding: 30px; 
      border-radius: 15px; 
      border: 2px solid #e0e7ff;
    }
    .contact-section h3 { 
      font-size: 1.5rem; 
      color: #1e3a8a; 
      margin-bottom: 20px; 
      font-weight: bold;
    }
    .agent-name { font-size: 1.2rem; margin-bottom: 10px; color: #374151; }
    .agent-phone { 
      font-size: 1.1rem; 
      color: #2563eb; 
      text-decoration: none; 
      font-weight: 600; 
      margin-bottom: 20px; 
      display: block;
    }
    .call-btn { 
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); 
      color: white; 
      padding: 12px 30px; 
      border: none; 
      border-radius: 10px; 
      font-size: 1.1rem; 
      font-weight: 600; 
      cursor: pointer; 
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
      transition: transform 0.2s;
    }
    .call-btn:hover { transform: translateY(-2px); }
    
    .details-section { 
      background: #f0f9ff; 
      padding: 30px; 
      border-radius: 15px; 
      border: 2px solid #bfdbfe;
      text-align: center;
    }
    .details-section h3 { 
      font-size: 1.5rem; 
      color: #1e3a8a; 
      margin-bottom: 20px; 
      font-weight: bold;
    }
    .detail-item { 
      margin-bottom: 15px; 
      font-size: 1.1rem; 
      color: #374151; 
      font-weight: 500;
    }
    
    /* Image Grid */
    .images-section { 
      margin-top: 50px; 
    }
    .images-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 20px; 
      margin-top: 20px;
    }
    .property-image { 
      width: 100%; 
      height: 200px; 
      object-fit: cover; 
      border-radius: 15px; 
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    /* Footer */
    .footer { 
      text-align: center; 
      margin-top: 60px; 
      padding: 30px; 
      color: #6b7280; 
      border-top: 1px solid #e5e7eb;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .info-grid { grid-template-columns: 1fr; gap: 20px; }
      .property-title { font-size: 2.2rem; }
      .property-price { font-size: 2.5rem; }
      .container { padding: 0 15px; margin: 20px auto; }
      .property-card { padding: 25px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <div class="logo">E</div>
      <div>
        <h1>EFFINITY</h1>
        <p>AI-powered efficiency for modern teams</p>
      </div>
    </div>
  </div>
  
  <div class="container">
    <div class="property-card">
      <h1 class="property-title">${property.name}</h1>
      
      <div class="property-address">
        ${property.address && property.city ? `${property.address}, ${property.city}` : property.city || property.address || 'מיקום לא צוין'}
      </div>
      
      ${property.price ? `<div class="property-price">₪${property.price.toLocaleString()}</div>` : ''}
      
      <div class="info-grid">
        <div class="contact-section">
          <h3>Contact Agent</h3>
          ${property.agentName ? `<div class="agent-name">Agent: ${property.agentName}</div>` : '<div class="agent-name">Agent: John Doe</div>'}
          ${property.agentPhone ? `<a href="tel:${property.agentPhone}" class="agent-phone">Phone: ${property.agentPhone}</a>` : '<a href="tel:0587878676" class="agent-phone">Phone: 0587878676</a>'}
          <button class="call-btn" onclick="window.location.href='tel:${property.agentPhone || '0587878676'}'">Call Now</button>
        </div>
        
        <div class="details-section">
          <h3>מספר חדרים</h3>
          ${property.rooms ? `<div class="detail-item">${property.rooms} חדרים</div>` : '<div class="detail-item">לא צוין</div>'}
          ${property.size ? `<div class="detail-item">${property.size} מ"ר</div>` : ''}
          <div class="detail-item">סטטוס: ${property.status === 'PUBLISHED' ? 'זמין' : 'טיוטה'}</div>
          <div class="detail-item">תאריך עדכון: ${new Date(property.createdAt || '').getFullYear()}</div>
        </div>
      </div>
      
      <div class="images-section">
        <div class="images-grid">
          ${placeholderImages.map(img => `<img src="${img}" alt="Property Image" class="property-image" />`).join('')}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} EFFINITY Real Estate. All rights reserved.</p>
      <p>Generated on ${new Date().toLocaleDateString('he-IL')}</p>
    </div>
  </div>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${property.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_landing_page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Share property details
  function shareProperty(property: Row) {
    const text = `Check out this property: ${property.name}\n${property.address && property.city ? `Location: ${property.address}, ${property.city}` : property.city || property.address || ''}${property.price ? `\nPrice: ₪${property.price.toLocaleString()}` : ''}${property.rooms ? `\nRooms: ${property.rooms}` : ''}${property.size ? `\nSize: ${property.size}sqm` : ''}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${property.name} - EFFINITY Real Estate`,
        text: text,
        url: property.slug ? `${window.location.origin}/real-estate/properties/${property.slug}` : window.location.href
      });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert(language === 'he' ? 'פרטי הנכס הועתקו ללוח' : 'Property details copied to clipboard!');
      });
    }
  }
  
  // Open edit modal with property data
  function openEdit(property: Row) {
    setEditProperty(property);
    setEditForm({
      name: property.name || '',
      address: property.address || '',
      city: property.city || '',
      agentName: property.agentName || '',
      agentPhone: property.agentPhone || '',
      price: property.price?.toString() || '',
      rooms: property.rooms?.toString() || '',
      size: property.size?.toString() || '',
      status: property.status || 'DRAFT'
    });
    setEditFiles([]);
  }

  // Sync property from external source
  async function syncProperty(property: Row) {
    if (!property.externalUrl) {
      alert(language === 'he' ? 'אין לינק חיצוני לסנכרון' : 'No external URL to sync from');
      return;
    }

    try {
      setError(null);
      await apiFetch(`/real-estate/properties/${property.id}/sync`, {
        method: 'POST'
      });
      await load(); // Refresh the list
      alert(language === 'he' ? 'הנכס סונכרן בהצלחה' : 'Property synced successfully');
    } catch (err: any) {
      setError(err.message || (language === 'he' ? 'שגיאה בסנכרון' : 'Sync failed'));
    }
  }

  // Get provider badge style
  function getProviderBadge(provider?: string | null) {
    if (!provider || provider === 'MANUAL') return null;
    
    const colors = {
      YAD2: 'bg-orange-100 text-orange-800 border border-orange-200',
      MADLAN: 'bg-purple-100 text-purple-800 border border-purple-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {provider}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EffinityHeader variant="dashboard" />

      {/* Page Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">{`${t('properties.title')} (${total ?? rows.length})`}</h1>
          <p className="text-blue-100 mb-6">{language === 'he' ? 'ניהול נכסים מתקדם' : 'Advanced Property Management'}</p>
          <div className="flex gap-3 items-center">
            <input
              dir={language === 'he' ? 'rtl' : 'ltr'}
              className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 w-48 placeholder:text-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder={t('properties.search')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-white focus:outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              title={t('properties.status')}
            >
              <option value="" className="text-gray-800">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
              <option value="DRAFT" className="text-gray-800">{language === 'he' ? 'טיוטה' : 'Draft'}</option>
              <option value="PUBLISHED" className="text-gray-800">{language === 'he' ? 'פורסם' : 'Published'}</option>
              <option value="ARCHIVED" className="text-gray-800">{language === 'he' ? 'ארכיון' : 'Archived'}</option>
            </select>

            <select
              className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-white focus:outline-none"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              title={language === 'he' ? 'מקור' : 'Source'}
            >
              <option value="" className="text-gray-800">{language === 'he' ? 'כל המקורות' : 'All Sources'}</option>
              <option value="MANUAL" className="text-gray-800">{language === 'he' ? 'ידני' : 'Manual'}</option>
              <option value="YAD2" className="text-gray-800">Yad2</option>
              <option value="MADLAN" className="text-gray-800">Madlan</option>
            </select>

            <button
              onClick={() => setImportModalOpen(true)}
              className="bg-green-500/80 backdrop-blur-sm border border-green-400/50 px-4 py-2 rounded-xl text-white font-semibold hover:bg-green-600/80 transition-all transform hover:scale-105"
            >
              📥 {language === 'he' ? 'ייבוא' : 'Import'}
            </button>

            <button
              onClick={() => setOpen(true)}
              className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white font-semibold hover:bg-white/30 transition-all transform hover:scale-105"
            >
              + {language === 'he' ? 'חדש' : 'New'}
            </button>
          </div>
        </div>
      </div>
      
      <main className="p-6 max-w-7xl mx-auto">

      {/* Table */}
      <div className="mt-6 rounded-2xl border bg-white shadow-xl overflow-hidden">
        <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50">
          {language === 'he' ? 'רשימת נכסים' : 'Properties List'}
        </div>

        {error && <div className="p-4 text-red-600">{error}</div>}
        {loading ? (
          <div className="p-6 text-gray-500">{t('common.loading')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right table-fixed">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="text-sm text-gray-600">
                <tr className="bg-gray-50">
                  <th className="p-4 font-semibold text-gray-700">{t('properties.name')}</th>
                  <th className="p-4 font-semibold text-gray-700">{language === 'he' ? 'מיקום' : 'Location'}</th>
                  <th className="p-4 font-semibold text-gray-700">{language === 'he' ? 'פרטים' : 'Details'}</th>
                  <th className="p-4 font-semibold text-gray-700">{t('properties.price')}</th>
                  <th className="p-4 font-semibold text-gray-700">{t('properties.status')}</th>
                  <th className="p-4 font-semibold text-gray-700">{t('properties.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">{r.name}</div>
                          {getProviderBadge(r.provider)}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {r.address || (language === 'he' ? 'אין כתובת' : 'No address')}
                        </div>
                        {r.externalUrl && (
                          <div className="text-xs text-blue-500 mt-1">
                            <a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {language === 'he' ? 'לינק מקורי' : 'Original link'} →
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900">{r.city || "-"}</div>
                        {r.agentPhone && (
                          <div className="text-sm text-gray-500 font-mono">{r.agentPhone}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {r.rooms && <span className="text-sm text-gray-600">
                            {r.rooms} {language === 'he' ? 'חדרים' : 'rooms'}
                          </span>}
                          {r.size && <span className="text-sm text-gray-600">
                            {r.size}{language === 'he' ? 'מ"ר' : 'm²'}
                          </span>}
                        </div>
                      </td>
                      <td className="p-4">
                        {r.price ? (
                          <div className="font-semibold" style={{ color: brand.primary }}>₪{r.price.toLocaleString()}</div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background:
                              r.status === "PUBLISHED" ? "#dcfce7" : r.status === "DRAFT" ? "#fef3c7" : "#f1f5f9",
                            color:
                              r.status === "PUBLISHED" ? "#16a34a" : r.status === "DRAFT" ? "#d97706" : "#64748b",
                          }}
                        >
                          {r.status === "PUBLISHED" ? (language === 'he' ? 'פורסם' : 'Published') : 
                           r.status === "DRAFT" ? (language === 'he' ? 'טיוטה' : 'Draft') : 
                           (language === 'he' ? 'ארכיון' : 'Archived')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => openEdit(r)}
                            className="px-3 py-1 text-sm rounded-lg border hover:bg-gray-50 transition-colors"
                            style={{ borderColor: brand.light, color: brand.primary }}
                          >
                            {t('properties.edit')}
                          </button>
                          <button
                            onClick={() => setViewProperty(r)}
                            className="px-3 py-1 text-sm rounded-lg hover:opacity-80 transition-opacity text-white"
                            style={{ backgroundColor: brand.primary }}
                          >
                            {t('properties.view')}
                          </button>
                          {r.externalUrl && (
                            <button
                              onClick={() => syncProperty(r)}
                              className="px-2 py-1 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                              title={language === 'he' ? 'סנכרן מהמקור' : 'Sync from source'}
                            >
                              🔄 {language === 'he' ? 'סנכרן' : 'Sync'}
                            </button>
                          )}
                          <button
                            onClick={() => exportToHTML(r)}
                            className="px-2 py-1 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                            title={language === 'he' ? 'ייצא לדף נחיתה HTML' : 'Export HTML Landing Page'}
                          >
                            📄 HTML
                          </button>
                          <button
                            onClick={() => shareProperty(r)}
                            className="px-2 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            title={language === 'he' ? 'שתף פרטי נכס' : 'Share Property'}
                          >
                            📤 {language === 'he' ? 'שתף' : 'Share'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-8 text-gray-500" colSpan={6}>
                      {t('properties.noProperties')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- VIEW PROPERTY MODAL ---------- */}
      {viewProperty && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setViewProperty(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border">
              <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold" style={{ color: brand.primary }}>{viewProperty.name}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setViewProperty(null)}
                  aria-label={language === 'he' ? 'סגירה' : 'Close'}
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{language === 'he' ? 'פרטי הנכס' : 'Property Details'}</h3>
                    <div className="space-y-3">
                      <div><strong>{language === 'he' ? 'שם:' : 'Name:'}</strong> {viewProperty.name}</div>
                      {viewProperty.address && <div><strong>{language === 'he' ? 'כתובת:' : 'Address:'}</strong> {viewProperty.address}</div>}
                      {viewProperty.city && <div><strong>{language === 'he' ? 'עיר:' : 'City:'}</strong> {viewProperty.city}</div>}
                      {viewProperty.price && <div><strong>{language === 'he' ? 'מחיר:' : 'Price:'}</strong> ₪{viewProperty.price.toLocaleString()}</div>}
                      {viewProperty.rooms && <div><strong>{language === 'he' ? 'חדרים:' : 'Rooms:'}</strong> {viewProperty.rooms}</div>}
                      {viewProperty.size && <div><strong>{language === 'he' ? 'גודל:' : 'Size:'}</strong> {viewProperty.size}m²</div>}
                      <div><strong>{language === 'he' ? 'סטטוס:' : 'Status:'}</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                          viewProperty.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 
                          viewProperty.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {viewProperty.status === 'PUBLISHED' ? (language === 'he' ? 'פורסם' : 'Published') : 
                           viewProperty.status === 'DRAFT' ? (language === 'he' ? 'טיוטה' : 'Draft') : 
                           (language === 'he' ? 'ארכיון' : 'Archived')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{language === 'he' ? 'פרטי הסוכן' : 'Agent Information'}</h3>
                    <div className="space-y-3">
                      {viewProperty.agentName && <div><strong>{language === 'he' ? 'שם הסוכן:' : 'Agent Name:'}</strong> {viewProperty.agentName}</div>}
                      {viewProperty.agentPhone && (
                        <div><strong>{language === 'he' ? 'טלפון:' : 'Phone:'}</strong> 
                          <a href={`tel:${viewProperty.agentPhone}`} className="ml-2 text-blue-600 hover:underline">
                            {viewProperty.agentPhone}
                          </a>
                        </div>
                      )}
                      {viewProperty.createdAt && (
                        <div><strong>{language === 'he' ? 'נוצר:' : 'Created:'}</strong> {new Date(viewProperty.createdAt).toLocaleDateString()}</div>
                      )}
                      {viewProperty.slug && (
                        <div><strong>{language === 'he' ? 'לינק ציבורי:' : 'Public Link:'}</strong> 
                          <a href={`/real-estate/properties/${viewProperty.slug}`} target="_blank" className="ml-2 text-blue-600 hover:underline">
                            {language === 'he' ? 'צפייה בדף הנכס' : 'View Property Page'} →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t flex gap-4 justify-center">
                  <button
                    onClick={() => exportToHTML(viewProperty)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📄 {language === 'he' ? 'ייצא HTML' : 'Export HTML'}
                  </button>
                  <button
                    onClick={() => shareProperty(viewProperty)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📤 {language === 'he' ? 'שתף' : 'Share'}
                  </button>
                  {viewProperty.slug && (
                    <a
                      href={`/real-estate/properties/${viewProperty.slug}`}
                      target="_blank"
                      className="px-6 py-2 text-white rounded-lg transition-colors inline-block"
                      style={{ backgroundColor: brand.primary }}
                    >
                      🔗 {language === 'he' ? 'דף ציבורי' : 'Public Page'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ---------- EDIT PROPERTY MODAL ---------- */}
      {editProperty && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => !editSaving && setEditProperty(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border">
              <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold" style={{ color: brand.primary }}>{language === 'he' ? 'עריכת נכס' : 'Edit Property'}: {editProperty.name}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => !editSaving && setEditProperty(null)}
                  aria-label={language === 'he' ? 'סגירה' : 'Close'}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEdit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.propertyName')} *</label>
                  <input
                    required
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, name: e.target.value }))}
                    placeholder={t('newProperty.propertyNamePlaceholder')}
                    className={inputClass()}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.address')}</label>
                    <input
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm((s: any) => ({ ...s, address: e.target.value }))}
                      placeholder={t('newProperty.addressPlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.city')}</label>
                    <input
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm((s: any) => ({ ...s, city: e.target.value }))}
                      placeholder={t('newProperty.cityPlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.agentName')}</label>
                    <input
                      value={editForm.agentName || ''}
                      onChange={(e) => setEditForm((s: any) => ({ ...s, agentName: e.target.value }))}
                      placeholder={t('newProperty.agentNamePlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.agentPhone')}</label>
                    <input
                      value={editForm.agentPhone || ''}
                      onChange={(e) => setEditForm((s: any) => ({ ...s, agentPhone: e.target.value }))}
                      placeholder={t('newProperty.agentPhonePlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">{t('properties.status')}</label>
                  <select
                    value={editForm.status || 'DRAFT'}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, status: e.target.value }))}
                    className={getStatusSelectClass(editForm.status || 'DRAFT')}
                  >
                    <option value="DRAFT" className="bg-yellow-50 text-yellow-800">{language === 'he' ? 'טיוטה' : 'Draft'}</option>
                    <option value="PUBLISHED" className="bg-green-50 text-green-800">{language === 'he' ? 'פורסם' : 'Published'}</option>
                    <option value="ARCHIVED" className="bg-gray-50 text-gray-700">{language === 'he' ? 'ארכיון' : 'Archived'}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">{t('newProperty.price')}</label>
                    <input
                      inputMode="numeric"
                      value={editForm.price || ''}
                      onChange={(e) => setEditForm((s: any) => ({ ...s, price: e.target.value }))}
                      placeholder={t('newProperty.pricePlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">{t('newProperty.rooms')}</label>
                    <input
                      inputMode="numeric"
                      value={editForm.rooms || ''}
                      onChange={(e) => setEditForm((s: any) => ({ ...s, rooms: e.target.value }))}
                      placeholder={t('newProperty.roomsPlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">{t('newProperty.size')}</label>
                    <input
                      inputMode="numeric"
                      value={editForm.size || ''}
                      onChange={(e) => setEditForm((s: any) => ({ ...s, size: e.target.value }))}
                      placeholder={t('newProperty.sizePlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                </div>

                {/* Images for edit */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">{language === 'he' ? 'הוסף תמונות חדשות' : 'Add New Photos'}</label>

                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const list = Array.from(e.target.files || []);
                      if (list.length) {
                        const MAX_FILES = 20;
                        const merged = [...editFiles, ...list]
                          .slice(0, MAX_FILES)
                          .map((f) => {
                            const fp = f as FileWithPreview;
                            if (!fp._preview) fp._preview = URL.createObjectURL(f);
                            return fp;
                          });
                        setEditFiles(merged);
                      }
                      e.currentTarget.value = "";
                    }}
                  />

                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border border-dashed p-6 text-center hover:bg-gray-50 select-none"
                  >
                    <p className="text-sm text-gray-600">
                      {language === 'he' ? 'לחץ או גרור תמונות חדשות כאן' : 'Click or drag new photos here'}
                    </p>
                  </div>

                  {editPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {editFiles.map((f, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={f._preview}
                            alt=""
                            className="w-full h-28 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeEditFile(i); }}
                            className="absolute top-1 left-1 text-xs rounded-full bg-white/90 px-2 py-1 border shadow opacity-0 group-hover:opacity-100 transition"
                            aria-label={language === 'he' ? 'הסר תמונה' : 'Remove photo'}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => !editSaving && setEditProperty(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {language === 'he' ? 'ביטול' : 'Cancel'}
                  </button>
                  <button
                    disabled={editSaving}
                    className="px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-60 transition-all"
                    style={{ backgroundColor: brand.primary }}
                  >
                    {editSaving ? (language === 'he' ? 'שומר...' : 'Saving...') : (language === 'he' ? 'שמור' : 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* ---------- MODAL: NEW PROPERTY (elements copied from your new page) ---------- */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => !saving && setOpen(false)} />
          {/* dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: brand.primary }}>{t('newProperty.title')}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => !saving && setOpen(false)}
                  aria-label={language === 'he' ? 'סגירה' : 'Close'}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.propertyName')} *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder={t('newProperty.propertyNamePlaceholder')}
                    className={inputClass()}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('newProperty.propertyNameRequired')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.address')}</label>
                    <input
                      value={form.address}
                      onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                      placeholder={t('newProperty.addressPlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.city')}</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                      placeholder={t('newProperty.cityPlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.agentName')}</label>
                    <input
                      value={form.agentName}
                      onChange={(e) => setForm((s) => ({ ...s, agentName: e.target.value }))}
                      placeholder={t('newProperty.agentNamePlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.agentPhone')}</label>
                    <input
                      value={form.agentPhone}
                      onChange={(e) => setForm((s) => ({ ...s, agentPhone: e.target.value }))}
                      placeholder={t('newProperty.agentPhonePlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">{t('newProperty.price')}</label>
                    <input
                      inputMode="numeric"
                      value={form.price}
                      onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                      placeholder={t('newProperty.pricePlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">{t('newProperty.rooms')}</label>
                    <input
                      inputMode="numeric"
                      value={form.rooms}
                      onChange={(e) => setForm((s) => ({ ...s, rooms: e.target.value }))}
                      placeholder={t('newProperty.roomsPlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">{t('newProperty.size')}</label>
                    <input
                      inputMode="numeric"
                      value={form.size}
                      onChange={(e) => setForm((s) => ({ ...s, size: e.target.value }))}
                      placeholder={t('newProperty.sizePlaceholder')}
                      className={inputClass()}
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">{t('newProperty.photos')}</label>

                  {/* Hidden input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onFileChange}
                  />

                  {/* Clickable + Dropzone */}
                  <div
                    onClick={onPickFiles}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="cursor-pointer rounded-2xl border border-dashed p-6 text-center hover:bg-gray-50 select-none"
                  >
                    <p className="text-sm text-gray-600">
                      {t('newProperty.photosDropText')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{t('newProperty.photosSupport')}</p>
                  </div>

                  {/* Previews */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {files.map((f, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={f._preview}
                            alt=""
                            className="w-full h-28 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            className="absolute top-1 left-1 text-xs rounded-full bg-white/90 px-2 py-1 border shadow opacity-0 group-hover:opacity-100 transition"
                            aria-label={t('newProperty.removePhoto')}
                          >
                            {t('newProperty.removePhoto')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => !saving && setOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {t('newProperty.cancel')}
                  </button>
                  <button
                    disabled={saving}
                    className="px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-60 transition-all"
                    style={{ backgroundColor: brand.primary }}
                  >
                    {saving ? t('newProperty.saving') : t('newProperty.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <PropertyImport
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={() => {
          load(); // Refresh the properties list
        }}
      />
      </main>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <LanguageProvider>
      <PropertiesPageContent />
    </LanguageProvider>
  );
}