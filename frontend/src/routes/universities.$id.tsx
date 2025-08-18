import { createFileRoute, Link } from '@tanstack/react-router'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import React from 'react'
import { Countdown } from '../components/Countdown'
import { useUniversity } from '../hooks/useUniversity'

const highlightMe = (name: string) => {
  return name === 'Кисельов І. О.';
}

// Define the data structure
interface AdmissionData {
  name: string
  priority: string
  state: string
  marks: string
  type: string
}

const columnHelper = createColumnHelper<AdmissionData>()

const columns = [
  columnHelper.display({
    id: 'position',
    header: '№',
    cell: info => info.row.index + 1,
  }),
  columnHelper.accessor('name', {
    header: 'ПІБ',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('marks', {
    header: 'Бал',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('priority', {
    header: 'П',
    cell: info => {
      const priority = info.getValue();
      const isContract = priority === 'К';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isContract
            ? 'bg-info/20 text-info border border-info/30'
            : 'bg-base-200 text-base-content border border-base-300'
        }`}>
          {priority}
        </span>
      );
    },
  }),
  columnHelper.accessor('type', {
    header: 'Тип',
    cell: info => {
      const type = info.getValue();
      const isBudget = type === 'Б';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isBudget
            ? 'bg-success/20 text-success border border-success/30'
            : 'bg-warning/20 text-warning border border-warning/30'
        }`}>
          {isBudget ? 'Бюджет' : 'Контракт'}
        </span>
      );
    },
  }),
  columnHelper.accessor('state', {
    header: 'Статус',
    cell: info => info.getValue(),
  }),
]

const IndividualAdmissionTable: React.FC<{
  title: string;
  subtitle: string;
  amounts: { totalPlaces: string; contractPlaces: string; budgetPlaces: string };
  tableData: AdmissionData[];
}> = ({ title, subtitle, amounts, tableData }) => {
  const table = useReactTable({
    data: tableData
      .filter(row => row.state !== '')
      .sort((a, b) => {
        // Sort budget applicants first, then contract applicants
        if (a.type === 'Б' && b.type === 'К') return -1;
        if (a.type === 'К' && b.type === 'Б') return 1;
        return 0;
      }),
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="card bg-base-100 shadow-xl border-2 border-base-300">
      <div className="card-body p-4">
        <h3 className="card-title font-bold text-center mb-2">{title}</h3>
        <p className="text-sm text-base-content/70 mb-3">{subtitle}</p>

        {/* Amounts information */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          <div className="text-center">
            <div className="font-semibold">Всього</div>
            <div className="text-primary">{amounts.totalPlaces}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Бюджет</div>
            <div className="text-success">{amounts.budgetPlaces}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Контракт</div>
            <div className="text-warning">{amounts.contractPlaces}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-xs w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="bg-base-200 first-of-type:rounded-tl last-of-type:rounded-tr px-2 py-1 text-center text-xs">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => {
                const isHighlighted = highlightMe(row.getValue('name'));
                const isBudget = row.getValue('type') === 'Б';
                const budgetPlacesCount = parseInt(amounts.budgetPlaces) || 0;
                const isWithinBudgetPlaces = isBudget && (row.index + 1) <= budgetPlacesCount;

                return (
                  <tr
                    key={row.id}
                    className={`${
                      isHighlighted
                        ? 'bg-primary/10 border-l-4 border-l-primary hover:bg-primary/20'
                        : isWithinBudgetPlaces
                        ? 'bg-success/10 border-l-2 border-l-success hover:bg-success/20'
                        : 'hover:bg-base-200'
                    }`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="text-center px-2 py-1 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/universities/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();

  const { university, isLoading, error } = useUniversity(id)
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  if (!university) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error mb-4">Таблицю не знайдено</h1>
          <Link to="/" className="btn btn-primary">Повернутися на головну</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="btn btn-outline btn-sm mb-4">
            ← Повернутися на головну
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-base-content">
              {university.data.programName}
            </h1>
            {university.url && (
              <a
                href={university.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-sm btn-outline"
                title="Відкрити оригінальну сторінку"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
          <p className="text-lg text-base-content/70 mt-2">
            {university.data.university}
          </p>
        </div>

        <div className="mb-8">
          <Countdown />
        </div>

        <IndividualAdmissionTable
          title={university.data.programName}
          subtitle={university.data.university}
          amounts={university.data.amounts}
          tableData={university.data.table}
        />
      </div>
    </div>
  )
}
