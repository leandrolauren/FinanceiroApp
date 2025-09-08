import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
} from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const AppThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme')
    // Define o tema escuro como padrão
    return savedTheme || 'dark'
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('app-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          ...(theme === 'dark'
            ? {
                background: {
                  paper: '#0c1e35',
                  default: '#040d1a',
                },
                text: {
                  primary: '#e0e0e0',
                  secondary: '#8a99af',
                },
                divider: 'rgba(255, 255, 255, 0.12)',
              }
            : {
                background: {
                  default: '#dfefffff',
                },
              }),
        },
      }),
    [theme],
  )

  const value = {
    theme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
