// apps/web/app/real-estate/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

type Property = {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  agentName?: string | null;
  agentPhone?: string | null;
};

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/real-estate/properties/${id}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: String(formData.get("name") || ""),
        city: String(formData.get("city") || ""),
        address: String(formData.get("address") || ""),
        agentName: String(formData.get("agentName") || ""),
        agentPhone: String(formData.get("agentPhone") || ""),
        status: String(formData.get("status") || "DRAFT"),
      };
      await apiFetch(`/real-estate/properties/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      router.push("/real-estate/properties");
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!data) return <div className="p-6">Not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-semibold mb-4">עריכת נכס</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2">
          {error}
        </div>
      )}

      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block mb-1">שם הנכס</label>
          <input name="name" defaultValue={data.name} className="w-full border rounded-xl px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">עיר</label>
            <input name="city" defaultValue={data.city ?? ""} className="w-full border rounded-xl px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1">כתובת</label>
            <input name="address" defaultValue={data.address ?? ""} className="w-full border rounded-xl px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">שם סוכן</label>
            <input name="agentName" defaultValue={data.agentName ?? ""} className="w-full border rounded-xl px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1">טלפון סוכן</label>
            <input name="agentPhone" defaultValue={data.agentPhone ?? ""} className="w-full border rounded-xl px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block mb-1">סטטוס</label>
          <select name="status" defaultValue={data.status} className="w-full border rounded-xl px-3 py-2">
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            {saving ? "שומרת…" : "שמור"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-xl border">
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
