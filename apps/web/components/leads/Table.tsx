'use client';
import React from 'react';

type Column = { key: string; label: string };
type Props = {
  columns: Column[];
  rows: any[];
};

export default function LeadsTable({ columns, rows }: Props) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full text-right">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2 text-sm font-medium text-gray-600 border-b">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2 border-b text-sm">
                    {String(row[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-sm text-gray-500" colSpan={columns.length}>
                אין נתונים להציג.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
