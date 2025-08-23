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
import { useSnackbar } from 'notistack'
import { createRoot } from 'react-dom/client'
import AppWrapper from '../Shared/AppWrapper'

function ContaDeleteModal({ open, onClose, contaId }) {
  const [conta, setConta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (open && contaId) {
      setLoading(true)
      setError(null)
      setDeleteError(null)
      axios
        .get(`/api/Contas/${contaId}`)
        .then((res) => setConta(res.data))
        .catch(() => {
          setError('Erro ao carregar os dados da conta.')
          enqueueSnackbar('Erro ao carregar os dados da conta!', {
            variant: 'error',
          })
        })
        .finally(() => setLoading(false))
    }
  }, [contaId, open])

  const handleDelete = async () => {
    try {
      setDeleteError(null)
      await axios.delete(`/api/Contas/Delete/${contaId}`)
      enqueueSnackbar('Conta excluída com sucesso.', { variant: 'success' })
      onClose()
      window.atualizarTabelaContas?.(contaId)
    } catch (error) {
      let errorMessage = 'Erro ao excluir Conta.'
      let variant = 'error'

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
      enqueueSnackbar(errorMessage, {
        variant,
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      })
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

const container = document.getElementById('conta-delete-modal-root')
if (container) {
  const root = createRoot(container)

  const showModal = (contaId) => {
    const ModalWrapper = () => {
      const [open, setOpen] = useState(true)
      return (
        <AppWrapper>
          <ContaDeleteModal
            open={open}
            contaId={contaId}
            onClose={() => setOpen(false)}
          />
        </AppWrapper>
      )
    }

    root.render(<ModalWrapper />)
  }

  window.abrirModalExclusaoConta = showModal
}
