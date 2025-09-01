import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Modal,
  Divider,
} from '@mui/material'
import axios from 'axios'

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  })
  window.dispatchEvent(event)
}

function PlanoContaDeleteModal({ open, onClose, planoId }) {
  const [plano, setPlano] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && planoId) {
      setLoading(true)
      setError(null)
      axios
        .get(`/api/PlanoContas/${planoId}`)
        .then((response) => {
          setPlano(response.data)
        })
        .catch(() => {
          setError('Erro ao carregar os dados do Plano de Contas.')
          showNotification(
            'Erro ao carregar os dados do Plano de Contas.',
            'error',
          )
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [planoId, open])

  const handleDelete = async () => {
    try {
      setError(null)

      await axios.delete(`/api/PlanoContas/${planoId}`)
      showNotification('Plano de Contas excluído com sucesso.', 'success')

      onClose(true)
    } catch (error) {
      showNotification(
        error.response.data.message || 'Erro ao excluir Plano de Contas.',
        'error',
      )
      setError(
        error.response?.data?.message || 'Erro ao excluir Plano de Contas.',
      )
      onClose(false)
    }
  }

  const handleClose = () => {
    onClose(false)
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          width: { xs: '90%', sm: 450 },
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Confirmar Exclusão
        </Typography>
        <Divider sx={{ my: 2 }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Typography sx={{ my: 2 }}>
            Tem certeza que deseja excluir o plano de contas:{' '}
            <strong>{plano?.descricao || 'Carregando...'}</strong>?
          </Typography>
        )}

        <Box
          sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}
        >
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={loading || error}
          >
            Excluir
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default PlanoContaDeleteModal
