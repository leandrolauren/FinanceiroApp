import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  MenuItem,
  Alert,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
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
const sortTree = (nodes) => {
  nodes.sort((a, b) => a.descricao.localeCompare(b.descricao))
  nodes.forEach((node) => {
    if (node.filhos.length > 0) sortTree(node.filhos)
  })
  return nodes
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

const PlanoContaEditForm = ({ planoContaId }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [planosPaiFiltrados, setPlanosPaiFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!planoContaId) {
      setError('ID do plano de contas não fornecido.')
      setPageLoading(false)
      return
    }

    const fetchPlanoAtual = axios.get(`/api/planoContas/${planoContaId}`)
    const fetchPlanosPai = axios.get('/api/planoContas/pais')
    const fetchDescendentes = axios.get(
      `/api/planoContas/${planoContaId}/descendentes`,
    )

    Promise.all([fetchPlanoAtual, fetchPlanosPai, fetchDescendentes])
      .then(([planoAtualResponse, planosPaiResponse, descendentesResponse]) => {
        const plano = planoAtualResponse.data
        const todosPlanosPai = planosPaiResponse.data
        const idsDescendentes = descendentesResponse.data

        setFormData({
          descricao: plano.descricao,
          tipo: plano.tipo,
          planoContasPaiId: plano.planoContasPaiId || '',
        })

        const idsInvalidos = new Set([
          ...idsDescendentes,
          parseInt(planoContaId, 10),
        ])

        setPlanosPaiFiltrados(
          todosPlanosPai.filter(
            (p) => p.tipo === plano.tipo && !idsInvalidos.has(p.id),
          ),
        )
      })
      .catch((err) => {
        setError('Erro ao carregar dados do plano de contas.')
        console.error(err)
      })
      .finally(() => {
        setPageLoading(false)
      })
  }, [planoContaId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const sendUpdateRequest = async (confirmarMigracao = false) => {
    const dadosParaEnviar = {
      descricao: formData.descricao,
      planoContasPaiId: formData.planoContasPaiId || null,
    }

    let url = `/api/planoContas/${planoContaId}`
    if (confirmarMigracao) {
      url += '?confirmarMigracao=true'
    }

    return axios.put(url, dadosParaEnviar)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await sendUpdateRequest(false)
      const eventoSucesso = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Plano de Contas atualizado com sucesso.',
          variant: 'success',
        },
      })
      window.dispatchEvent(eventoSucesso)
      navigate('/PlanoContas')
    } catch (err) {
      const { response } = err
      if (
        response &&
        response.status === 409 &&
        response.data.requerConfirmacao
      ) {
        if (window.confirm(response.data.message)) {
          try {
            await sendUpdateRequest(true)
            const eventoSucesso = new CustomEvent('onNotificacao', {
              detail: {
                mensagem:
                  'Plano de Contas atualizado e lançamentos migrados com sucesso.',
                variant: 'success',
              },
            })
            window.dispatchEvent(eventoSucesso)
            navigate('/PlanoContas')
          } catch (finalErr) {
            setError(
              finalErr.response?.data?.message ||
                'Erro ao confirmar a migração.',
            )
          }
        }
      } else {
        setError(
          response?.data?.message || 'Erro ao salvar. Verifique os dados.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const arvoreFiltrada = sortTree(buildTree(planosPaiFiltrados))

  if (pageLoading || !formData) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Editar Plano de Contas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            name="descricao"
            label="Descrição"
            value={formData.descricao || ''}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Tipo</FormLabel>
            <RadioGroup row name="tipo" value={formData.tipo || ''}>
              <FormControlLabel
                value={1}
                control={<Radio />}
                label="Receita"
                disabled
              />
              <FormControlLabel
                value={2}
                control={<Radio />}
                label="Despesa"
                disabled
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            name="planoContasPaiId"
            label="Plano de Contas Pai (Opcional)"
            value={formData.planoContasPaiId || ''}
            onChange={handleChange}
            fullWidth
            sx={{ minWidth: 270 }}
          >
            <MenuItem value="">
              <em>Nenhum (Conta Principal)</em>
            </MenuItem>
            {renderTreeItems(arvoreFiltrada)}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/PlanoContas')}
          startIcon={<ArrowBackIcon />}
        >
          Voltar para Lista
        </Button>
      </Box>
    </Box>
  )
}

export default PlanoContaEditForm
