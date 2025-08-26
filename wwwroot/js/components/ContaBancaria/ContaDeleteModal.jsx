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

function ContaDeleteModal({ open, onClose, contaId }) {
  const [conta, setConta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    if (open && contaId) {
      setLoading(true)
      setError(null)
      setDeleteError(null)
      axios
        .get(`/api/Contasapi/${contaId}`)
        .then((res) => setConta(res.data))
        .catch(() => {
          setError('Erro ao carregar os dados da conta.')
          const eventoErro = new CustomEvent('onNotificacao', {
            detail: {
              mensagem: 'Erro ao carregar os dados da conta.',
              variant: 'error',
            },
          })
          window.dispatchEvent(eventoErro)
        })
        .finally(() => setLoading(false))
    }
  }, [contaId, open])

  const handleDelete = async () => {
    try {
      setDeleteError(null)
      await axios.delete(`/api/Contas/${contaId}`)
      const eventoSucesso = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Conta excluída com sucesso.',
          variant: 'success',
        },
      })
      window.dispatchEvent(eventoSucesso)
      onClose()
      window.atualizarTabelaContas?.(contaId)
    } catch (error) {
      let errorMessage = 'Erro ao excluir Conta.'

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage =
              error.response.data?.message ||
              'Não é possível excluir esta Conta'
            break
          case 404:
            errorMessage = 'Conta não encontrada'
            break
          case 500:
            errorMessage = 'Erro interno'
            break
          default:
            errorMessage = 'Erro inesperado'
        }
      } else if (error.request) {
        errorMessage = 'Sem responsta do servidor - verifique a conexão'
      } else {
        errorMessage = error.message || 'Erro ao enviar requisição'
      }

      setDeleteError(errorMessage)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
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
          width: 400,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Typography variant="h4" justifyContent="center" gutterBottom>
              Confirma a exclusão?
            </Typography>
            <Divider
              sx={{ borderBottomWidth: 2, borderColor: 'grey.400', my: 2 }}
            />

            {deleteError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {deleteError}
              </Alert>
            )}
            <Typography fontSize={15} justifyContent="center">
              <strong>Descrição:</strong> {conta.descricao} <br />
              <strong>Número:</strong> {conta.numeroConta || '---'} <br />
              <strong>Banco:</strong> {conta.banco || '---'}
            </Typography>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                variant="contained"
                color="error"
                disabled={!!deleteError}
              >
                Excluir
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  )
}

export default ContaDeleteModal
