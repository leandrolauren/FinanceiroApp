import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import AppWrapper from './AppWrapper'
import { useSnackbar } from 'notistack'

function Notificacao() {
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (window.__notificacao_sucesso) {
      enqueueSnackbar(window.__notificacao_sucesso, { variant: 'success' })
      window.__notificacao_sucesso = null
    }
    if (window.__notificacao_alerta) {
      enqueueSnackbar(window.__notificacao_alerta, { variant: 'warning' })
      window.__notificacao_alerta = null
    }
    if (window.__notificacao_erro) {
      enqueueSnackbar(window.__notificacao_erro, { variant: 'error' })
      window.__notificacao_erro = null
    }
  }, [])

  return null
}

const root = document.getElementById('notificacao_root')
if (root) {
  createRoot(root).render(
    <AppWrapper>
      <Notificacao />
    </AppWrapper>,
  )
}
