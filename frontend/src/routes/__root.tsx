import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Countdown } from '../components/Countdown'

export const Route = createRootRoute({
  component: () => (
    <>
      {/* Fixed Countdown in Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <Countdown />
      </div>

      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})