import { NextResponse } from 'next/server';

export async function GET() {
  const csv = 'clientName,email,phone,propertyType,city,budgetMin,budgetMax,source,status,notes\n';
  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="real-estate-leads-template.csv"',
    },
  });
}
