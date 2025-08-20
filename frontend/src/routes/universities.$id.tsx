import { createFileRoute, Link } from '@tanstack/react-router'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import React, { useMemo } from 'react'
import { useUniversitiesDetails } from '../hooks/useUniversitiesDetails'
import { useUniversity } from '../hooks/useUniversity'
import { highlightMe } from '../utils/highlight'

// Define the data structure
interface AdmissionData {
  name: string
  priority: string
  state: string
  marks: string
  type: string
}

type TableDataType = AdmissionData & {otherBudgetPrograms: {university: string, program: string}[]};

const columnHelper = createColumnHelper<TableDataType>()

const columns = [
  columnHelper.display({
    id: 'position',
    header: '№',
    cell: info => info.row.index + 1,
  }),
  columnHelper.accessor('name', {
    header: 'ПІБ',
    cell: info => (
      <div className="flex items-center gap-1">
        <span>{info.getValue()}</span>
        {info.row.original.otherBudgetPrograms.length > 0 && (
          <div className="tooltip tooltip-bottom" data-tip={`Проходить на бюджет в іншій програмі: ${info.row.original.otherBudgetPrograms.map(p => p.program).join(' • ')}`}>
            <svg className="w-4 h-4 text-info cursor-help" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    ),
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
  amounts: { totalPlaces: string; contractPlaces: string; budgetPlaces: string };
  tableData: TableDataType[];
}> = ({ amounts, tableData }) => {
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="card bg-base-100 shadow-xl border-2 border-base-300">
      <div className="">
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
                const contractPlacesCount = parseInt(amounts.contractPlaces) || 0;
                const isWithinContractPlaces = (row.index + 1) > budgetPlacesCount && (row.index + 1) <= (budgetPlacesCount + contractPlacesCount);

                const bg = `${
                      isHighlighted
                        ? 'bg-primary/10 hover:bg-primary/20'
                        : isWithinBudgetPlaces
                        ? 'bg-success/10 hover:bg-success/20'
                        : isWithinContractPlaces
                        ? 'bg-warning/10 hover:bg-warning/20'
                        : 'hover:bg-base-200'
                    }`

                  const border = `${
                      isWithinBudgetPlaces
                        ? 'border-l-success'
                        : isWithinContractPlaces
                        ? 'border-l-warning'
                        : ''
                    }`

                    const borderWidth = `${
                      isHighlighted
                        ? 'border-l-6'
                        : isWithinBudgetPlaces
                        ? 'border-l-2'
                        : isWithinContractPlaces
                        ? 'border-l-2'
                        : ''
                    }`

                return (
                  <tr
                    key={row.id}
                    className={bg + ' ' + border + ' ' + borderWidth}
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
  const {data: details = {}} = useUniversitiesDetails(id);

  const tableData = useMemo<TableDataType[]>(() => {
    return university?.data.table.map(data => ({...data, otherBudgetPrograms: details[data.name] ?? []})) ?? [];
  }, [university, details]);


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

        <IndividualAdmissionTable
          amounts={university.data.amounts}
          tableData={tableData}
        />
      </div>
    </div>
  )
}
