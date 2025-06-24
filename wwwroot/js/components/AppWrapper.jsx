import React from 'react'
import { SnackbarProvider } from 'notistack'

export default function AppWrapper({ children }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      preventDuplicate
    >
      {children}
    </SnackbarProvider>
  )
}
