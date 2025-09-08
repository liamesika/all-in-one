'use client';
export default function KpiCards({ data }:{ data: any }) {
  if (!data) return null;
  const items = [
    { label: 'Jobs (total)',  value: data.total ?? 0 },
    { label: 'Success',       value: data.success ?? 0 },
    { label: 'Failed',        value: data.failed ?? 0 },
    { label: 'Shopify CSVs',  value: data.csvsGenerated ?? 0 },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((k)=>(
        <div key={k.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs opacity-70">{k.label}</div>
          <div className="text-2xl font-semibold mt-1">{k.value}</div>
        </div>
      ))}
    </div>
  );
}
