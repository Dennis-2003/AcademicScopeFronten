import { Download } from 'lucide-react';

function csvEscape(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function exportToCSV({ headers, data, filename = 'reporte.csv' }) {
  const headerRow = headers.map(h => csvEscape(h.label)).join(',');
  const rows = data.map(row =>
    headers.map(h => csvEscape(h.accessor ? row[h.accessor] : row[h.key])).join(',')
  );
  const csv = [headerRow, ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButton({ headers, data, filename, label = 'Exportar CSV' }) {
  return (
    <button
      onClick={() => exportToCSV({ headers, data, filename })}
      className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
    >
      <Download size={16} />
      {label}
    </button>
  );
}
