export interface ExportColumn {
  key: string;
  label: string;
}

export function exportToExcelFile(
  rows: Record<string, string>[],
  columns: ExportColumn[],
  filename: string
): void {
  if (rows.length === 0 || columns.length === 0) {
    return;
  }

  const header = columns.map((column) => escapeCsv(column.label)).join(',');
  const body = rows
    .map((row) =>
      columns.map((column) => escapeCsv(row[column.key] ?? '')).join(',')
    )
    .join('\n');

  const csv = `\uFEFF${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string): string {
  const normalized = value.replace(/"/g, '""');
  if (/[",\n\r]/.test(normalized)) {
    return `"${normalized}"`;
  }
  return normalized;
}
