import React, { useState } from 'react'
import { Box, Typography, Button, Alert, Modal, Divider } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { createRoot } from 'react-dom/client'
import AppWrapper from '../Shared/AppWrapper'

function PlanoContaDeleteModal({ open, onClose, conta }) {
  const [deleteError, setDeleteError] = useState(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleDelete = async () => {
    try {
      setDeleteError(null)
      await axios.delete(`/PlanoContas/DeleteConfirmed/${conta.id}`)
      enqueueSnackbar('Plano de Contas excluído com sucesso!', {
        variant: 'success',
      })
      onClose()
      window.atualizarTabelaPlanoContas?.(conta.id)
    } catch (err) {
      let errorMessage = 'Erro ao excluir Plano de Contas'
      let variant = 'error'

      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage =
              err.response.data?.message ||
              'Não é possível excluir este plano de contas'
            break
          case 404:
            errorMessage = 'Plano de Contas não encontrado'
            break
          case 500:
            errorMessage = 'Erro interno no servidor'
            break
          default:
            errorMessage = 'Ocorreu um erro inesperado'
        }
      } else if (err.request) {
        errorMessage = 'Sem resposta do servidor - verifique sua conexão'
      } else {
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
        <Typography variant="h4" justifyContent="center" gutterBottom>
          Confirma a exclusão?
        </Typography>
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
      </Box>
    </Modal>
  )
}

const container = document.getElementById('plano-conta-delete-modal-root')
if (container) {
  const root = createRoot(container)

  const showModal = (conta) => {
    const ModalWrapper = () => {
      const [open, setOpen] = useState(true)
      return (
        <AppWrapper>
          <PlanoContaDeleteModal
            open={open}
            conta={conta}
            onClose={() => setOpen(false)}
          />
        </AppWrapper>
      )
    }

    root.render(<ModalWrapper />)
  }

  window.abrirModalExclusaoPlanoConta = showModal
}
