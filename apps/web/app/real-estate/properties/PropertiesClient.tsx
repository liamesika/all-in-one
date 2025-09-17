"use client";

import Link from "next/link";
// Temporary fallback: replaced framer-motion for Vercel build compatibility
// import { motion } from "framer-motion";
import { ArrowUp, Phone } from "lucide-react"

const brand = {
  primary: "#0a3d91",
  primaryHover: "#124bb5",
};

export default function PropertiesClient({ initialData }: { initialData: any[] }) {
  return (
    <main className="p-8 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold" style={{ color: brand.primary }}>
          נכסים
        </h1>

        <Link
          href="/real-estate/properties/new"
          className="px-5 py-3 rounded-xl text-white font-semibold shadow-md transition"
          style={{ backgroundColor: brand.primary }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = brand.primaryHover)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = brand.primary)}
        >
          + נכס חדש
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border bg-white shadow-xl overflow-hidden">
        <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50">רשימת נכסים</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="text-sm text-gray-600">
              <tr className="bg-gray-50">
                <th className="p-3 font-medium">שם</th>
                <th className="p-3 font-medium">עיר</th>
                <th className="p-3 font-medium">סטטוס</th>
                <th className="p-3 font-medium">פורסם</th>
                <th className="p-3 font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {initialData.length > 0 ? (
                initialData.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-semibold">{r.name}</td>
                    <td className="p-3">{r.city || "-"}</td>
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
                      <div className="flex gap-3 justify-end">
                        <Link
                          href={`/real-estate/properties/${r.id}/edit`}
                          className="underline hover:opacity-80"
                          style={{ color: brand.primary }}
                        >
                          עריכה
                        </Link>
                        {r.slug ? (
                          <a
                            href={`/p/${r.slug}`}
                            target="_blank"
                            className="underline hover:opacity-80"
                            style={{ color: brand.primary }}
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
                  <td className="p-8 text-gray-500" colSpan={5}>
                    אין עדיין נכסים. לחצי “נכס חדש” כדי להוסיף.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
