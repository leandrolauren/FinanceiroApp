import React, { useEffect } from 'react'
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

export default Notificacao
