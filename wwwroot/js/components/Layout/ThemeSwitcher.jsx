import React from 'react'
import { Button } from '@heroui/react'
import { useTheme } from '../../contexts/ThemeContext'

const SunIcon = (props) => (
  <svg
    {...props}
    aria-hidden="true"
    focusable="false"
    role="presentation"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const MoonIcon = (props) => (
  <svg
    {...props}
    aria-hidden="true"
    focusable="false"
    role="presentation"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button isIconOnly variant="light" onClick={toggleTheme}>
      {theme === 'light' ? (
        <SunIcon width={22} height={22} />
      ) : (
        <MoonIcon width={22} height={22} />
      )}
    </Button>
  )
}
