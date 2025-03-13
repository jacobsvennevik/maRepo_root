// app/layout.tsx (Server Component)
import { QueryProvider } from '@/components/QueryProvider'

/**
 * RootLayout is a server component that provides the base HTML structure 
 * for the application. It wraps its children with the QueryProvider to 
 * manage server state using React Query. This component is typically used 
 * at the top level of the application to ensure consistent layout and 
 * state management across pages.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components to be 
 * rendered within the layout.
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
