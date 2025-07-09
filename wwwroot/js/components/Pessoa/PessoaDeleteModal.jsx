import React, { useState } from 'react'
import { Box, Typography, Button, Alert, Modal, Divider } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { createRoot } from 'react-dom/client'
import AppWrapper from '../Shared/AppWrapper'

function formatarCpf(cpf) {
  if (!cpf) return ''
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

function formatarCnpj(cnpj) {
  if (!cnpj) return ''
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function PessoaDeleteModal({ open, onClose, pessoa }) {
  const [deleteError, setDeleteError] = useState(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleDelete = async () => {
    try {
      await axios.delete(`/Pessoas/DeleteConfirmed/${pessoa.id}`)
      enqueueSnackbar('Pessoa excluída com sucesso.', { variant: 'success' })
      onClose()
      window.atualizarTabelaPessoas?.(pessoa.id)
    } catch (error) {
      let errorMessage = 'Erro ao excluir pessoa'
      let variant = 'error'

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage =
              error.response.data?.message ||
              'Não é possível excluir esta pessoa'
            break
          case 404:
            errorMessage = 'Pessoa não encontrada'
            break
          case 500:
            errorMessage = 'Erro interno ao processar a solicitação'
            break
          default:
            errorMessage = 'Ocorreu um erro inesperado'
        }
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor - verifique sua conexão'
      } else {
        errorMessage = error.message || 'Erro ao configurar a requisição'
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
        <Typography fontSize={16} justifyContent="center">
          <strong>Nome:</strong> {pessoa.row.nome || pessoa.row.nomeFantasia}{' '}
          <br />
          <strong>Documento:</strong>{' '}
          {formatarCpf(pessoa.row.cpf) || formatarCnpj(pessoa.row.cnpj)}
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

const container = document.getElementById('pessoa-delete-modal-root')
if (container) {
  const root = createRoot(container)

  const showModal = (pessoa) => {
    const ModalWrapper = () => {
      const [open, setOpen] = useState(true)
      return (
        <AppWrapper>
          <PessoaDeleteModal
            open={open}
            pessoa={pessoa}
            onClose={() => setOpen(false)}
          />
        </AppWrapper>
      )
    }

    root.render(<ModalWrapper />)
  }

  window.abrirModalExclusaoPessoa = showModal
}
