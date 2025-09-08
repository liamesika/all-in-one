import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getLead(id: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? process.env.API_BASE ?? 'http://localhost:4000';
  const res = await fetch(`${apiBase}/api/leads/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  return res.json();
}

// עזר לנירמול טלפון לקישור WhatsApp
function normalizePhone(phone?: string | null) {
  if (!phone) return '';
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('0')) d = '+972' + d.slice(1);
  else if (!d.startsWith('+')) d = '+' + d;
  return d;
}

export default async function LeadPage({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id);

  if (!lead) {
    return (
      <section className="p-6 space-y-4">
        <Link href="/e-commerce/leads" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">← Back</Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">Lead not found.</div>
      </section>
    );
  }

  const phoneNorm = lead.phoneNorm || normalizePhone(lead.phone);

  return (
    <section className="p-6 space-y-4">
      <Link href="/e-commerce/leads" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">← Back</Link>
      <h1 className="text-2xl font-semibold">Lead Details</h1>

      <div className="rounded-xl border border-gray-200 p-6 space-y-3">
        <p><strong>ID:</strong> {lead.id}</p>
        <p><strong>Name:</strong> {lead.name ?? '-'}</p>
        <p><strong>Email:</strong> {lead.email ?? '-'}</p>
        <p><strong>Phone:</strong> {lead.phone ?? '-'}</p>
        <p><strong>Interest:</strong> {lead.interest ?? '-'}</p>
        <p><strong>Budget:</strong> {lead.budget ?? '-'}</p>
        <p><strong>Score:</strong> {lead.score ?? 0}</p>
        <p><strong>Bucket:</strong> {lead.bucket ?? '-'}</p>
        <p><strong>Status:</strong> {lead.status ?? '-'}</p>
        <p><strong>Source:</strong> {lead.source ?? '-'}</p>
        <p><strong>Created:</strong> {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '-'}</p>

        <div className="flex gap-3">
          <a
            href={phoneNorm ? `https://wa.me/${phoneNorm}?text=${encodeURIComponent(`Hello ${lead.name ?? ''}`)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-lg px-4 py-2 text-white ${phoneNorm ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            WhatsApp
          </a>
          <button
            disabled
            title="Coming soon"
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700"
          >
            Delete (soon)
          </button>
        </div>
      </div>
    </section>
  );
}
