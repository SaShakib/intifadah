'use client';

import { isValidElement, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, RotateCcw, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type SortDirection = 'asc' | 'desc';
type SortValue = number | string | null | undefined;

export interface DataTableColumn {
  header: string;
  className?: string;
  cellClassName?: string;
  sortable?: boolean;
  hideOnMobile?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableRow {
  id?: string;
  cells: ReactNode[];
  searchText?: string;
  sortValues?: SortValue[];
  tabValue?: string;
  filterValues?: Record<string, string>;
  className?: string;
  onClick?: () => void;
}

export interface DataTableTab {
  value: string;
  label: string;
  count?: number;
  tone?: 'default' | 'danger';
}

export interface DataTableFilter {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface DataTableProps {
  headers: Array<string | DataTableColumn>;
  rows: ReactNode[][] | DataTableRow[];
  tabs?: DataTableTab[];
  filters?: DataTableFilter[];
  initialTab?: string;
  enableSearch?: boolean;
  enableSort?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

const BN_TO_EN: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

function nodeToText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(nodeToText).join(' ');
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    return nodeToText(element.props.children);
  }

  return '';
}

function normalizeNumber(value: string) {
  const converted = value.replace(/[০-৯]/g, (digit) => BN_TO_EN[digit] ?? digit);
  const parsed = Number(converted.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function compareValues(a: SortValue, b: SortValue) {
  const aText = String(a ?? '');
  const bText = String(b ?? '');
  const aNumber = typeof a === 'number' ? a : normalizeNumber(aText);
  const bNumber = typeof b === 'number' ? b : normalizeNumber(bText);

  if (aNumber !== null && bNumber !== null) {
    return aNumber - bNumber;
  }

  return aText.localeCompare(bText, 'bn-BD', { numeric: true, sensitivity: 'base' });
}

function isTableRow(row: ReactNode[] | DataTableRow): row is DataTableRow {
  return !Array.isArray(row) && 'cells' in row;
}

function alignClass(align?: DataTableColumn['align']) {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
}

export function DataTable({
  headers,
  rows,
  tabs,
  filters = [],
  initialTab,
  enableSearch,
  enableSort = true,
  searchPlaceholder = 'খুঁজুন...',
  emptyMessage = 'কোনো তথ্য পাওয়া যায়নি',
  className,
}: DataTableProps) {
  const columns = useMemo(
    () =>
      headers.map((header) =>
        typeof header === 'string'
          ? { header }
          : header,
      ),
    [headers],
  );
  const normalizedRows = useMemo(
    () =>
      rows.map((row, index) => {
        if (isTableRow(row)) {
          return {
            ...row,
            id: row.id ?? `row-${index}`,
            searchText: row.searchText ?? row.cells.map(nodeToText).join(' '),
            sortValues: row.sortValues ?? row.cells.map(nodeToText),
          };
        }

        return {
          id: `row-${index}`,
          cells: row,
          searchText: row.map(nodeToText).join(' '),
          sortValues: row.map(nodeToText),
        };
      }),
    [rows],
  );
  const shouldSearch = enableSearch ?? normalizedRows.length > 3;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab ?? tabs?.[0]?.value ?? '');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortState, setSortState] = useState<{ index: number; direction: SortDirection } | null>(null);

  const filteredRows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const nextRows = normalizedRows.filter((row) => {
      const matchesTab = !tabs?.length || activeTab === 'all' || row.tabValue === activeTab;
      const matchesSearch = !search || row.searchText.toLowerCase().includes(search);
      const matchesFilters = filters.every((filter) => {
        const selected = filterValues[filter.id];
        return !selected || row.filterValues?.[filter.id] === selected;
      });

      return matchesTab && matchesSearch && matchesFilters;
    });

    if (!sortState) {
      return nextRows;
    }

    return [...nextRows].sort((a, b) => {
      const result = compareValues(a.sortValues?.[sortState.index], b.sortValues?.[sortState.index]);
      return sortState.direction === 'asc' ? result : -result;
    });
  }, [activeTab, filterValues, filters, normalizedRows, searchTerm, sortState, tabs?.length]);

  const hasControls = shouldSearch || Boolean(tabs?.length) || filters.length > 0;
  const isDirty = Boolean(searchTerm) || Object.values(filterValues).some(Boolean) || sortState !== null;

  const toggleSort = (index: number) => {
    const column = columns[index];
    if (!enableSort || column.sortable === false) {
      return;
    }

    setSortState((current) => {
      if (!current || current.index !== index) {
        return { index, direction: 'asc' };
      }

      if (current.direction === 'asc') {
        return { index, direction: 'desc' };
      }

      return null;
    });
  };

  const resetControls = () => {
    setSearchTerm('');
    setFilterValues({});
    setSortState(null);
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-white', className)}>
      {hasControls && (
        <div className="space-y-3 border-b border-border bg-white p-3">
          {tabs?.length ? (
            <div className="overflow-x-auto">
              <div className="flex min-w-max border-b-2 border-border">
                {tabs.map((tab) => {
                  const count = tab.count ?? normalizedRows.filter((row) => tab.value === 'all' || row.tabValue === tab.value).length;
                  const active = activeTab === tab.value;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      className={cn(
                        '-mb-0.5 border-b-2 px-4 py-2 text-sm font-semibold transition',
                        active ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-fg-2',
                      )}
                    >
                      {tab.label}
                      <span className={cn('ml-1 text-[11px]', tab.tone === 'danger' ? 'text-danger' : 'text-muted')}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {shouldSearch && (
              <label className="relative min-w-44 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-fg outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand-light"
                />
              </label>
            )}

            {filters.map((filter) => (
              <select
                key={filter.id}
                value={filterValues[filter.id] ?? ''}
                onChange={(event) => setFilterValues((current) => ({ ...current, [filter.id]: event.target.value }))}
                className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-fg outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-light"
                aria-label={filter.label}
              >
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}

            {isDirty && (
              <button
                type="button"
                onClick={resetControls}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-fg-2 transition hover:bg-surface-2"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                রিসেট
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white text-sm">
          <thead className="bg-surface-2 text-xs font-semibold uppercase text-muted">
            <tr>
              {columns.map((column, columnIndex) => {
                const active = sortState?.index === columnIndex;
                const sortable = enableSort && column.sortable !== false;
                const Icon = active ? (sortState.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

                return (
                  <th
                    key={`${column.header}-${columnIndex}`}
                    className={cn(
                      'border-b-2 border-border px-4 py-3 align-middle font-semibold',
                      alignClass(column.align),
                      column.hideOnMobile && 'hidden md:table-cell',
                      column.className,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(columnIndex)}
                        className={cn('inline-flex items-center gap-1.5 rounded text-xs font-semibold uppercase text-muted transition hover:text-fg-2', column.align === 'right' && 'ml-auto')}
                      >
                        {column.header}
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="text-fg">
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={row.onClick}
                  className={cn(
                    'border-b border-border transition last:border-b-0 hover:bg-surface-2/70',
                    row.onClick && 'cursor-pointer',
                    row.className,
                  )}
                >
                  {row.cells.map((cell, cellIndex) => {
                    const column = columns[cellIndex];

                    return (
                      <td
                        key={`${row.id}-cell-${cellIndex}`}
                        className={cn(
                          'px-4 py-3 align-middle',
                          alignClass(column?.align),
                          column?.hideOnMobile && 'hidden md:table-cell',
                          column?.cellClassName,
                        )}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
