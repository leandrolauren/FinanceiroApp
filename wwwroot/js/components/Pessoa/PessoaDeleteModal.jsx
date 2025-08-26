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

function PessoaDeleteModal({ open, onClose, pessoaId }) {
  const [pessoa, setPessoa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && pessoaId) {
      setLoading(true)
      setError(null)
      axios
        .get(`/api/Pessoas/${pessoaId}`)
        .then((response) => {
          setPessoa(response.data)
        })
        .catch(() => {
          setError('Erro ao carregar os dados da pessoa.')
          const eventoErro = new CustomEvent('onNotificacao', {
            detail: {
              mensagem: 'Erro ao carregar os dados da pessoa.',
              variant: 'error',
            },
          })
          window.dispatchEvent(eventoErro)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [pessoaId, open])

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/Pessoas/${pessoaId}`)
      const eventoSucesso = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Pessoa excluída com sucesso.',
          variant: 'success',
        },
      })
      window.dispatchEvent(eventoSucesso)
      onClose(true)
    } catch (err) {
      const eventoErro = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: err.response.data.message || 'Erro ao excluir pessoa.',
          variant: 'error',
        },
      })
      window.dispatchEvent(eventoErro)
      onClose(false)
      setError(err.response.data.message || 'Erro ao excluir pessoa.')
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
            Tem certeza que deseja excluir permanentemente a pessoa:{' '}
            <strong>{pessoa?.nome || 'Carregando...'}</strong>?
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

export default PessoaDeleteModal
