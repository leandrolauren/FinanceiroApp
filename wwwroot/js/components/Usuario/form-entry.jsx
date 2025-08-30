import React from 'react'
import { createRoot } from 'react-dom/client'
import FormRegister from './FormRegister'
import { SnackbarProvider } from 'notistack'
import Notifcacao from '../Shared/Notificacao'

const container = document.getElementById('formRegister-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Notifcacao />
      <FormRegister />
    </SnackbarProvider>
  )
}
