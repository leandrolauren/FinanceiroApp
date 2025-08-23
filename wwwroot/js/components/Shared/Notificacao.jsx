import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import AppWrapper from './AppWrapper'
import { useSnackbar } from 'notistack'

function Notificacao() {
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const handleNotificacao = (event) => {
      const { mensagem, variant } = event.detail
      enqueueSnackbar(mensagem, { variant })
    }

    window.addEventListener('onNotificacao', handleNotificacao)

    return () => {
      window.removeEventListener('onNotificacao', handleNotificacao)
    }
  }, [enqueueSnackbar])

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
