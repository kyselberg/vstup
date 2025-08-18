import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/Dashboard'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return  (
    <div className="min-h-screen bg-base-200">
      <Dashboard />
    </div>
  )
}
