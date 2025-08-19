import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// styles
import './index.css'

// routes
import { routeTree } from './routeTree.gen'

// sse
import './sse'

// create router
const router = createRouter({ routeTree, defaultPreload: 'intent', scrollRestoration: true, })

// register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
