import React, { useState, useEffect } from 'react'
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

function ContaDeleteModal({ open, onClose, contaId }) {
  const [conta, setConta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && contaId) {
      setLoading(true)
      setError(null)
      axios
        .get(`/api/Contas/${contaId}`)
        .then((response) => setConta(response.data.data))
        .catch((error) => {
          setError('Erro ao carregar os dados da conta.')
          showNotification(
            error.response.data.message ||
              'Erro ao carregar os dados da conta.',
            'error',
          )
        })
        .finally(() => setLoading(false))
    }
  }, [contaId, open])

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/Contas/${contaId}`)

      if (response.data.success) {
        showNotification('Conta excluída com sucesso.', 'success')
        onClose(true)
      } else {
        const errorMessage =
          response.data.message || 'Ocorreu um erro ao excluir a conta.'
        showNotification(errorMessage, 'error')
        setError(errorMessage)
        onClose(false)
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Erro de comunicação ao excluir a conta.'
      showNotification(errorMessage, 'error')
      setError(errorMessage)
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
            Tem certeza que deseja excluir a conta:{' '}
            <strong>{conta?.descricao || 'Carregando...'}</strong>?
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

export default ContaDeleteModal
