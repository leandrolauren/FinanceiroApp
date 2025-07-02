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

function formatarDataBR(data) {
  if (!data) return '---'
  const d = new Date(data)
  if (isNaN(d)) return '---'
  return d.toLocaleDateString('pt-BR')
}

function LancamentoDeleteModal({ open, onClose, lancamentoId }) {
  const [lancamento, setLancamento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (open && lancamentoId) {
      setLoading(true)
      axios
        .get(`/Lancamentos/Delete/${lancamentoId}`)
        .then((res) => setLancamento(res.data))
        .catch(() => {
          setError('Erro ao carregar os dados do lançamento.')
          enqueueSnackbar('Erro ao carregar os dados do lançamento!', {
            variant: 'error',
          })
        })
        .finally(() => setLoading(false))
    }
  }, [lancamentoId, open])

  const handleDelete = async () => {
    try {
      await axios.delete(`/Lancamentos/DeleteConfirmed/${lancamentoId}`)
      enqueueSnackbar('Lançamento excluído com sucesso.', {
        variant: 'success',
      })
      onClose()
      window.atualizarTabelaLancamentos?.(lancamentoId)
    } catch {
      enqueueSnackbar('Erro ao excluir lançamento.', { variant: 'error' })
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
              <strong>Descrição:</strong> {lancamento.descricao} <br />
              <strong>Dt. Venc.:</strong>{' '}
              {formatarDataBR(lancamento.dataVencimento)}
              <br />
              <strong>Dt. Pagamento:</strong>{' '}
              {formatarDataBR(lancamento.dataPagamento)}
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

const container = document.getElementById('lancamentos-delete-modal-root')
if (container) {
  const root = createRoot(container)

  const showModal = (lancamentoId) => {
    const ModalWrapper = () => {
      const [open, setOpen] = useState(true)
      return (
        <AppWrapper>
          <LancamentoDeleteModal
            open={open}
            lancamentoId={lancamentoId}
            onClose={() => setOpen(false)}
          />
        </AppWrapper>
      )
    }

    root.render(<ModalWrapper />)
  }

  window.abrirModalExclusaoLancamento = showModal
}
