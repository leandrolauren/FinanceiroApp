import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material'
import axios from 'axios'

const buildTree = (list) => {
  const map = {}
  const roots = []
  list.forEach((item) => {
    map[item.id] = { ...item, filhos: [] }
  })
  list.forEach((item) => {
    if (item.planoContasPaiId && map[item.planoContasPaiId]) {
      map[item.planoContasPaiId].filhos.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })
  return roots
}
const renderTreeItems = (nodes, level = 0) => {
  return nodes.flatMap((node) => [
    <MenuItem
      key={node.id}
      value={node.id}
      sx={{ paddingLeft: `${1 + level * 2}rem` }}
    >
      {node.descricao}
    </MenuItem>,
    ...(node.filhos.length > 0 ? renderTreeItems(node.filhos, level + 1) : []),
  ])
}

function PlanoContaMigrateModal({ open, onClose, planoOrigem }) {
  const [destinationId, setDestinationId] = useState('')
  const [potentialDestinations, setPotentialDestinations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setDestinationId('')
      setError(null)
      setLoading(true)

      axios
        .get('/api/planoContas/pais')
        .then((response) => {
          const allAccounts = response.data
          const parentIds = new Set(
            allAccounts.map((p) => p.planoContasPaiId).filter(Boolean),
          )

          const filtered = allAccounts.filter(
            (p) =>
              p.id !== planoOrigem.id &&
              p.tipo === planoOrigem.tipo &&
              !parentIds.has(p.id),
          )
          setPotentialDestinations(filtered)
        })
        .catch((err) => {
          setError(err.response)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, planoOrigem])

  const handleMigrate = async () => {
    setLoading(true)
    setError(null)
    try {
      await axios.post(`/api/planoContas/${planoOrigem.id}/migrar`, {
        planoContaDestinoId: destinationId,
      })

      const eventoSucesso = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Lançamentos migrados com sucesso!',
          variant: 'success',
        },
      })
      window.dispatchEvent(eventoSucesso)

      onClose(true)
    } catch (err) {
      setError(
        err.response?.message || 'Ocorreu um erro ao migrar os lançamentos.',
      )
    } finally {
      setLoading(false)
    }
  }

  const destinationTree = buildTree(potentialDestinations)

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>Migrar Lançamentos</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Plano de Contas de Origem"
          value={planoOrigem?.descricao || ''}
          fullWidth
          disabled
          sx={{ mb: 3, mt: 1 }}
        />

        {loading && (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <TextField
            select
            label="Migrar Para o Plano de Contas"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            fullWidth
            required
            helperText="Apenas contas do mesmo tipo e que não sejam pais são exibidas."
          >
            {destinationTree.length > 0 ? (
              renderTreeItems(destinationTree)
            ) : (
              <MenuItem disabled>Nenhum destino válido encontrado.</MenuItem>
            )}
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose(false)}
          color="secondary"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleMigrate}
          color="primary"
          variant="contained"
          disabled={!destinationId || loading}
        >
          {loading ? 'Migrando...' : 'Confirmar Migração'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PlanoContaMigrateModal
