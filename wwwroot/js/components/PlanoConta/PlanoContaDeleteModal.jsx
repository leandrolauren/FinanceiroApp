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

function PlanoContaDeleteModal({ open, onClose, contaId }) {
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
        .get(`/PlanoContas/GetPlanoContaEx/${contaId}`)
        .then((res) => setConta(res.data))
        .catch((err) => {
          const errorMsg =
            err.response?.data?.message ||
            'Erro ao carregar os dados do Plano de Contas'
          setError(errorMsg)
          enqueueSnackbar(errorMsg, {
            variant: 'error',
            autoHideDuration: 5000,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          })
        })
        .finally(() => setLoading(false))
    }
  }, [contaId, open])

  const handleDelete = async () => {
    try {
      setDeleteError(null)
      await axios.delete(`/PlanoContas/DeleteConfirmed/${contaId}`)
      enqueueSnackbar('Plano de Contas excluído com sucesso!', {
        variant: 'success',
      })
      onClose()
      window.atualizarTabelaPlanoContas?.(contaId)
    } catch (err) {
      let errorMessage = 'Erro ao excluir Plano de Contas'
      let variant = 'error'

      // Tratamento específico para diferentes tipos de erro
      if (err.response) {
        // Erros com resposta do backend
        switch (err.response.status) {
          case 400: // Bad Request
            errorMessage =
              err.response.data?.message ||
              'Não é possível excluir este plano de contas'
            break
          case 404: // Not Found
            errorMessage = 'Plano de Contas não encontrado'
            break
          case 500: // Server Error
            errorMessage = 'Erro interno no servidor'
            break
          default:
            errorMessage = 'Ocorreu um erro inesperado'
        }
      } else if (err.request) {
        // Erros sem resposta do servidor
        errorMessage = 'Sem resposta do servidor - verifique sua conexão'
      } else {
        // Outros erros
        errorMessage = err.message || 'Erro ao configurar a requisição'
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

            {/* Exibe mensagem de erro específica da exclusão */}
            {deleteError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {deleteError}
              </Alert>
            )}

            <Divider
              sx={{ borderBottomWidth: 2, borderColor: 'grey.400', my: 2 }}
            />
            <Typography fontSize={18} justifyContent="center">
              <strong>Descrição:</strong> {conta.descricao} <br />
              <strong>Tipo:</strong> {conta.tipo || '---'} <br />
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

const container = document.getElementById('plano-conta-delete-modal-root')
if (container) {
  const root = createRoot(container)

  const showModal = (contaId) => {
    const ModalWrapper = () => {
      const [open, setOpen] = useState(true)
      return (
        <AppWrapper>
          <PlanoContaDeleteModal
            open={open}
            contaId={contaId}
            onClose={() => setOpen(false)}
          />
        </AppWrapper>
      )
    }

    root.render(<ModalWrapper />)
  }

  window.abrirModalExclusaoPlanoConta = showModal
}
