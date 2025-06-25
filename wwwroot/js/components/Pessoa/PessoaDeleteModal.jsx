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

function PessoaDeleteModal({ open, onClose, pessoaId }) {
  const [pessoa, setPessoa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (open && pessoaId) {
      setLoading(true)
      axios
        .get(`/Pessoas/GetPessoa/${pessoaId}`)
        .then((res) => setPessoa(res.data))
        .catch(() => {
          setError('Erro ao carregar os dados da pessoa.')
          enqueueSnackbar('Erro ao carregar os dados da pessoa!', {
            variant: 'error',
          })
        })
        .finally(() => setLoading(false))
    }
  }, [pessoaId, open])

  const handleDelete = async () => {
    try {
      await axios.delete(`/Pessoas/DeleteConfirmed/${pessoaId}`)
      enqueueSnackbar('Pessoa excluída com sucesso.', { variant: 'success' })
      onClose()
      window.atualizarTabelaPessoas?.(pessoaId)
    } catch {
      enqueueSnackbar('Erro ao excluir pessoa.', { variant: 'error' })
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
            <Typography fontSize={15} justifyContent="center">
              <strong>Nome:</strong> {pessoa.nome || pessoa.nomeFantasia} <br />
              <strong>CPF:</strong> {pessoa.cpf || '---'} <br />
              <strong>CNPJ:</strong> {pessoa.cnpj || '---'}
            </Typography>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
                Cancelar
              </Button>
              <Button onClick={handleDelete} variant="contained" color="error">
                Excluir
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  )
}

const container = document.getElementById('pessoa-delete-modal-root')
if (container) {
  const root = createRoot(container)

  const showModal = (pessoaId) => {
    const ModalWrapper = () => {
      const [open, setOpen] = useState(true)
      return (
        <AppWrapper>
          <PessoaDeleteModal
            open={open}
            pessoaId={pessoaId}
            onClose={() => setOpen(false)}
          />
        </AppWrapper>
      )
    }

    root.render(<ModalWrapper />)
  }

  window.abrirModalExclusaoPessoa = showModal
}
