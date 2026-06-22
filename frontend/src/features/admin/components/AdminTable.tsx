import React from 'react';

export interface AdminTableColumn {
  key: string;
  label: string;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  isLoading: boolean;
  emptyIcon?: React.ReactNode;
  emptyText?: string;
}

function AdminTable<T>({
  columns,
  data,
  renderRow,
  keyExtractor,
  isLoading,
  emptyIcon,
  emptyText = 'No data found',
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        {emptyIcon && <div className="text-gray-700 mb-4">{emptyIcon}</div>}
        <p className="text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a2d3a]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <React.Fragment key={keyExtractor(item)}>
              {renderRow(item)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTable;
