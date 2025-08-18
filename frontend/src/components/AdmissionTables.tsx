import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import React from 'react'
import z from 'zod'

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

// Navigation Menu Component
const NavigationMenu: React.FC<{ programs: Array<{ id: string; title: string; subtitle: string }> }> = ({ programs }) => {
  const scrollToTable = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-base-100 shadow-lg border-b-2 border-base-300 mb-6">
      <div className="container mx-auto px-4 py-4">
        <h2 className="text-lg font-semibold mb-3 text-center">Навігація по програмах</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {programs.map((program) => (
            <button
              key={program.id}
              onClick={() => scrollToTable(program.id)}
              className="btn btn-sm btn-outline hover:btn-primary transition-colors"
            >
              {program.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdmissionTable: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  amounts: { totalPlaces: string; contractPlaces: string; budgetPlaces: string };
  tableData: AdmissionData[];
}> = ({ id, title, subtitle, amounts, tableData }) => {
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
    <div id={id} className="card bg-base-100 shadow-xl border-2 border-base-300 scroll-mt-20">
      <div className="card-body p-4">
        <h3 className="card-title font-bold text-center mb-2">{title}</h3>
        <p className="text-sm  text-base-content/70 mb-3">{subtitle}</p>

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

export const AdmissionTables: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admission-data'],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await fetch('/api/universities')
      const data = await response.json()
      const schema = z.object({
        universities: z.object({
          website: z.string(),
          url: z.string().url(),
          timestamp: z.string().datetime(),
          data: z.object({
            amounts: z.object({
              totalPlaces: z.string(),
              contractPlaces: z.string(),
              budgetPlaces: z.string()
            }),
            table: z.array(z.object({
              name: z.string(),
              priority: z.string(),
              state: z.string(),
              marks: z.string(),
              type: z.string()
            })),
            university: z.string(),
            speciality: z.string(),
            programName: z.string()
          })
        }).array()
      })

      const parsedData = schema.parse(data);
      return parsedData;
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/get-unis', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to update data')
      }
      return response.json()
    },
    onSuccess: () => {
      // Reload the page on success
      window.location.reload()
    },
    onError: (error) => {
      console.error('Update failed:', error)
      alert('Failed to update data. Please try again.')
    }
  })

  const handleUpdate = () => {
    updateMutation.mutate()
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  // Create navigation data
  const navigationPrograms = data?.universities.map((program, index) => ({
    id: `program-${index}`,
    title: program.data.programName,
    subtitle: program.data.university
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">
          Вступні бали 2025
        </h1>
        <button
          onClick={handleUpdate}
          disabled={updateMutation.isPending}
          className="btn btn-primary"
        >
          {updateMutation.isPending ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Оновлення...
            </>
          ) : (
            'Оновити дані'
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <NavigationMenu programs={navigationPrograms} />

      <div className="">
        {data?.universities.map((program, index) => (
          <AdmissionTable
            key={index}
            id={`program-${index}`}
            title={program.data.programName}
            subtitle={program.data.university}
            amounts={program.data.amounts}
            tableData={program.data.table}
          />
        ))}
      </div>
    </div>
  )
}
