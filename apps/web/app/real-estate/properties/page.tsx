"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

type Row = {
  id: string;
  name: string;           // <-- היה title, מחליפים ל-name
  city?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  publishedAt?: string | null;
  slug?: string | null;
  agentPhone?: string | null;
};

type FileWithPreview = File & { _preview?: string };

const brand = { primary: "#0a3d91", hover: "#124bb5" };

function inputClass(extra = "") {
  return [
    "w-full border rounded-xl px-3 py-2 outline-none",
    "focus:ring focus:ring-gray-200",
    "placeholder:text-gray-400",
    "invalid:border-red-500 invalid:focus:ring-red-200",
    extra,
  ].join(" ");
}

export default function PropertiesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>(""); // "", "DRAFT", "PUBLISHED", "ARCHIVED"
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", address: "", city: "",
    agentName: "", agentPhone: "0587878676",
    price: "", bedrooms: "", bathrooms: "", areaSqm: ""
  });
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ---------- TABLE LOAD (via apiFetch → unified base + headers) ----------
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const data = await apiFetch(`/real-estate/properties?${params.toString()}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);
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

  const previews = useMemo(() => files.map((f) => f._preview!), [files]);

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
          bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          areaSqm: form.areaSqm ? Number(form.areaSqm) : undefined,
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
      setForm({ name: "", address: "", city: "", agentName: "", agentPhone: "0587878676", price: "", bedrooms: "", bathrooms: "", areaSqm: "" });
      setFiles([]);
      await load();
    } catch (err: any) {
      setError(err?.message || "שמירה נכשלה. נסי שוב או בדקי את החיבור לשרת.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.main
      dir="rtl"
      className="p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold" style={{ color: brand.primary }}>
        נכסים <span className="text-gray-500 text-lg font-normal">({total ?? rows.length})</span>
        </h1>



        <div className="flex gap-3">
          <input
            dir="rtl"
            className="border rounded-xl px-3 py-2 w-56 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
            style={{ ["--brand" as any]: brand.primary }}
            placeholder="חיפוש לפי שם/עיר…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border rounded-xl px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            title="סטטוס"
          >
            <option value="">כל הסטטוסים</option>
            <option value="DRAFT">טיוטה</option>
            <option value="PUBLISHED">פורסם</option>
            <option value="ARCHIVED">ארכיון</option>
          </select>

          <button
            onClick={() => setOpen(true)}
            className="px-5 py-2 rounded-xl text-white font-semibold shadow-md transition"
            style={{ backgroundColor: brand.primary }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = brand.hover)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = brand.primary)}
          >
            + נכס חדש
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-2xl border bg-white shadow-xl overflow-hidden">
        <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50">רשימת נכסים</div>

        {error && <div className="p-4 text-red-600">{error}</div>}
        {loading ? (
          <div className="p-6 text-gray-500">טוען…</div>
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
                  <th className="p-3 font-medium">שם</th>
                  <th className="p-3 font-medium">עיר</th>
                  <th className="p-3 font-medium">טלפון סוכן</th>
                  <th className="p-3 font-medium">סטטוס</th>
                  <th className="p-3 font-medium">פורסם</th>
                  <th className="p-3 font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-3 font-semibold truncate">{r.name}</td>
                      <td className="p-3 truncate">{r.city || "-"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{r.agentPhone || "-"}</span>
                          {r.agentPhone ? (
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(r.agentPhone!)}
                              className="px-2 py-1 text-xs rounded-md border hover:bg-gray-100 transition"
                              title="העתק"
                            >
                              העתק
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className="px-2 py-1 rounded-lg text-xs"
                          style={{
                            background:
                              r.status === "PUBLISHED" ? "#E8F5E9" : r.status === "DRAFT" ? "#FFF8E1" : "#ECEFF1",
                            color:
                              r.status === "PUBLISHED" ? "#2E7D32" : r.status === "DRAFT" ? "#8D6E63" : "#455A64",
                          }}
                        >
                          {r.status || "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString("he-IL") : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          <a
                            href={`/real-estate/properties/${r.id}/edit`}
                            className="underline hover:opacity-80"
                            style={{ color: brand.primary }}
                          >
                            עריכה
                          </a>
                          {r.slug ? (
                            <a
                              href={`/p/${r.slug}`}
                              target="_blank"
                              className="underline hover:opacity-80"
                              style={{ color: brand.primary }}
                              rel="noreferrer"
                            >
                              צפייה
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-8 text-gray-500" colSpan={6}>
                      אין עדיין נכסים. לחצי “נכס חדש” כדי להוסיף.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- MODAL: NEW PROPERTY (elements copied from your new page) ---------- */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => !saving && setOpen(false)} />
          {/* dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: brand.primary }}>נכס חדש</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => !saving && setOpen(false)}
                  aria-label="סגירה"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-5 space-y-6" dir="rtl">
                <div>
                  <label className="block text-sm font-medium mb-1">שם הנכס *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="לדוגמה: דירת 4 חד׳ ברח׳ ויצמן"
                    className={inputClass()}
                  />
                  <p className="text-xs text-gray-500 mt-1">שדה חובה. השדה יסומן באדום אם חסר.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">כתובת</label>
                    <input
                      value={form.address}
                      onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                      placeholder="לדוגמה: ויצמן 12"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">עיר</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                      placeholder="תל אביב / חיפה / ..."
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">שם הסוכן</label>
                    <input
                      value={form.agentName}
                      onChange={(e) => setForm((s) => ({ ...s, agentName: e.target.value }))}
                      placeholder="שם מלא"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">טלפון סוכן</label>
                    <input
                      value={form.agentPhone}
                      onChange={(e) => setForm((s) => ({ ...s, agentPhone: e.target.value }))}
                      placeholder="לדוגמה: 0587878676"
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">מחיר</label>
                    <input
                      inputMode="numeric"
                      value={form.price}
                      onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                      placeholder="מספר"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">חדרים</label>
                    <input
                      inputMode="numeric"
                      value={form.bedrooms}
                      onChange={(e) => setForm((s) => ({ ...s, bedrooms: e.target.value }))}
                      placeholder="מספר"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">אמבטיות</label>
                    <input
                      inputMode="numeric"
                      value={form.bathrooms}
                      onChange={(e) => setForm((s) => ({ ...s, bathrooms: e.target.value }))}
                      placeholder="מספר"
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">מ״ר</label>
                  <input
                    inputMode="numeric"
                    value={form.areaSqm}
                    onChange={(e) => setForm((s) => ({ ...s, areaSqm: e.target.value }))}
                    placeholder="מספר"
                    className={inputClass()}
                  />
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">תמונות הנכס</label>

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
                      גררי תמונות לכאן או <span className="underline">לחצי לבחירת קבצים</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">תמכי עד 20 תמונות בבת אחת</p>
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
                            aria-label="הסרה"
                          >
                            הסרה
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
                    className="text-gray-600 hover:underline"
                  >
                    ביטול
                  </button>
                  <button
                    disabled={saving}
                    className="bg-black text-white px-5 py-2 rounded-xl disabled:opacity-60"
                  >
                    {saving ? "שומר..." : "שמור נכס"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.main>
  );
}
