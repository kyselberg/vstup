import { Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import { useUniversities } from '../hooks/useUniversities'
import { useUpdateData } from '../hooks/useUpdateData'
import { highlightMe } from '../utils/highlight'
import { Countdown } from './Countdown'

// Define the data structure
interface AdmissionData {
  name: string
  priority: string
  state: string
  marks: string
  type: string
}

interface DashboardCardProps {
  program: {
    id: string,
    data: {
      programName: string
      university: string
      amounts: {
        totalPlaces: string
        contractPlaces: string
        budgetPlaces: string
      }
      table: AdmissionData[]
    }
  }
}

const DashboardCard: React.FC<DashboardCardProps> = ({ program }) => {
  // Find my position in this program
  const myPosition = program.data.table.findIndex(row => highlightMe(row.name)) + 1
  const myData = program.data.table.find(row => highlightMe(row.name))

  // Check if I'm within budget places
  const budgetPlacesCount = parseInt(program.data.amounts.budgetPlaces) || 0
  const isWithinBudget = myPosition > 0 && myPosition <= budgetPlacesCount

  // Calculate total applicants
  const totalApplicants = program.data.table.filter(row => row.state !== '').length

  if (!myData) {
    return (
      <div className="card bg-base-100 shadow-xl border-2 border-base-300">
        <div className="card-body p-4">
          <h3 className="card-title font-bold text-center mb-2 text-lg justify-center">{program.data.programName}</h3>
          <p className="text-sm text-base-content/70 text-center mb-3">{program.data.university}</p>

          <div className="text-center">
            <div className="text-lg font-bold text-error">Не знайдено в списку</div>
            <div className="text-sm text-base-content/70 mt-1">Перевірте дані або спробуйте пізніше</div>
          </div>

          <div className="mt-4 pt-4 border-t border-base-300">
            <div className="grid grid-cols-3 gap-2 text-xs mb-4">
              <div className="text-center">
                <div className="font-semibold">Всього місць</div>
                <div className="text-primary">{program.data.amounts.totalPlaces}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Бюджет</div>
                <div className="text-success">{program.data.amounts.budgetPlaces}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Контракт</div>
                <div className="text-warning">{program.data.amounts.contractPlaces}</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center text-xs text-base-content/70">
              <div>Всього подавших: {totalApplicants}</div>
              {isWithinBudget && (
                <div className="text-success font-medium mt-1">
                  Відставання від останнього бюджетного місця: {budgetPlacesCount - myPosition}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="card-actions justify-center mt-4">
              <Link
                to="/universities/$id"
                params={{ id: program.id }}
                className="btn btn-sm btn-outline"
              >
                Переглянути таблицю
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card shadow-xl border-2 transition-all hover:scale-105 ${isWithinBudget
        ? 'bg-success/10 border-success/30 hover:bg-success/20'
        : 'bg-base-100 border-base-300 hover:bg-base-200'
      }`}>
      <div className="card-body p-4">
        <h3 className="card-title font-bold text-center mb-2 text-lg justify-center">{program.data.programName}</h3>
        <p className="text-sm text-base-content/70 text-center mb-3">{program.data.university}</p>

        {/* Position and Status */}
        <div className="text-center mb-4">
          <div className={`text-4xl font-bold mb-2 ${isWithinBudget ? 'text-success' : 'text-base-content'
            }`}>
            {myPosition}
          </div>
          <div className={`text-sm font-medium ${isWithinBudget ? 'text-success' : 'text-base-content/70'
            }`}>
            {isWithinBudget ? 'ПРОХОДИТЬ НА БЮДЖЕТ! 🎉' : 'Поза бюджетними місцями'}
          </div>
        </div>

        {/* My Details */}
        <div className="bg-base-200 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Мій бал:</span>
              <span className="ml-2 text-primary font-bold">{myData.marks}</span>
            </div>
            <div>
              <span className="font-semibold">Пріоритет:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${myData.priority === 'К'
                  ? 'bg-info/20 text-info border border-info/30'
                  : 'bg-base-300 text-base-content border border-base-300'
                }`}>
                {myData.priority}
              </span>
            </div>
            <div>
              <span className="font-semibold">Тип:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${myData.type === 'Б'
                  ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-warning/20 text-warning border border-warning/30'
                }`}>
                {myData.type === 'Б' ? 'Бюджет' : 'Контракт'}
              </span>
            </div>
            <div>
              <span className="font-semibold">Статус:</span>
              <span className="ml-2">{myData.state}</span>
            </div>
          </div>
        </div>

        {/* Places Information */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-4">
          <div className="text-center">
            <div className="font-semibold">Всього місць</div>
            <div className="text-primary">{program.data.amounts.totalPlaces}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Бюджет</div>
            <div className="text-success">{program.data.amounts.budgetPlaces}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Контракт</div>
            <div className="text-warning">{program.data.amounts.contractPlaces}</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-xs text-base-content/70">
          <div>Всього подавших: {totalApplicants}</div>
          {isWithinBudget && (
            <div className="text-success font-medium mt-1">
              Відставання від останнього бюджетного місця: {budgetPlacesCount - myPosition}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="card-actions justify-center mt-4">
          <Link
            to="/universities/$id"
            params={{ id: program.id }}
            className="btn btn-sm btn-outline"
          >
            Переглянути таблицю
          </Link>
        </div>
      </div>
    </div>
  )
}

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useUniversities()
  const updateMutation = useUpdateData();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleUpdate = () => {
    setShowUpdateModal(true);
    updateMutation.mutate();
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  // Count how many programs I'm within budget for
  const budgetProgramsCount = data?.filter((program) => {
    const myPosition = program.data.table.findIndex(row => highlightMe(row.name)) + 1
    const budgetPlacesCount = parseInt(program.data.amounts.budgetPlaces) || 0
    return myPosition > 0 && myPosition <= budgetPlacesCount
  }).length || 0

  const totalPrograms = data?.length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="">
        <h1 className="text-3xl font-bold text-base-content text-center mb-4">
          Моя панель вступу 2025
        </h1>
        <div className="text-center text-lg text-base-content/70 mb-6">
          Статус по {totalPrograms} програмах
        </div>

        {/* Summary Stats */}
        <div className="stats shadow w-full mb-8">
          <div className="stat">
            <div className="stat-title">Всього програм</div>
            <div className="stat-value text-primary">{totalPrograms}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Проходять на бюджет</div>
            <div className="stat-value text-success">{budgetProgramsCount}</div>
            <div className="stat-desc">
              {budgetProgramsCount > 0 ? '🎉 Вітаємо!' : 'Потрібно покращити результати'}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Поза бюджетом</div>
            <div className="stat-value text-warning">{totalPrograms - budgetProgramsCount}</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Countdown />
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data?.map((program) => (
          <DashboardCard key={program.id} program={program} />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="text-center text-sm text-base-content/70 mt-4">
        <p>Натисніть на картку програми для детального перегляду</p>
      </div>

      {/* Refresh Data Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleUpdate}
          disabled={updateMutation.isPending}
          className="btn btn-outline btn-secondary"
        >
          {updateMutation.isPending ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Оновлення...
            </>
          ) : (
            '🔄 Оновити дані'
          )}
        </button>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="modal modal-open">
          <div className="modal-box text-center">
            <div className="mb-6">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
            <h3 className="font-bold text-lg mb-4">Оновлення даних</h3>
            <p className="text-base-content/70 mb-2">
              Оновлення триває до хвилини.
            </p>
            <p className="text-base-content/70">
              Сторінка оновиться автоматично, коли дані будуть готові.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
