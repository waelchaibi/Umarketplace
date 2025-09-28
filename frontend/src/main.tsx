import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<string>(() => localStorage.getItem('theme') || 'light')
  React.useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const ThemeContext = React.createContext<{ theme: string; setTheme: (t: string) => void }>({ theme: 'light', setTheme: () => {} })

type AuthState = { token: string | null; role: string | null; userId: string | null; username: string | null }
export const AuthContext = React.createContext<{ auth: AuthState; setAuth: React.Dispatch<React.SetStateAction<AuthState>> }>({ auth: { token: null, role: null, userId: null, username: null }, setAuth: () => {} })

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<AuthState>({ token: null, role: null, userId: null, username: null })
  React.useEffect(() => {
    setAuth({
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role'),
      userId: localStorage.getItem('userId'),
      username: localStorage.getItem('username'),
    })
  }, [])
  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>
}

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
