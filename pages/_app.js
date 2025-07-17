import '../styles/globals.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}