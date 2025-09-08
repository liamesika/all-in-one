// apps/web/app/webapi/leads/sample/route.ts
function escapeCsv(cell: string) {
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

export async function GET() {
  const headersRow = ['name','email','phone','interest','budget','source','notes'];
  const rows = [
    ['Dana Cohen','dana@example.com','050-1234567','ecommerce','15000','csv','מעוניינת בחנות חדשה'],
    ['Yossi Levi','yossi@example.com','+972501112233','real_estate','','ad_campaign','לחזור אלי בערב'],
  ];

  const BOM = '\ufeff'; // כדי שייפתח טוב באקסל
  const csv = [
    BOM + headersRow.join(','),
    ...rows.map(r => r.map(c => escapeCsv(String(c ?? ''))).join(',')),
  ].join('\n') + '\n';

  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="leads-sample.csv"',
      'cache-control': 'no-store',
    },
  });
}
