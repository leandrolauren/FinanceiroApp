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

function LancamentoDeleteModal({ open, onClose, lancamentoId }) {
  const [lancamento, setLancamento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && lancamentoId) {
      setLoading(true)
      axios
        .get(`/api/Lancamentos/${lancamentoId}`)
        .then((res) => setLancamento(res.data.data))
        .catch((error) => {
          setError(
            error.response.data.message ||
              'Erro ao carregar os dados do lançamento.',
          )
          showNotification(
            error.response.data.message ||
              'Erro ao carregar os dados do lançamento.',
            'error',
          )
        })
        .finally(() => setLoading(false))
    }
  }, [lancamentoId, open])

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/lancamentos/${lancamentoId}`)
      showNotification('Lançamento excluído com sucesso.', 'success')
      onClose(true)
    } catch (error) {
      showNotification(
        err.response.data.message || 'Erro ao excluir lançamento.',
        'error',
      )
      onClose(false)
      setError(err.response.data.message || 'Erro ao excluir lançamento.')
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
          <>
            <Typography sx={{ my: 2 }}>
              Tem certeza que deseja excluir o lançamento?
            </Typography>
            <Box sx={{ my: 2 }}>
              <Typography>
                <strong>Descrição:</strong>{' '}
                {lancamento?.descricao || 'Carregando...'}
              </Typography>
              <Typography>
                <strong>Pessoa:</strong>{' '}
                {lancamento?.pessoa.nome || 'Carregando...'}
              </Typography>
              <Typography>
                <strong>Valor:</strong> {lancamento?.valor || 'Carregando...'}
              </Typography>
            </Box>
          </>
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

export default LancamentoDeleteModal
